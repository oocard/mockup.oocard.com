/**
 * Google OAuth 2.0 Authentication Handler
 * Handles SSO authentication flow for Google Drive access
 */

export async function handleGoogleAuth(request, env, corsHeaders) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  
  switch (action) {
    case 'login':
      return initiateGoogleLogin(env, corsHeaders);
    case 'callback':
      return handleGoogleCallback(request, env, corsHeaders);
    case 'status':
      return checkAuthStatus(request, env, corsHeaders);
    case 'logout':
      return handleLogout(request, env, corsHeaders);
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

/**
 * Initiate Google OAuth login flow
 */
function initiateGoogleLogin(env, corsHeaders) {
  const clientId = env.GOOGLE_CLIENT_ID;
  const redirectUri = env.GOOGLE_REDIRECT_URI || 'https://3d-card-generator.oocard.workers.dev/api/google-auth?action=callback';
  
  // OAuth 2.0 scopes for Google Drive API
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');
  
  const state = crypto.randomUUID();
  
  // Construct Google OAuth URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', scopes);
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');
  
  return new Response(JSON.stringify({ 
    authUrl: googleAuthUrl.toString(),
    state: state
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Handle OAuth callback from Google
 */
async function handleGoogleCallback(request, env, corsHeaders) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  
  if (error) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head><title>Authentication Failed</title></head>
      <body>
        <h1>Authentication Failed</h1>
        <p>Error: ${error}</p>
        <p><a href="/">Return to 3D Card Generator</a></p>
        <script>
          // Close popup if opened in popup window
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'google_auth_error', 
              error: '${error}' 
            }, '*');
            window.close();
          }
        </script>
      </body>
      </html>
    `, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });
  }
  
  if (!code) {
    return new Response('Missing authorization code', { 
      status: 400, 
      headers: corsHeaders 
    });
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI || 'https://3d-card-generator.oocard.workers.dev/api/google-auth?action=callback',
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    
    const userInfo = await userResponse.json();
    
    // Create session
    const sessionId = crypto.randomUUID();
    const sessionData = {
      sessionId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      userInfo,
      timestamp: new Date().toISOString()
    };
    
    // Store session in KV (expires in 1 hour)
    await env.SESSIONS.put(`google_auth_${sessionId}`, JSON.stringify(sessionData), { expirationTtl: 3600 });
    
    // Return success page
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Successful</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; text-align: center; }
          .success { color: #28a745; }
          .user-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1 class="success">✅ Authentication Successful!</h1>
        <div class="user-info">
          <p><strong>Logged in as:</strong> ${userInfo.email}</p>
          <p><strong>Name:</strong> ${userInfo.name}</p>
        </div>
        <p>You can now close this window and return to the 3D Card Generator.</p>
        <script>
          // Notify parent window of successful authentication
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'google_auth_success', 
              sessionId: '${sessionId}',
              userInfo: ${JSON.stringify(userInfo)}
            }, '*');
            setTimeout(() => window.close(), 2000);
          }
        </script>
      </body>
      </html>
    `, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head><title>Authentication Error</title></head>
      <body>
        <h1>Authentication Error</h1>
        <p>Error: ${error.message}</p>
        <p><a href="/">Return to 3D Card Generator</a></p>
      </body>
      </html>
    `, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });
  }
}

/**
 * Check current authentication status
 */
async function checkAuthStatus(request, env, corsHeaders) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  
  if (!sessionId) {
    return new Response(JSON.stringify({ authenticated: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const sessionData = await env.SESSIONS.get(`google_auth_${sessionId}`);
    
    if (!sessionData) {
      return new Response(JSON.stringify({ authenticated: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const session = JSON.parse(sessionData);
    
    // Check if token is still valid
    if (Date.now() >= session.expiresAt) {
      // Token expired, try to refresh if we have refresh token
      if (session.refreshToken) {
        const refreshedSession = await refreshAccessToken(session, env);
        if (refreshedSession) {
          await env.SESSIONS.put(`google_auth_${sessionId}`, JSON.stringify(refreshedSession), { expirationTtl: 3600 });
          return new Response(JSON.stringify({ 
            authenticated: true, 
            userInfo: refreshedSession.userInfo,
            expiresAt: refreshedSession.expiresAt
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
      
      return new Response(JSON.stringify({ authenticated: false, reason: 'token_expired' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      authenticated: true, 
      userInfo: session.userInfo,
      expiresAt: session.expiresAt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Auth status check error:', error);
    return new Response(JSON.stringify({ authenticated: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle logout
 */
async function handleLogout(request, env, corsHeaders) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  
  if (sessionId) {
    try {
      await env.SESSIONS.delete(`google_auth_${sessionId}`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Refresh expired access token
 */
async function refreshAccessToken(session, env) {
  try {
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: session.refreshToken,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token'
      })
    });
    
    const tokenData = await refreshResponse.json();
    
    if (!refreshResponse.ok) {
      console.error('Token refresh failed:', tokenData);
      return null;
    }
    
    // Update session with new token
    return {
      ...session,
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      refreshToken: tokenData.refresh_token || session.refreshToken, // Keep old refresh token if not provided
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}