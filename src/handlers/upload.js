import { validateFileName, generateSessionId, storeFile } from '../utils/helpers.js';

export async function handleUpload(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }
  
  try {
    const formData = await request.formData();
    const frontFile = formData.get('frontImage');
    const backFile = formData.get('backImage');
    const overlayFile = formData.get('overlay');
    const copyrightEnabled = formData.get('copyrightEnabled') === 'on';
    const copyrightText = formData.get('copyrightText') || '';
    
    // Validate required files
    if (!frontFile || !backFile) {
      return new Response(JSON.stringify({ 
        error: 'Both front and back images are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate file types
    if (!frontFile.type.includes('image/png') || !backFile.type.includes('image/png')) {
      return new Response(JSON.stringify({ 
        error: 'Images must be PNG format' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate file extensions (PNG only)
    if (!validateFileName(frontFile.name, 'F') || !validateFileName(backFile.name, 'R')) {
      return new Response(JSON.stringify({ 
        error: 'Images must be PNG format' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate file sizes
    const maxSize = parseInt(env.MAX_FILE_SIZE || '10485760'); // 10MB default
    if (frontFile.size > maxSize || backFile.size > maxSize) {
      return new Response(JSON.stringify({ 
        error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate overlay if present
    if (overlayFile && !overlayFile.type.includes('svg')) {
      return new Response(JSON.stringify({ 
        error: 'Overlay must be SVG format' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Generate session ID
    const sessionId = generateSessionId();
    
    // Store files in R2
    await storeFile(env.R2_BUCKET, `${sessionId}/front.png`, frontFile);
    await storeFile(env.R2_BUCKET, `${sessionId}/back.png`, backFile);
    
    if (overlayFile) {
      await storeFile(env.R2_BUCKET, `${sessionId}/overlay.svg`, overlayFile);
    }
    
    // Store session metadata in KV
    const sessionData = {
      status: 'uploaded',
      timestamp: Date.now(),
      hasOverlay: !!overlayFile,
      frontFileName: frontFile.name,
      backFileName: backFile.name,
      frontFileSize: frontFile.size,
      backFileSize: backFile.size,
      copyrightEnabled: copyrightEnabled,
      copyrightText: copyrightEnabled ? copyrightText : null
    };
    
    await env.SESSIONS.put(sessionId, JSON.stringify(sessionData), {
      expirationTtl: parseInt(env.SESSION_TIMEOUT || '3600') // 1 hour default
    });
    
    return new Response(JSON.stringify({ 
      sessionId, 
      status: 'uploaded',
      message: 'Files uploaded successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to upload files: ' + error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}