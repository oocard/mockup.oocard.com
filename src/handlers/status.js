export async function checkStatus(request, env, corsHeaders) {
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
    // Retrieve session data
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
    
    // Build response based on status
    const response = {
      sessionId: sessionId,
      status: session.status,
      timestamp: session.timestamp
    };
    
    // Add status-specific information
    switch (session.status) {
      case 'uploaded':
        response.message = 'Files uploaded successfully';
        response.hasOverlay = session.hasOverlay;
        break;
        
      case 'processing':
        response.message = 'Processing card model';
        response.startTime = session.processingStarted;
        
        // Calculate processing duration
        if (session.processingStarted) {
          response.duration = Date.now() - session.processingStarted;
        }
        break;
        
      case 'completed':
        response.message = 'Card model ready';
        response.downloadUrl = session.downloadUrl || `/api/download?sessionId=${sessionId}`;
        response.processingTime = session.processingTime;
        response.fileSize = session.glbSize;
        break;
        
      case 'error':
        response.message = 'Processing failed';
        response.error = session.error;
        response.errorTime = session.errorTime;
        break;
        
      default:
        response.message = 'Unknown status';
    }
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to check status: ' + error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}