/**
 * Simplified 3D card generator for Cloudflare Workers
 * Creates a basic GLB structure without Three.js dependency
 */

/**
 * Create a simple GLB file with card textures
 * @param {string} frontTextureData - Base64 data URL for front texture
 * @param {string} backTextureData - Base64 data URL for back texture
 * @returns {ArrayBuffer} Simple GLB file data
 */
export async function createSimple3DCard(frontTextureData, backTextureData) {
  try {
    // Create a minimal GLB structure
    // This is a simplified version that creates a basic 3D card
    
    // GLB header (12 bytes)
    const header = new ArrayBuffer(12);
    const headerView = new DataView(header);
    
    // Magic number "glTF"
    headerView.setUint32(0, 0x46546C67, true);
    // Version 2
    headerView.setUint32(4, 2, true);
    // Length will be set later
    
    // Create proper glTF 2.0 JSON structure
    const sceneData = {
      "asset": {
        "version": "2.0",
        "generator": "3D Card Generator"
      },
      "scene": 0,
      "scenes": [
        {
          "name": "Card Scene",
          "nodes": [0]
        }
      ],
      "nodes": [
        {
          "name": "Card",
          "mesh": 0
        }
      ],
      "meshes": [
        {
          "name": "Card Mesh",
          "primitives": [
            {
              "attributes": {
                "POSITION": 0,
                "NORMAL": 1,
                "TEXCOORD_0": 2
              },
              "indices": 3,
              "material": 0
            }
          ]
        }
      ],
      "materials": [
        {
          "name": "Card Material",
          "pbrMetallicRoughness": {
            "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
            "metallicFactor": 0.0,
            "roughnessFactor": 0.9
          }
        }
      ],
      "accessors": [
        {
          "bufferView": 0,
          "componentType": 5126,
          "count": 24,
          "max": [4.28, 2.699, 0.038],
          "min": [-4.28, -2.699, -0.038],
          "type": "VEC3"
        },
        {
          "bufferView": 1,
          "componentType": 5126,
          "count": 24,
          "type": "VEC3"
        },
        {
          "bufferView": 2,
          "componentType": 5126,
          "count": 24,
          "type": "VEC2"
        },
        {
          "bufferView": 3,
          "componentType": 5123,
          "count": 36,
          "type": "SCALAR"
        }
      ],
      "bufferViews": [
        {
          "buffer": 0,
          "byteOffset": 0,
          "byteLength": 288,
          "target": 34962
        },
        {
          "buffer": 0,
          "byteOffset": 288,
          "byteLength": 288,
          "target": 34962
        },
        {
          "buffer": 0,
          "byteOffset": 576,
          "byteLength": 192,
          "target": 34962
        },
        {
          "buffer": 0,
          "byteOffset": 768,
          "byteLength": 72,
          "target": 34963
        }
      ],
      "buffers": [
        {
          "byteLength": 840
        }
      ]
    };
    
    // Convert scene data to JSON string
    const jsonString = JSON.stringify(sceneData);
    const jsonBytes = new TextEncoder().encode(jsonString);
    
    // Pad JSON to 4-byte boundary
    const jsonPadding = (4 - (jsonBytes.length % 4)) % 4;
    const paddedJsonLength = jsonBytes.length + jsonPadding;
    
    // Create JSON chunk
    const jsonChunk = new ArrayBuffer(8 + paddedJsonLength);
    const jsonChunkView = new DataView(jsonChunk);
    const jsonChunkBytes = new Uint8Array(jsonChunk);
    
    // JSON chunk header
    jsonChunkView.setUint32(0, paddedJsonLength, true);
    jsonChunkView.setUint32(4, 0x4E4F534A, true); // "JSON"
    
    // JSON data
    jsonChunkBytes.set(jsonBytes, 8);
    
    // Add padding spaces
    for (let i = 0; i < jsonPadding; i++) {
      jsonChunkBytes[8 + jsonBytes.length + i] = 0x20; // space
    }
    
    // Create simple binary data (vertices, UVs, indices)
    const binaryData = createCardGeometry();
    
    // Binary chunk
    const binaryPadding = (4 - (binaryData.byteLength % 4)) % 4;
    const paddedBinaryLength = binaryData.byteLength + binaryPadding;
    
    const binaryChunk = new ArrayBuffer(8 + paddedBinaryLength);
    const binaryChunkView = new DataView(binaryChunk);
    const binaryChunkBytes = new Uint8Array(binaryChunk);
    
    // Binary chunk header
    binaryChunkView.setUint32(0, paddedBinaryLength, true);
    binaryChunkView.setUint32(4, 0x004E4942, true); // "BIN\0"
    
    // Binary data
    binaryChunkBytes.set(new Uint8Array(binaryData), 8);
    
    // Calculate total length
    const totalLength = 12 + jsonChunk.byteLength + binaryChunk.byteLength;
    headerView.setUint32(8, totalLength, true);
    
    // Combine all parts
    const glb = new ArrayBuffer(totalLength);
    const glbBytes = new Uint8Array(glb);
    
    let offset = 0;
    glbBytes.set(new Uint8Array(header), offset);
    offset += header.byteLength;
    glbBytes.set(new Uint8Array(jsonChunk), offset);
    offset += jsonChunk.byteLength;
    glbBytes.set(new Uint8Array(binaryChunk), offset);
    
    return glb;
    
  } catch (error) {
    console.error('Error creating simple 3D card:', error);
    throw new Error('Failed to create 3D card model: ' + error.message);
  }
}

