/**
 * Google Drive API Integration
 * Handles folder scanning, file listing, and batch processing
 */

// Imports will be added at the bottom to avoid circular dependency issues

export async function handleGoogleDrive(request, env, corsHeaders) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  switch (action) {
    case 'list-folders':
      return listDriveFolders(request, env, corsHeaders);
    case 'scan-folder':
      return scanFolder(request, env, corsHeaders);
    case 'process-folder':
      return processFolderBatch(request, env, corsHeaders);
    case 'batch-status':
      return getBatchStatus(request, env, corsHeaders);
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

/**
 * List user's Google Drive folders
 */
async function listDriveFolders(request, env, corsHeaders) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Session ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const session = await getValidSession(sessionId, env);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Query for folders in Google Drive
    const query = "mimeType='application/vnd.google-apps.folder' and trashed=false";
    const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime,parents)&orderBy=name`;
    
    const response = await fetch(driveUrl, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch folders');
    }
    
    return new Response(JSON.stringify({
      folders: data.files || [],
      userInfo: session.userInfo
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('List folders error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Scan a specific folder for card image files
 */
async function scanFolder(request, env, corsHeaders) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  const folderId = url.searchParams.get('folderId');
  
  if (!sessionId || !folderId) {
    return new Response(JSON.stringify({ error: 'Session ID and folder ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const session = await getValidSession(sessionId, env);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get all PNG files in the folder
    const query = `'${folderId}' in parents and (name contains '.png' or name contains '.PNG') and trashed=false`;
    const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,size,modifiedTime,webContentLink)&orderBy=name`;
    
    const response = await fetch(driveUrl, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to scan folder');
    }
    
    const files = data.files || [];
    
    // Group files into card pairs (front/back)
    const cardPairs = groupCardFiles(files);
    
    return new Response(JSON.stringify({
      totalFiles: files.length,
      cardPairs: cardPairs.valid,
      unpairedFiles: cardPairs.unpaired,
      validPairs: cardPairs.valid.length,
      errors: cardPairs.errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Scan folder error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Process all valid card pairs in a folder
 */
async function processFolderBatch(request, env, corsHeaders) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  const folderId = url.searchParams.get('folderId');
  
  if (!sessionId || !folderId) {
    return new Response(JSON.stringify({ error: 'Session ID and folder ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const session = await getValidSession(sessionId, env);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // First scan the folder to get card pairs
    const scanResult = await scanFolderInternal(folderId, session, env);
    
    if (scanResult.validPairs === 0) {
      return new Response(JSON.stringify({ 
        error: 'No valid card pairs found in folder',
        details: scanResult
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create batch processing session
    const batchId = crypto.randomUUID();
    const batchData = {
      batchId,
      folderId,
      googleSessionId: sessionId,
      cardPairs: scanResult.cardPairs,
      totalPairs: scanResult.validPairs,
      processed: 0,
      successful: 0,
      failed: 0,
      status: 'starting',
      startTime: new Date().toISOString(),
      results: [],
      errors: []
    };
    
    // Store batch session
    await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 }); // 2 hours
    
    // Start background processing (don't await)
    processBatchInBackground(batchId, batchData, session, env).catch(error => {
      console.error('Background batch processing error:', error);
    });
    
    return new Response(JSON.stringify({
      batchId,
      totalPairs: scanResult.validPairs,
      status: 'started'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Process folder batch error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get batch processing status
 */
async function getBatchStatus(request, env, corsHeaders) {
  const url = new URL(request.url);
  const batchId = url.searchParams.get('batchId');
  
  if (!batchId) {
    return new Response(JSON.stringify({ error: 'Batch ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const batchData = await env.SESSIONS.get(`batch_${batchId}`);
    
    if (!batchData) {
      return new Response(JSON.stringify({ error: 'Batch not found or expired' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const batch = JSON.parse(batchData);
    
    return new Response(JSON.stringify({
      batchId: batch.batchId,
      status: batch.status,
      totalPairs: batch.totalPairs,
      processed: batch.processed,
      successful: batch.successful,
      failed: batch.failed,
      progress: Math.round((batch.processed / batch.totalPairs) * 100),
      startTime: batch.startTime,
      endTime: batch.endTime,
      results: batch.results,
      errors: batch.errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get batch status error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Internal helper functions
 */

async function getValidSession(sessionId, env) {
  try {
    const sessionData = await env.SESSIONS.get(`google_auth_${sessionId}`);
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    
    // Check if token is still valid
    if (Date.now() >= session.expiresAt) {
      // Token expired - would need to refresh (implement if needed)
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

async function scanFolderInternal(folderId, session, env) {
  const query = `'${folderId}' in parents and (name contains '.png' or name contains '.PNG') and trashed=false`;
  const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,size,modifiedTime,webContentLink)&orderBy=name`;
  
  const response = await fetch(driveUrl, {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to scan folder');
  }
  
  const files = data.files || [];
  const cardPairs = groupCardFiles(files);
  
  return {
    totalFiles: files.length,
    cardPairs: cardPairs.valid,
    validPairs: cardPairs.valid.length,
    unpairedFiles: cardPairs.unpaired,
    errors: cardPairs.errors
  };
}

function groupCardFiles(files) {
  const frontFiles = new Map();
  const backFiles = new Map();
  const unpaired = [];
  const errors = [];
  
  // Separate front and back files
  for (const file of files) {
    const name = file.name;
    
    if (name.match(/-F\.(png|PNG)$/i)) {
      const baseName = name.replace(/-F\.(png|PNG)$/i, '');
      frontFiles.set(baseName, file);
    } else if (name.match(/-R\.(png|PNG)$/i)) {
      const baseName = name.replace(/-R\.(png|PNG)$/i, '');
      backFiles.set(baseName, file);
    } else {
      unpaired.push(file);
    }
  }
  
  // Match front and back files
  const valid = [];
  
  for (const [baseName, frontFile] of frontFiles) {
    const backFile = backFiles.get(baseName);
    
    if (backFile) {
      valid.push({
        baseName,
        frontFile,
        backFile,
        totalSize: parseInt(frontFile.size || '0') + parseInt(backFile.size || '0')
      });
      backFiles.delete(baseName); // Remove from back files to avoid duplicates
    } else {
      unpaired.push(frontFile);
      errors.push(`Missing back file for: ${frontFile.name}`);
    }
  }
  
  // Add remaining back files to unpaired
  for (const backFile of backFiles.values()) {
    unpaired.push(backFile);
    errors.push(`Missing front file for: ${backFile.name}`);
  }
  
  return { valid, unpaired, errors };
}

async function processBatchInBackground(batchId, batchData, session, env) {
  try {
    // Update status to processing
    batchData.status = 'processing';
    await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 });
    
    for (let i = 0; i < batchData.cardPairs.length; i++) {
      const cardPair = batchData.cardPairs[i];
      
      try {
        // Download files from Google Drive
        const frontImageData = await downloadDriveFile(cardPair.frontFile.id, session.accessToken);
        const backImageData = await downloadDriveFile(cardPair.backFile.id, session.accessToken);
        
        // Create form data for processing
        const formData = new FormData();
        formData.append('frontImage', new File([frontImageData], cardPair.frontFile.name, { type: 'image/png' }));
        formData.append('backImage', new File([backImageData], cardPair.backFile.name, { type: 'image/png' }));
        
        // Process the card pair using existing process handler
        const processResult = await processCardPair(formData, env);
        
        batchData.results.push({
          baseName: cardPair.baseName,
          sessionId: processResult.sessionId,
          downloadUrl: processResult.downloadUrl,
          status: 'success'
        });
        
        batchData.successful++;
        
      } catch (error) {
        console.error(`Error processing ${cardPair.baseName}:`, error);
        batchData.errors.push({
          baseName: cardPair.baseName,
          error: error.message
        });
        batchData.failed++;
      }
      
      batchData.processed++;
      
      // Update progress every few items
      if (batchData.processed % 5 === 0 || batchData.processed === batchData.totalPairs) {
        await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 });
      }
    }
    
    // Mark as completed
    batchData.status = 'completed';
    batchData.endTime = new Date().toISOString();
    await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 });
    
  } catch (error) {
    console.error('Batch processing failed:', error);
    batchData.status = 'failed';
    batchData.endTime = new Date().toISOString();
    batchData.errors.push({ general: error.message });
    await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 });
  }
}

async function downloadDriveFile(fileId, accessToken) {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  
  return await response.arrayBuffer();
}

async function processCardPair(formData, env) {
  // Create a mock request for the existing process handler
  const mockRequest = new Request('https://dummy.com', {
    method: 'POST',
    body: formData
  });
  
  // Use existing upload and process logic
  const uploadResponse = await handleUpload(mockRequest, env, {});
  const uploadData = await uploadResponse.json();
  
  if (!uploadResponse.ok) {
    throw new Error(uploadData.error || 'Upload failed');
  }
  
  const sessionId = uploadData.sessionId;
  
  // Process the uploaded files
  const processRequest = new Request(`https://dummy.com?sessionId=${sessionId}`, { method: 'POST' });
  const processResponse = await processCard(processRequest, env, {});
  const processData = await processResponse.json();
  
  if (!processResponse.ok) {
    throw new Error(processData.error || 'Processing failed');
  }
  
  return {
    sessionId,
    downloadUrl: `/api/download?sessionId=${sessionId}`
  };
}

// Import the existing handlers
import { handleUpload } from './upload.js';
import { processCard } from './process.js';