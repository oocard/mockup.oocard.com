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

/**
 * Generate copyright text SVG overlay
 * Creates repeating text along all four edges of the card
 * @param {string} copyrightText - The copyright text to display
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} SVG string with copyright text along edges
 */
export function generateCopyrightSVG(copyrightText, width, height) {
  const fontSize = Math.max(10, Math.min(14, Math.floor(width / 80)));
  const padding = fontSize * 1.5;
  const textColor = 'rgba(0, 0, 0, 0.4)';
  
  // Calculate how many times to repeat the text to fill each edge
  const charWidth = fontSize * 0.6; // Approximate character width
  const textLength = copyrightText.length * charWidth;
  const separator = '   •   ';
  const fullText = copyrightText + separator;
  const fullTextLength = fullText.length * charWidth;
  
  // Calculate repetitions needed for each edge
  const horizontalReps = Math.ceil(width / fullTextLength) + 1;
  const verticalReps = Math.ceil(height / fullTextLength) + 1;
  
  const repeatedTextH = (fullText).repeat(horizontalReps);
  const repeatedTextV = (fullText).repeat(verticalReps);
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .copyright-text {
        font-family: 'Arial', sans-serif;
        font-size: ${fontSize}px;
        font-weight: 500;
        fill: ${textColor};
        letter-spacing: 0.5px;
      }
    </style>
  </defs>
  
  <!-- Top edge (left to right) -->
  <text x="${padding}" y="${padding}" class="copyright-text" textLength="${width * 3}">${escapeXml(repeatedTextH)}</text>
  
  <!-- Bottom edge (left to right) -->
  <text x="${padding}" y="${height - padding + fontSize * 0.3}" class="copyright-text" textLength="${width * 3}">${escapeXml(repeatedTextH)}</text>
  
  <!-- Left edge (top to bottom, rotated) -->
  <text x="${padding}" y="${padding}" class="copyright-text" transform="rotate(90, ${padding}, ${padding})" textLength="${height * 3}">${escapeXml(repeatedTextV)}</text>
  
  <!-- Right edge (bottom to top, rotated) -->
  <text x="${width - padding}" y="${height - padding}" class="copyright-text" transform="rotate(-90, ${width - padding}, ${height - padding})" textLength="${height * 3}">${escapeXml(repeatedTextV)}</text>
</svg>`;
  
  return svg;
}

/**
 * Escape XML special characters
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate a PNG with copyright text for the card edge
 * Uses a clean, Inter-style bitmap font that works in Cloudflare Workers
 * @param {string} copyrightText - The copyright text to render
 * @param {number} width - Image width (for edge: perimeter of card)
 * @param {number} height - Image height (edge thickness)
 * @returns {ArrayBuffer} PNG image data
 */
export function generateCopyrightPNG(copyrightText, width = 512, height = 32) {
  // Clean 7x11 bitmap font inspired by Inter's geometric, modern style
  // Each character is 7 pixels wide x 11 pixels tall
  const FONT = {
    ' ': [
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '©': [
      0,0,1,1,1,0,0,
      0,1,0,0,0,1,0,
      1,0,0,1,1,0,1,
      1,0,1,0,0,0,1,
      1,0,1,0,0,0,1,
      1,0,1,0,0,0,1,
      1,0,0,1,1,0,1,
      0,1,0,0,0,1,0,
      0,0,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'D': [
      1,1,1,1,0,0,0,
      1,0,0,0,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,1,0,0,
      1,1,1,1,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'E': [
      1,1,1,1,1,1,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,1,1,1,1,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,1,1,1,1,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'S': [
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,0,0,
      0,1,0,0,0,0,0,
      0,0,1,1,1,0,0,
      0,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'I': [
      1,1,1,1,1,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      1,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'G': [
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,1,1,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'N': [
      1,0,0,0,0,1,0,
      1,1,0,0,0,1,0,
      1,0,1,0,0,1,0,
      1,0,1,0,0,1,0,
      1,0,0,1,0,1,0,
      1,0,0,1,0,1,0,
      1,0,0,0,1,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'C': [
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'O': [
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'P': [
      1,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,1,1,1,1,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'Y': [
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,0,0,1,0,0,
      0,1,0,0,1,0,0,
      0,0,1,1,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'R': [
      1,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,1,1,1,1,0,0,
      1,0,0,1,0,0,0,
      1,0,0,0,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'T': [
      1,1,1,1,1,1,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'H': [
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,1,1,1,1,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '2': [
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      0,0,0,0,1,0,0,
      0,0,0,1,0,0,0,
      0,0,1,0,0,0,0,
      0,1,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,1,1,1,1,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '0': [
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,1,1,0,
      1,0,0,1,0,1,0,
      1,0,1,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '6': [
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'A': [
      0,0,1,1,0,0,0,
      0,1,0,0,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,1,1,1,1,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'L': [
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,1,1,1,1,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'W': [
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,1,0,1,0,
      1,0,1,0,1,1,0,
      1,0,1,0,1,1,0,
      1,1,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'K': [
      1,0,0,0,0,1,0,
      1,0,0,0,1,0,0,
      1,0,0,1,0,0,0,
      1,0,1,0,0,0,0,
      1,1,0,0,0,0,0,
      1,0,1,0,0,0,0,
      1,0,0,1,0,0,0,
      1,0,0,0,1,0,0,
      1,0,0,0,0,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '•': [
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,1,1,0,0,0,
      0,0,1,1,0,0,0,
      0,0,1,1,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'B': [
      1,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'F': [
      1,1,1,1,1,1,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,1,1,1,1,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'J': [
      0,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'M': [
      1,0,0,0,0,1,0,
      1,1,0,0,1,1,0,
      1,0,1,1,0,1,0,
      1,0,1,1,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'Q': [
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,1,0,1,0,
      1,0,0,0,1,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'U': [
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'V': [
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,0,0,1,0,0,
      0,1,0,0,1,0,0,
      0,0,1,1,0,0,0,
      0,0,1,1,0,0,0,
      0,0,1,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'X': [
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,0,0,1,0,0,
      0,0,1,1,0,0,0,
      0,0,1,1,0,0,0,
      0,0,1,1,0,0,0,
      0,1,0,0,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    'Z': [
      1,1,1,1,1,1,0,
      0,0,0,0,0,1,0,
      0,0,0,0,1,0,0,
      0,0,0,1,0,0,0,
      0,0,1,0,0,0,0,
      0,1,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,1,1,1,1,1,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '1': [
      0,0,1,0,0,0,0,
      0,1,1,0,0,0,0,
      1,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      1,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '3': [
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      0,0,1,1,1,0,0,
      0,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '4': [
      0,0,0,0,1,0,0,
      0,0,0,1,1,0,0,
      0,0,1,0,1,0,0,
      0,1,0,0,1,0,0,
      1,0,0,0,1,0,0,
      1,1,1,1,1,1,0,
      0,0,0,0,1,0,0,
      0,0,0,0,1,0,0,
      0,0,0,0,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '5': [
      1,1,1,1,1,1,0,
      1,0,0,0,0,0,0,
      1,0,0,0,0,0,0,
      1,1,1,1,1,0,0,
      0,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '7': [
      1,1,1,1,1,1,0,
      0,0,0,0,0,1,0,
      0,0,0,0,1,0,0,
      0,0,0,0,1,0,0,
      0,0,0,1,0,0,0,
      0,0,0,1,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,1,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '8': [
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '9': [
      0,1,1,1,1,0,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,1,0,
      0,0,0,0,0,1,0,
      0,0,0,0,0,1,0,
      1,0,0,0,0,1,0,
      0,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
    '-': [
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      1,1,1,1,1,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,
      0,0,0,0,0,0,0
    ],
  };
  
  const FONT_WIDTH = 7;
  const FONT_HEIGHT = 11;
  const CHAR_SPACING = 1;
  const SCALE = 2; // Scale up the font for better visibility
  
  // Prepare the repeating text
  // Remove © symbol entirely since texture tiles/repeats - would cause multiple © to appear
  const separator = '  -  ';
  const upperText = copyrightText.toUpperCase();
  
  // Strip any © symbol from the text for clean tiling
  const cleanText = upperText.replace(/©\s*/g, '').trim();
  const repeatPortion = cleanText + separator;
  
  // Calculate character dimensions
  const charWidth = (FONT_WIDTH + CHAR_SPACING) * SCALE;
  const repeatPortionPixelWidth = repeatPortion.length * charWidth;
  
  // Calculate how many complete repetitions fit in the texture width
  // We need to ensure the texture contains EXACTLY complete repetitions
  // so that when it tiles, the seam is seamless
  const completeReps = Math.max(1, Math.floor(width / repeatPortionPixelWidth));
  
  // Adjust the actual texture width to fit complete repetitions exactly
  const actualTextureWidth = completeReps * repeatPortionPixelWidth;
  
  // Use the adjusted width for rendering
  width = actualTextureWidth;
  
  // Create the repeated text for exactly the number of complete repetitions
  const repeatedText = repeatPortion.repeat(completeReps);
  
  // Create pixel data (RGBA)
  const pixels = new Uint8Array(width * height * 4);
  
  // Fill with white background
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255;     // R
    pixels[i + 1] = 255; // G
    pixels[i + 2] = 255; // B
    pixels[i + 3] = 255; // A
  }
  
  // Calculate vertical centering
  const scaledFontHeight = FONT_HEIGHT * SCALE;
  const startY = Math.floor((height - scaledFontHeight) / 2);
  
  // Draw each character
  let xPos = 2; // Small left padding
  for (let charIdx = 0; charIdx < repeatedText.length && xPos < width; charIdx++) {
    const char = repeatedText[charIdx];
    const bitmap = FONT[char] || FONT[' '];
    
    // Draw the character (scaled)
    for (let row = 0; row < FONT_HEIGHT; row++) {
      for (let col = 0; col < FONT_WIDTH; col++) {
        if (bitmap[row * FONT_WIDTH + col]) {
          // Draw scaled pixel
          for (let sy = 0; sy < SCALE; sy++) {
            for (let sx = 0; sx < SCALE; sx++) {
              const px = xPos + col * SCALE + sx;
              const py = startY + row * SCALE + sy;
              if (px >= 0 && px < width && py >= 0 && py < height) {
                const idx = (py * width + px) * 4;
                pixels[idx] = 100;     // R - dark gray
                pixels[idx + 1] = 100; // G
                pixels[idx + 2] = 100; // B
                pixels[idx + 3] = 255; // A
              }
            }
          }
        }
      }
    }
    
    xPos += charWidth;
  }
  
  // Create PNG
  return createPNG(pixels, width, height);
}

/**
 * Create a minimal PNG from RGBA pixel data
 * Simple implementation without compression (works in Cloudflare Workers)
 * @param {Uint8Array} pixels - RGBA pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {ArrayBuffer} PNG file data
 */
function createPNG(pixels, width, height) {
  // PNG signature
  const signature = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdr = createIHDRChunk(width, height);
  
  // IDAT chunk (uncompressed image data wrapped in zlib)
  const idat = createIDATChunk(pixels, width, height);
  
  // IEND chunk
  const iend = createIENDChunk();
  
  // Combine all parts
  const totalLength = signature.length + ihdr.length + idat.length + iend.length;
  const png = new Uint8Array(totalLength);
  let offset = 0;
  
  png.set(signature, offset); offset += signature.length;
  png.set(ihdr, offset); offset += ihdr.length;
  png.set(idat, offset); offset += idat.length;
  png.set(iend, offset);
  
  return png.buffer;
}

function createIHDRChunk(width, height) {
  const data = new Uint8Array(13);
  const view = new DataView(data.buffer);
  view.setUint32(0, width, false);  // width
  view.setUint32(4, height, false); // height
  data[8] = 8;  // bit depth
  data[9] = 6;  // color type (RGBA)
  data[10] = 0; // compression method
  data[11] = 0; // filter method
  data[12] = 0; // interlace method
  
  return createChunk('IHDR', data);
}

function createIDATChunk(pixels, width, height) {
  // Create raw image data with filter bytes
  const rowSize = width * 4 + 1; // +1 for filter byte
  const rawData = new Uint8Array(rowSize * height);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = rowOffset + 1 + x * 4;
      rawData[dstIdx] = pixels[srcIdx];
      rawData[dstIdx + 1] = pixels[srcIdx + 1];
      rawData[dstIdx + 2] = pixels[srcIdx + 2];
      rawData[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }
  
  // Wrap in zlib format (uncompressed blocks)
  const zlibData = createUncompressedZlib(rawData);
  
  return createChunk('IDAT', zlibData);
}

function createUncompressedZlib(data) {
  // Zlib header: CMF=0x78 (deflate, 32K window), FLG=0x01 (no dict, check bits)
  const maxBlockSize = 65535;
  const numBlocks = Math.ceil(data.length / maxBlockSize);
  
  // Calculate total size: 2 (header) + blocks + 4 (adler32)
  let totalSize = 2 + 4;
  for (let i = 0; i < numBlocks; i++) {
    const blockSize = Math.min(maxBlockSize, data.length - i * maxBlockSize);
    totalSize += 5 + blockSize; // 5 bytes header per block
  }
  
  const result = new Uint8Array(totalSize);
  let offset = 0;
  
  // Zlib header
  result[offset++] = 0x78;
  result[offset++] = 0x01;
  
  // Deflate blocks (uncompressed)
  for (let i = 0; i < numBlocks; i++) {
    const isLast = i === numBlocks - 1;
    const blockStart = i * maxBlockSize;
    const blockSize = Math.min(maxBlockSize, data.length - blockStart);
    
    result[offset++] = isLast ? 0x01 : 0x00; // BFINAL + BTYPE
    result[offset++] = blockSize & 0xFF;
    result[offset++] = (blockSize >> 8) & 0xFF;
    result[offset++] = ~blockSize & 0xFF;
    result[offset++] = (~blockSize >> 8) & 0xFF;
    
    result.set(data.subarray(blockStart, blockStart + blockSize), offset);
    offset += blockSize;
  }
  
  // Adler-32 checksum
  const adler = adler32(data);
  result[offset++] = (adler >> 24) & 0xFF;
  result[offset++] = (adler >> 16) & 0xFF;
  result[offset++] = (adler >> 8) & 0xFF;
  result[offset++] = adler & 0xFF;
  
  return result;
}

function adler32(data) {
  let a = 1, b = 0;
  const MOD = 65521;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD;
    b = (b + a) % MOD;
  }
  return (b << 16) | a;
}

function createIENDChunk() {
  return createChunk('IEND', new Uint8Array(0));
}

function createChunk(type, data) {
  const chunk = new Uint8Array(4 + 4 + data.length + 4);
  const view = new DataView(chunk.buffer);
  
  // Length
  view.setUint32(0, data.length, false);
  
  // Type
  chunk[4] = type.charCodeAt(0);
  chunk[5] = type.charCodeAt(1);
  chunk[6] = type.charCodeAt(2);
  chunk[7] = type.charCodeAt(3);
  
  // Data
  chunk.set(data, 8);
  
  // CRC32
  const crcData = chunk.subarray(4, 8 + data.length);
  const crc = crc32(crcData);
  view.setUint32(8 + data.length, crc, false);
  
  return chunk;
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = getCRC32Table();
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

let crc32Table = null;
function getCRC32Table() {
  if (crc32Table) return crc32Table;
  crc32Table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc32Table[i] = c;
  }
  return crc32Table;
}