/**
 * Validate file naming convention
 * @param {string} filename - The file name to validate
 * @param {string} type - Either 'F' for front or 'R' for reverse (no longer enforced)
 * @returns {boolean} Whether the filename is valid (always true for PNG files)
 */
export function validateFileName(filename, type) {
  // Accept any PNG file - naming convention no longer enforced
  return /\.(png|PNG)$/i.test(filename);
}

/**
 * Generate a unique session ID
 * @returns {string} UUID session ID
 */
export function generateSessionId() {
  return crypto.randomUUID();
}

/**
 * Store a file in R2 bucket
 * @param {Object} bucket - R2 bucket binding
 * @param {string} key - Storage key/path
 * @param {File} file - File to store
 */
export async function storeFile(bucket, key, file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type
      }
    });
  } catch (error) {
    console.error(`Failed to store file ${key}:`, error);
    throw new Error(`Storage failed: ${error.message}`);
  }
}

/**
 * Retrieve a file from R2 bucket
 * @param {Object} bucket - R2 bucket binding
 * @param {string} key - Storage key/path
 * @returns {Object|null} R2 object or null if not found
 */
export async function retrieveFile(bucket, key) {
  try {
    const object = await bucket.get(key);
    return object;
  } catch (error) {
    console.error(`Failed to retrieve file ${key}:`, error);
    return null;
  }
}

/**
 * Delete files for a session
 * @param {Object} bucket - R2 bucket binding
 * @param {string} sessionId - Session ID
 */
export async function cleanupSession(bucket, sessionId) {
  try {
    const keys = [
      `${sessionId}/front.png`,
      `${sessionId}/back.png`,
      `${sessionId}/overlay.svg`,
      `${sessionId}/processed-front.png`,
      `${sessionId}/processed-back.png`,
      `${sessionId}/card.glb`
    ];
    
    await Promise.all(keys.map(key => bucket.delete(key).catch(() => {})));
  } catch (error) {
    console.error(`Failed to cleanup session ${sessionId}:`, error);
  }
}

/**
 * Convert ArrayBuffer to base64
 * @param {ArrayBuffer} buffer - Buffer to convert
 * @returns {string} Base64 string
 */
export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 to ArrayBuffer
 * @param {string} base64 - Base64 string
 * @returns {ArrayBuffer} Array buffer
 */
export function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}