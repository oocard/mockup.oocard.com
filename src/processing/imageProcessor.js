/**
 * Image processing utilities for card generation
 */

/**
 * Apply rounded corners to an image
 * @param {ArrayBuffer} imageBuffer - Image data as ArrayBuffer
 * @param {number} cornerRadius - Corner radius in pixels (default 3.18mm equivalent)
 * @returns {Promise<ArrayBuffer>} Processed image with rounded corners
 */
export async function applyRoundedCorners(imageBuffer, cornerRadius = 30) {
  try {
    // In Cloudflare Workers, we need to use the Image API or process on client
    // For now, we'll return a placeholder that indicates processing needed
    // The actual processing will be done using Canvas API in the browser
    
    // Create a response that indicates processing is needed
    const processedData = {
      type: 'rounded_corners',
      cornerRadius: cornerRadius,
      originalSize: imageBuffer.byteLength,
      processed: false
    };
    
    // For Workers environment, we'll pass through and handle in client
    // or use a library that works in Workers environment
    return imageBuffer;
  } catch (error) {
    console.error('Error applying rounded corners:', error);
    throw new Error('Failed to apply rounded corners');
  }
}

/**
 * Process SVG overlay and convert to PNG
 * @param {string} svgData - SVG content as string
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {Promise<ArrayBuffer>} Processed overlay as PNG
 */
export async function processSVGOverlay(svgData, width = 1024, height = 640) {
  try {
    // SVG processing placeholder for Workers environment
    // This would need to be handled differently in Workers
    const encoder = new TextEncoder();
    return encoder.encode(svgData).buffer;
  } catch (error) {
    console.error('Error processing SVG overlay:', error);
    throw new Error('Failed to process SVG overlay');
  }
}

/**
 * Composite two images together
 * @param {ArrayBuffer} baseImage - Base image buffer
 * @param {ArrayBuffer} overlayImage - Overlay image buffer
 * @param {string} blendMode - Blend mode (default: 'multiply')
 * @returns {Promise<ArrayBuffer>} Composited image
 */
export async function compositeImages(baseImage, overlayImage, blendMode = 'multiply') {
  try {
    // Image composition placeholder for Workers environment
    // Return base image for now
    return baseImage;
  } catch (error) {
    console.error('Error compositing images:', error);
    throw new Error('Failed to composite images');
  }
}

/**
 * Resize image to standard card dimensions
 * @param {ArrayBuffer} imageBuffer - Image buffer
 * @param {number} targetWidth - Target width in pixels
 * @param {number} targetHeight - Target height in pixels
 * @returns {Promise<ArrayBuffer>} Resized image
 */
export async function resizeImage(imageBuffer, targetWidth = 1024, targetHeight = 640) {
  try {
    // Placeholder for image resizing in Workers
    return imageBuffer;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw new Error('Failed to resize image');
  }
}

/**
 * Validate image dimensions and format
 * @param {ArrayBuffer} imageBuffer - Image buffer to validate
 * @returns {Promise<Object>} Image metadata
 */
export async function validateImage(imageBuffer) {
  try {
    // Basic validation - check if buffer exists and has content
    if (!imageBuffer || imageBuffer.byteLength === 0) {
      throw new Error('Invalid image data');
    }
    
    // Check PNG signature
    const view = new DataView(imageBuffer);
    const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    
    for (let i = 0; i < pngSignature.length; i++) {
      if (view.getUint8(i) !== pngSignature[i]) {
        throw new Error('Invalid PNG file');
      }
    }
    
    // Extract basic metadata from PNG chunks
    // IHDR chunk starts at byte 12
    const width = view.getUint32(16);
    const height = view.getUint32(20);
    
    return {
      valid: true,
      format: 'png',
      width: width,
      height: height,
      size: imageBuffer.byteLength
    };
  } catch (error) {
    console.error('Error validating image:', error);
    throw new Error('Invalid image format');
  }
}

/**
 * Convert image buffer to base64 data URL
 * @param {ArrayBuffer} imageBuffer - Image buffer
 * @param {string} mimeType - MIME type (default: 'image/png')
 * @returns {string} Base64 data URL
 */
export function imageBufferToDataURL(imageBuffer, mimeType = 'image/png') {
  const bytes = new Uint8Array(imageBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:${mimeType};base64,${base64}`;
}