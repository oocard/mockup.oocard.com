import { retrieveFile } from '../utils/helpers.js';

export async function downloadGLB(request, env, corsHeaders) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  
  if (!sessionId) {
    return new Response(JSON.stringify({ 
      error: 'Session ID required' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Check session exists and is completed
    const sessionData = await env.SESSIONS.get(sessionId);
    
    if (!sessionData) {
      return new Response(JSON.stringify({ 
        error: 'Session not found or expired' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const session = JSON.parse(sessionData);
    
    if (session.status !== 'completed') {
      return new Response(JSON.stringify({ 
        error: 'Card model not ready',
        status: session.status 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Retrieve GLB file
    const glbObject = await retrieveFile(env.R2_BUCKET, `${sessionId}/card.glb`);
    
    if (!glbObject) {
      return new Response(JSON.stringify({ 
        error: 'GLB file not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get file data
    const glbData = await glbObject.arrayBuffer();
    
    // Generate filename based on original files
    const filename = generateFilename(session);
    
    // Return GLB file with appropriate headers
    return new Response(glbData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'model/gltf-binary',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': glbData.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to download file: ' + error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generate filename for download
 * @param {Object} session - Session data
 * @returns {string} Filename for GLB file
 */
function generateFilename(session) {
  if (session.frontFileName) {
    // Extract base name from original filename (remove -F.png or _F.png)
    const baseName = session.frontFileName.replace(/[-_]F\.(png|PNG)$/i, '');
    if (baseName) {
      return `${baseName}-3D.glb`;
    }
  }
  
  // Fallback to timestamp-based name
  const date = new Date(session.timestamp);
  const dateStr = date.toISOString().split('T')[0];
  return `card-${dateStr}.glb`;
}

/**
 * List all GLB files stored in R2, sorted by date
 */
export async function listGLBs(request, env, corsHeaders) {
  try {
    // List all objects in R2 bucket
    const listed = await env.R2_BUCKET.list({ limit: 1000 });
    
    // Group by session and find GLB files
    const sessions = new Map();
    
    for (const object of listed.objects) {
      const parts = object.key.split('/');
      if (parts.length === 2) {
        const sessionId = parts[0];
        const filename = parts[1];
        
        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, {
            sessionId,
            files: {},
            uploaded: object.uploaded
          });
        }
        
        const session = sessions.get(sessionId);
        session.files[filename] = {
          size: object.size,
          uploaded: object.uploaded
        };
        
        // Use the most recent file's timestamp
        if (object.uploaded > session.uploaded) {
          session.uploaded = object.uploaded;
        }
      }
    }
    
    // Filter to only sessions with GLB files and get session metadata
    const glbSessions = [];
    
    for (const [sessionId, data] of sessions) {
      if (data.files['card.glb']) {
        // Try to get session metadata from KV
        let sessionMeta = null;
        try {
          const metaStr = await env.SESSIONS.get(sessionId);
          if (metaStr) {
            sessionMeta = JSON.parse(metaStr);
          }
        } catch (e) {
          // Session metadata may have expired
        }
        
        glbSessions.push({
          sessionId,
          glbSize: data.files['card.glb'].size,
          uploaded: data.uploaded,
          hasFrontImage: !!data.files['front.png'],
          hasProcessedFront: !!data.files['processed-front.png'],
          name: sessionMeta?.frontFileName?.replace(/[-_]F\.(png|PNG)$/i, '') || sessionId.slice(0, 8),
          status: sessionMeta?.status || 'unknown',
          timestamp: sessionMeta?.timestamp || data.uploaded.getTime()
        });
      }
    }
    
    // Sort by timestamp descending (newest first)
    glbSessions.sort((a, b) => b.timestamp - a.timestamp);
    
    return new Response(JSON.stringify({
      count: glbSessions.length,
      sessions: glbSessions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('List GLBs error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to list GLBs: ' + error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get thumbnail (processed front image) for a session
 */
export async function getThumbnail(request, env, corsHeaders) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Session ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Try processed front first, then original front
    let imageObject = await env.R2_BUCKET.get(`${sessionId}/processed-front.png`);
    
    if (!imageObject) {
      imageObject = await env.R2_BUCKET.get(`${sessionId}/front.png`);
    }
    
    if (!imageObject) {
      // Return a placeholder SVG
      const placeholder = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
        <rect fill="#caf0f8" width="200" height="280"/>
        <rect fill="#90e0ef" x="20" y="20" width="160" height="240" rx="8"/>
        <text x="100" y="140" text-anchor="middle" fill="#03045e" font-family="sans-serif" font-size="14">No Preview</text>
      </svg>`;
      return new Response(placeholder, {
        headers: { ...corsHeaders, 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' }
      });
    }
    
    const imageData = await imageObject.arrayBuffer();
    
    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Thumbnail error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}