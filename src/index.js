import { handleUpload } from './handlers/upload.js';
import { processCard } from './handlers/process.js';
import { checkStatus } from './handlers/status.js';
import { downloadGLB } from './handlers/download.js';
import { handleGoogleAuth } from './handlers/googleAuth.js';
import { handleGoogleDrive } from './handlers/googleDrive.js';
import { serveUI, serveTestPage } from './ui/serve.js';
import { servePreview } from './ui/preview.js';
import { serveGoogleDriveUI } from './ui/googleDrive.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
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
          
        case '/api/google-auth':
          return handleGoogleAuth(request, env, corsHeaders);
          
        case '/api/google-drive':
          return handleGoogleDrive(request, env, corsHeaders);
          
        default:
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