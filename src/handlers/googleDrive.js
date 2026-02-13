/**
 * Google Drive API Integration
 * Handles folder scanning, file listing, and batch processing
 */

// Imports will be added at the bottom to avoid circular dependency issues

export async function handleGoogleDrive(request, env, corsHeaders, ctx) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  switch (action) {
    case 'list-folders':
      return listDriveFolders(request, env, corsHeaders);
    case 'scan-folder':
      return scanFolder(request, env, corsHeaders);
    case 'process-folder':
      return processFolderBatch(request, env, corsHeaders, ctx);
    case 'process-next':
      return processNextCard(request, env, corsHeaders);
    case 'batch-status':
      return getBatchStatus(request, env, corsHeaders);
    case 'abort-batch':
      return abortBatch(request, env, corsHeaders);
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

/**
 * List user's Google Drive folders with pagination and shared folders
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
    
    // Fetch all folders with pagination
    const allFolders = [];
    let pageToken = null;
    let pageCount = 0;
    const maxPages = 50; // Safety limit to prevent infinite loops
    
    // Try fetching with shared drives support first, fallback to user drive only
    const fetchFoldersPage = async (token) => {
      const query = "mimeType='application/vnd.google-apps.folder' and trashed=false";
      const params = new URLSearchParams({
        q: query,
        fields: 'nextPageToken,files(id,name,modifiedTime,parents)',
        pageSize: '1000',
        supportsAllDrives: 'true',
        includeItemsFromAllDrives: 'true'
      });
      
      if (token) {
        params.set('pageToken', token);
      }
      
      const driveUrl = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
      
      const response = await fetch(driveUrl, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.json();
    };
    
    do {
      console.log(`Fetching folders page ${pageCount + 1}, current count: ${allFolders.length}`);
      
      const data = await fetchFoldersPage(pageToken);
      
      if (data.error) {
        console.error('Drive API error:', JSON.stringify(data.error));
        throw new Error(data.error.message || 'Failed to fetch folders');
      }
      
      if (data.files) {
        allFolders.push(...data.files);
      }
      
      pageToken = data.nextPageToken;
      pageCount++;
      
      console.log(`Page ${pageCount} fetched, got ${data.files?.length || 0} folders, nextPageToken: ${pageToken ? 'yes' : 'no'}`);
      
    } while (pageToken && pageCount < maxPages);
    
    console.log(`Total folders fetched: ${allFolders.length} in ${pageCount} pages`);
    
    // Build folder hierarchy/paths
    const folderMap = new Map();
    allFolders.forEach(f => folderMap.set(f.id, f));
    
    // Calculate path for each folder
    for (const folder of allFolders) {
      folder.path = buildFolderPath(folder, folderMap);
      folder.depth = (folder.path.match(/ \/ /g) || []).length;
    }
    
    // Sort by path for hierarchical display
    allFolders.sort((a, b) => a.path.localeCompare(b.path));
    
    return new Response(JSON.stringify({
      folders: allFolders,
      userInfo: session.userInfo,
      totalCount: allFolders.length
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
 * Build full path for a folder
 */
function buildFolderPath(folder, folderMap, visited = new Set()) {
  // Prevent infinite loops
  if (visited.has(folder.id)) {
    return folder.name;
  }
  visited.add(folder.id);
  
  if (!folder.parents || folder.parents.length === 0) {
    return folder.name;
  }
  
  const parentId = folder.parents[0];
  const parent = folderMap.get(parentId);
  
  if (parent) {
    const parentPath = buildFolderPath(parent, folderMap, visited);
    return `${parentPath} / ${folder.name}`;
  }
  
  // Parent is root or shared drive
  return `My Drive / ${folder.name}`;
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
async function processFolderBatch(request, env, corsHeaders, ctx) {
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
      aborted: false,
      startTime: new Date().toISOString(),
      results: [],
      errors: [],
      logs: [`[${new Date().toISOString()}] Batch started with ${scanResult.validPairs} card pairs`]
    };
    
    // Store batch session - processing will be done one card at a time via process-next
    await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 }); // 2 hours
    
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
 * Process the next card in a batch (one card per request to avoid timeouts)
 */