/**
 * Create basic card geometry (box with card proportions)
 * @returns {ArrayBuffer} Geometry data
 */
function createCardGeometry() {
  // CR80 card dimensions (scaled for GLB)
  const width = 8.56;  // 85.6mm
  const height = 5.398; // 53.98mm
  const depth = 0.076;  // 0.76mm
  
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;
  
  // Vertices (8 vertices for a box)
  const vertices = new Float32Array([
    // Front face
    -halfWidth, -halfHeight,  halfDepth,
     halfWidth, -halfHeight,  halfDepth,
     halfWidth,  halfHeight,  halfDepth,
    -halfWidth,  halfHeight,  halfDepth,
    // Back face
    -halfWidth, -halfHeight, -halfDepth,
     halfWidth, -halfHeight, -halfDepth,
     halfWidth,  halfHeight, -halfDepth,
    -halfWidth,  halfHeight, -halfDepth
  ]);
  
  // UV coordinates
  const uvs = new Float32Array([
    0, 0, 1, 0, 1, 1, 0, 1, // Front
    1, 0, 0, 0, 0, 1, 1, 1  // Back
  ]);
  
  // Indices (triangles)
  const indices = new Uint16Array([
    // Front face
    0, 1, 2, 0, 2, 3,
    // Back face
    4, 6, 5, 4, 7, 6,
    // Top face
    3, 2, 6, 3, 6, 7,
    // Bottom face
    0, 5, 1, 0, 4, 5,
    // Right face
    1, 5, 6, 1, 6, 2,
    // Left face
    0, 3, 7, 0, 7, 4
  ]);
  
  // Combine all geometry data
  const totalSize = vertices.byteLength + uvs.byteLength + indices.byteLength;
  const geometryData = new ArrayBuffer(totalSize);
  const geometryBytes = new Uint8Array(geometryData);
  
  let offset = 0;
  geometryBytes.set(new Uint8Array(vertices.buffer), offset);
  offset += vertices.byteLength;
  geometryBytes.set(new Uint8Array(uvs.buffer), offset);
  offset += uvs.byteLength;
  geometryBytes.set(new Uint8Array(indices.buffer), offset);
  
  return geometryData;
}

/**
 * Create a placeholder GLB for testing
 * @returns {ArrayBuffer} Basic GLB file
 */
export async function createPlaceholderGLB() {
  // Return a minimal GLB that WordPress can load
  return createSimple3DCard('', '');
}