import { handleUpload } from './handlers/upload.js';
import { processCard } from './handlers/process.js';
import { checkStatus } from './handlers/status.js';
import { downloadGLB, listGLBs, getThumbnail } from './handlers/download.js';
import { handleGoogleAuth } from './handlers/googleAuth.js';
import { handleGoogleDrive } from './handlers/googleDrive.js';
import { serveUI, serveTestPage } from './ui/serve.js';
import { servePreview } from './ui/preview.js';
import { serveGoogleDriveUI } from './ui/googleDrive.js';

// HTTP Basic Auth credentials
const BASIC_USER = 'admin';
const BASIC_PASS = 'oocard1';

/**
 * Check HTTP Basic Authentication
 * @param {Request} request
 * @returns {Response|null} Returns 401 response if auth fails, null if auth passes
 */
function checkBasicAuth(request) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="OOCard 3D Card Generator", charset="UTF-8"',
        'Content-Type': 'text/plain',
      },
    });
  }
  
  const base64Credentials = authHeader.slice(6);
  const credentials = atob(base64Credentials);
  const [username, password] = credentials.split(':');
  
  if (username !== BASIC_USER || password !== BASIC_PASS) {
    return new Response('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="OOCard 3D Card Generator", charset="UTF-8"',
        'Content-Type': 'text/plain',
      },
    });
  }
  
  return null; // Auth passed
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Check Basic Auth
    const authResponse = checkBasicAuth(request);
    if (authResponse) {
      return authResponse;
    }
    
    try {
      switch (path) {
        case '/':
          return serveUI();
          
        case '/test':
          return serveTestPage();
          
        case '/preview':
          const sessionId = url.searchParams.get('session');
          return servePreview(sessionId);
          
        case '/drive':
          return serveGoogleDriveUI();
          
        case '/api/upload':
          return handleUpload(request, env, corsHeaders);
          
        case '/api/process':
          return processCard(request, env, corsHeaders);
          
        case '/api/status':
          return checkStatus(request, env, corsHeaders);
          
        case '/api/download':
          return downloadGLB(request, env, corsHeaders);
          
        case '/api/list-glbs':
          return listGLBs(request, env, corsHeaders);
          
        case '/api/thumbnail':
          return getThumbnail(request, env, corsHeaders);
          
        case '/api/google-auth':
          return handleGoogleAuth(request, env, corsHeaders);
          
        case '/api/google-drive':
          return handleGoogleDrive(request, env, corsHeaders, ctx);
          
        default:
          // Serve static files from R2 (e.g. /static/test-f.png)
          if (path.startsWith('/static/')) {
            const key = path.slice(1); // strip leading /
            const obj = await env.R2_BUCKET.get(key);
            if (obj) {
              const ext = key.split('.').pop().toLowerCase();
              const types = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', glb: 'model/gltf-binary' };
              return new Response(obj.body, {
                headers: { ...corsHeaders, 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=86400' }
              });
            }
          }
          return new Response('Not Found', {
            status: 404,
            headers: corsHeaders
          });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};