async function processNextCard(request, env, corsHeaders) {
  const url = new URL(request.url);
  const batchId = url.searchParams.get('batchId');
  
  if (!batchId) {
    return new Response(JSON.stringify({ error: 'Batch ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const batchDataStr = await env.SESSIONS.get(`batch_${batchId}`);
    
    if (!batchDataStr) {
      return new Response(JSON.stringify({ error: 'Batch not found or expired' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const batchData = JSON.parse(batchDataStr);
    
    // Check if aborted
    if (batchData.aborted) {
      batchData.status = 'aborted';
      batchData.endTime = new Date().toISOString();
      addLog(batchData, 'Batch aborted by user');
      await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 });
      return new Response(JSON.stringify({ status: 'aborted', batchData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Check if already completed
    if (batchData.processed >= batchData.totalPairs) {
      batchData.status = 'completed';
      batchData.endTime = new Date().toISOString();
      addLog(batchData, `Batch completed: ${batchData.successful} successful, ${batchData.failed} failed`);
      await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 });
      return new Response(JSON.stringify({ status: 'completed', batchData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get session for Google Drive access
    const session = await getValidSession(batchData.googleSessionId, env);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Google session expired. Please reconnect.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Process the next card
    const cardIndex = batchData.processed;
    const cardPair = batchData.cardPairs[cardIndex];
    
    batchData.status = 'processing';
    addLog(batchData, `Processing ${cardIndex + 1}/${batchData.totalPairs}: ${cardPair.baseName}`);
    
    try {
      // Download files from Google Drive
      addLog(batchData, `Downloading front: ${cardPair.frontFile.name}`);
      const frontImageData = await downloadDriveFile(cardPair.frontFile.id, session.accessToken);
      addLog(batchData, `Downloaded front: ${(frontImageData.byteLength / 1024).toFixed(1)} KB`);
      
      addLog(batchData, `Downloading back: ${cardPair.backFile.name}`);
      const backImageData = await downloadDriveFile(cardPair.backFile.id, session.accessToken);
      addLog(batchData, `Downloaded back: ${(backImageData.byteLength / 1024).toFixed(1)} KB`);
      
      // Create form data for processing
      const formData = new FormData();
      formData.append('frontImage', new File([frontImageData], cardPair.frontFile.name, { type: 'image/png' }));
      formData.append('backImage', new File([backImageData], cardPair.backFile.name, { type: 'image/png' }));
      
      // Process the card pair
      addLog(batchData, `Generating 3D model for ${cardPair.baseName}`);
      const processResult = await processCardPair(formData, env);
      
      // Upload GLB to Google Drive
      addLog(batchData, `Uploading GLB to Google Drive: ${cardPair.baseName}.glb`);
      const glbFileName = `${cardPair.baseName}.glb`;
      
      const glbObject = await env.R2_BUCKET.get(`${processResult.sessionId}/card.glb`);
      if (glbObject) {
        const glbData = await glbObject.arrayBuffer();
        const uploadResult = await uploadToDrive(glbData, glbFileName, batchData.folderId, session.accessToken);
        addLog(batchData, `Uploaded to Drive: ${glbFileName} (${(glbData.byteLength / 1024).toFixed(1)} KB)`);
        
        batchData.results.push({
          baseName: cardPair.baseName,
          sessionId: processResult.sessionId,
          downloadUrl: processResult.downloadUrl,
          driveFileId: uploadResult.id,
          driveFileName: glbFileName,
          status: 'success'
        });
      } else {
        batchData.results.push({
          baseName: cardPair.baseName,
          sessionId: processResult.sessionId,
          downloadUrl: processResult.downloadUrl,
          status: 'success',
          driveUpload: false
        });
      }
      
      batchData.successful++;
      addLog(batchData, `SUCCESS: ${cardPair.baseName}`);
      
    } catch (error) {
      console.error(`Error processing ${cardPair.baseName}:`, error);
      addLog(batchData, `FAILED: ${cardPair.baseName} - ${error.message}`);
      batchData.errors.push({
        baseName: cardPair.baseName,
        error: error.message
      });
      batchData.failed++;
    }
    
    batchData.processed++;
    
    // Check if this was the last card
    if (batchData.processed >= batchData.totalPairs) {
      batchData.status = 'completed';
      batchData.endTime = new Date().toISOString();
      addLog(batchData, `Batch completed: ${batchData.successful} successful, ${batchData.failed} failed`);
    }
    
    // Save updated batch data
    await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 });
    
    return new Response(JSON.stringify({
      status: batchData.status,
      processed: batchData.processed,
      totalPairs: batchData.totalPairs,
      successful: batchData.successful,
      failed: batchData.failed,
      progress: Math.round((batchData.processed / batchData.totalPairs) * 100),
      hasMore: batchData.processed < batchData.totalPairs,
      lastProcessed: cardPair.baseName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Process next card error:', error);
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
      aborted: batch.aborted || false,
      totalPairs: batch.totalPairs,
      processed: batch.processed,
      successful: batch.successful,
      failed: batch.failed,
      progress: Math.round((batch.processed / batch.totalPairs) * 100),
      startTime: batch.startTime,
      endTime: batch.endTime,
      results: batch.results,
      errors: batch.errors,
      logs: batch.logs || []
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
 * Abort a running batch process
 */
async function abortBatch(request, env, corsHeaders) {
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
    
    // Set abort flag
    batch.aborted = true;
    batch.logs = batch.logs || [];
    batch.logs.push(`[${new Date().toISOString()}] Abort requested by user`);
    
    await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batch), { expirationTtl: 7200 });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Abort signal sent. Processing will stop after current item.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Abort batch error:', error);
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
  
  // Patterns for front and back files (supports -F, _F, -R, _R)
  const frontPattern = /[-_]F\.(png|PNG)$/i;
  const backPattern = /[-_]R\.(png|PNG)$/i;
  
  // Separate front (-F or _F) and back (-R or _R) files
  for (const file of files) {
    const name = file.name;
    
    if (frontPattern.test(name)) {
      const baseName = name.replace(/[-_]F\.(png|PNG)$/i, '');
      frontFiles.set(baseName, file);
    } else if (backPattern.test(name)) {
      const baseName = name.replace(/[-_]R\.(png|PNG)$/i, '');
      backFiles.set(baseName, file);
    } else {
      unpaired.push(file);
      errors.push(`Invalid naming: ${file.name} (must end with -F.png, _F.png, -R.png, or _R.png)`);
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
      backFiles.delete(baseName);
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

// Helper to add log entry
function addLog(batchData, message) {
  batchData.logs = batchData.logs || [];
  batchData.logs.push(`[${new Date().toISOString()}] ${message}`);
  // Keep only last 100 log entries to prevent KV size issues
  if (batchData.logs.length > 100) {
    batchData.logs = batchData.logs.slice(-100);
  }
}

async function processBatchInBackground(batchId, batchData, session, env) {
  try {
    // Update status to processing
    batchData.status = 'processing';
    addLog(batchData, 'Processing started');
    await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 });
    
    for (let i = 0; i < batchData.cardPairs.length; i++) {
      // Check for abort signal (re-read from KV)
      const currentBatchData = await env.SESSIONS.get(`batch_${batchId}`);
      if (currentBatchData) {
        const currentBatch = JSON.parse(currentBatchData);
        if (currentBatch.aborted) {
          addLog(batchData, `Aborted by user at item ${i + 1}/${batchData.cardPairs.length}`);
          batchData.status = 'aborted';
          batchData.aborted = true;
          batchData.endTime = new Date().toISOString();
          await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 });
          return;
        }
      }
      
      const cardPair = batchData.cardPairs[i];
      addLog(batchData, `Processing ${i + 1}/${batchData.cardPairs.length}: ${cardPair.baseName}`);
      
      try {
        // Download files from Google Drive
        addLog(batchData, `Downloading front: ${cardPair.frontFile.name}`);
        const frontImageData = await downloadDriveFile(cardPair.frontFile.id, session.accessToken);
        addLog(batchData, `Downloaded front: ${(frontImageData.byteLength / 1024).toFixed(1)} KB`);
        
        addLog(batchData, `Downloading back: ${cardPair.backFile.name}`);
        const backImageData = await downloadDriveFile(cardPair.backFile.id, session.accessToken);
        addLog(batchData, `Downloaded back: ${(backImageData.byteLength / 1024).toFixed(1)} KB`);
        
        // Create form data for processing
        const formData = new FormData();
        formData.append('frontImage', new File([frontImageData], cardPair.frontFile.name, { type: 'image/png' }));
        formData.append('backImage', new File([backImageData], cardPair.backFile.name, { type: 'image/png' }));
        
        // Process the card pair using existing process handler
        addLog(batchData, `Generating 3D model for ${cardPair.baseName}`);
        const processResult = await processCardPair(formData, env);
        
        // Download GLB from R2 and upload to Google Drive
        addLog(batchData, `Uploading GLB to Google Drive: ${cardPair.baseName}.glb`);
        const glbFileName = `${cardPair.baseName}.glb`;
        
        // Get GLB from R2
        const glbObject = await env.R2_BUCKET.get(`${processResult.sessionId}/card.glb`);
        if (glbObject) {
          const glbData = await glbObject.arrayBuffer();
          
          // Upload to same folder in Google Drive
          const uploadResult = await uploadToDrive(glbData, glbFileName, batchData.folderId, session.accessToken);
          addLog(batchData, `Uploaded to Drive: ${glbFileName} (${(glbData.byteLength / 1024).toFixed(1)} KB)`);
          
          batchData.results.push({
            baseName: cardPair.baseName,
            sessionId: processResult.sessionId,
            downloadUrl: processResult.downloadUrl,
            driveFileId: uploadResult.id,
            driveFileName: glbFileName,
            status: 'success'
          });
        } else {
          addLog(batchData, `Warning: Could not find GLB in R2 for ${cardPair.baseName}`);
          batchData.results.push({
            baseName: cardPair.baseName,
            sessionId: processResult.sessionId,
            downloadUrl: processResult.downloadUrl,
            status: 'success',
            driveUpload: false
          });
        }
        
        batchData.successful++;
        addLog(batchData, `SUCCESS: ${cardPair.baseName} -> ${processResult.sessionId}`);
        
      } catch (error) {
        console.error(`Error processing ${cardPair.baseName}:`, error);
        addLog(batchData, `FAILED: ${cardPair.baseName} - ${error.message}`);
        batchData.errors.push({
          baseName: cardPair.baseName,
          error: error.message
        });
        batchData.failed++;
      }
      
      batchData.processed++;
      
      // Update progress after every item (for better real-time logs)
      await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 });
    }
    
    // Mark as completed
    batchData.status = 'completed';
    batchData.endTime = new Date().toISOString();
    addLog(batchData, `Batch completed: ${batchData.successful} successful, ${batchData.failed} failed`);
    await env.SESSIONS.put(`batch_${batchId}`, JSON.stringify(batchData), { expirationTtl: 7200 });
    
  } catch (error) {
    console.error('Batch processing failed:', error);
    addLog(batchData, `FATAL ERROR: ${error.message}`);
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

/**
 * Upload a file to Google Drive
 * @param {ArrayBuffer} fileData - The file data to upload
 * @param {string} fileName - Name for the file
 * @param {string} folderId - Parent folder ID
 * @param {string} accessToken - Google OAuth access token
 * @returns {Object} Upload result with file ID
 */
async function uploadToDrive(fileData, fileName, folderId, accessToken) {
  // Use multipart upload for files with metadata
  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'model/gltf-binary'
  };
  
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelimiter = "\r\n--" + boundary + "--";
  
  // Convert ArrayBuffer to base64
  const base64Data = arrayBufferToBase64(fileData);
  
  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: model/gltf-binary\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    base64Data +
    closeDelimiter;
  
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`
    },
    body: multipartRequestBody
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to upload to Drive: ${result.error?.message || response.statusText}`);
  }
  
  return result;
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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