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
    // Extract base name from original filename (remove -F.png)
    const baseName = session.frontFileName.replace(/-F\.(png|PNG)$/i, '');
    if (baseName) {
      return `${baseName}-3D.glb`;
    }
  }
  
  // Fallback to timestamp-based name
  const date = new Date(session.timestamp);
  const dateStr = date.toISOString().split('T')[0];
  return `card-${dateStr}.glb`;
}