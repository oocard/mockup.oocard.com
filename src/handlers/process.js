import { retrieveFile } from '../utils/helpers.js';
import { 
  applyRoundedCorners, 
  processSVGOverlay, 
  compositeImages,
  validateImage,
  imageBufferToDataURL,
  generateCopyrightSVG
} from '../processing/imageProcessor.js';
import { createWorkingGLB } from '../processing/workingGLBGenerator.js';

export async function processCard(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }
  
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
    // Check if session exists
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
    
    // Check if already processing or completed
    if (session.status === 'processing') {
      return new Response(JSON.stringify({ 
        status: 'processing',
        message: 'Already processing' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (session.status === 'completed') {
      return new Response(JSON.stringify({ 
        status: 'completed',
        downloadUrl: `/api/download?sessionId=${sessionId}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Update status to processing
    session.status = 'processing';
    session.processingStarted = Date.now();
    await env.SESSIONS.put(sessionId, JSON.stringify(session));
    
    // Retrieve uploaded files
    const frontImageObj = await retrieveFile(env.R2_BUCKET, `${sessionId}/front.png`);
    const backImageObj = await retrieveFile(env.R2_BUCKET, `${sessionId}/back.png`);
    
    if (!frontImageObj || !backImageObj) {
      throw new Error('Required images not found');
    }
    
    // Get image data
    const frontImageBuffer = await frontImageObj.arrayBuffer();
    const backImageBuffer = await backImageObj.arrayBuffer();
    
    // Validate images
    const frontValidation = await validateImage(frontImageBuffer);
    const backValidation = await validateImage(backImageBuffer);
    
    console.log('Front image:', frontValidation);
    console.log('Back image:', backValidation);
    
    // Process images with rounded corners
    let processedFront = await applyRoundedCorners(frontImageBuffer);
    let processedBack = await applyRoundedCorners(backImageBuffer);
    
    // Handle overlay if present
    if (session.hasOverlay) {
      const overlayObj = await retrieveFile(env.R2_BUCKET, `${sessionId}/overlay.svg`);
      if (overlayObj) {
        const overlayData = await overlayObj.text();
        const overlayBuffer = await processSVGOverlay(
          overlayData,
          frontValidation.width,
          frontValidation.height
        );
        
        // Composite overlay with images
        processedFront = await compositeImages(processedFront, overlayBuffer);
        processedBack = await compositeImages(processedBack, overlayBuffer);
      }
    }
    
    // Store processed images
    await env.R2_BUCKET.put(`${sessionId}/processed-front.png`, processedFront);
    await env.R2_BUCKET.put(`${sessionId}/processed-back.png`, processedBack);
    
    // Convert to data URLs for GLB embedding
    const frontDataURL = imageBufferToDataURL(processedFront);
    const backDataURL = imageBufferToDataURL(processedBack);
    
    // Prepare copyright text options
    const copyrightOptions = session.copyrightEnabled ? {
      enabled: true,
      text: session.copyrightText || '© DESIGN COPYRIGHT 2026'
    } : { enabled: false };
    
    // Create working 3D card GLB
    const glbData = await createWorkingGLB(frontDataURL, backDataURL, copyrightOptions);
    
    // Store GLB file
    await env.R2_BUCKET.put(`${sessionId}/card.glb`, glbData, {
      httpMetadata: {
        contentType: 'model/gltf-binary'
      }
    });
    
    // Update session status
    session.status = 'completed';
    session.processingCompleted = Date.now();
    session.processingTime = session.processingCompleted - session.processingStarted;
    session.glbSize = glbData.byteLength;
    session.downloadUrl = `/api/download?sessionId=${sessionId}`;
    
    await env.SESSIONS.put(sessionId, JSON.stringify(session));
    
    return new Response(JSON.stringify({ 
      status: 'completed',
      processingTime: session.processingTime,
      fileSize: session.glbSize,
      downloadUrl: session.downloadUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Processing error:', error);
    
    // Update session with error
    try {
      const sessionData = await env.SESSIONS.get(sessionId);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        session.status = 'error';
        session.error = error.message;
        session.errorTime = Date.now();
        await env.SESSIONS.put(sessionId, JSON.stringify(session));
      }
    } catch (updateError) {
      console.error('Failed to update session error:', updateError);
    }
    
    return new Response(JSON.stringify({ 
      error: 'Processing failed: ' + error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}