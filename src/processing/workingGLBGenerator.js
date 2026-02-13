import { generateCopyrightPNG, imageBufferToDataURL } from './imageProcessor.js';

/**
 * Working GLB generator that creates valid glTF 2.0 files
 * This creates a simple textured card that works with Three.js GLTFLoader
 */

/**
 * Create a working GLB file with embedded textures
 * @param {string} frontTextureData - Base64 data URL for front texture  
 * @param {string} backTextureData - Base64 data URL for back texture
 * @param {Object} copyrightOptions - Copyright text options { enabled: boolean, text: string }
 * @returns {ArrayBuffer} Valid GLB file
 */
export async function createWorkingGLB(frontTextureData, backTextureData, copyrightOptions = { enabled: false }) {
  try {
    // Extract base64 data from data URLs
    const frontBase64 = frontTextureData.replace(/^data:image\/[a-z]+;base64,/, '');
    const backBase64 = backTextureData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convert base64 to binary data
    const frontImageData = base64ToArrayBuffer(frontBase64);
    const backImageData = base64ToArrayBuffer(backBase64);
    
    // Generate copyright edge texture if enabled
    let edgeImageData = null;
    if (copyrightOptions.enabled && copyrightOptions.text) {
      // Generate PNG with copyright text (512px wide, 48px tall for the edge strip)
      // Using 48px height to accommodate the 7x11 Inter-style font scaled 2x (22px) plus padding
      const copyrightPNG = generateCopyrightPNG(copyrightOptions.text, 512, 48);
      edgeImageData = copyrightPNG;
    }
    
    // Create geometry data and get vertex counts
    const geometryData = createCardGeometry();
    const geometryBuffer = geometryData.buffer;
    const { frontVertexCount, backVertexCount, frontIndexCount, backIndexCount, edgeVertexCount, edgeIndexCount } = geometryData;
    
    // Calculate buffer sizes for both images
    const geometrySize = geometryBuffer.byteLength;
    const frontImageSize = frontImageData.byteLength;
    const backImageSize = backImageData.byteLength;
    const edgeImageSize = edgeImageData ? edgeImageData.byteLength : 0;
    
    // Align to 4-byte boundaries
    const geometryAligned = alignTo4(geometrySize);
    const frontImageAligned = alignTo4(frontImageSize);
    const backImageAligned = alignTo4(backImageSize);
    const edgeImageAligned = edgeImageData ? alignTo4(edgeImageSize) : 0;
    
    const totalBinarySize = geometryAligned + frontImageAligned + backImageAligned + edgeImageAligned;
    
    // Create glTF JSON
    const gltf = {
      "asset": {
        "version": "2.0",
        "generator": "3D Card Generator v1.0"
      },
      "scene": 0,
      "scenes": [
        {
          "nodes": [0]
        }
      ],
      "nodes": [
        {
          "mesh": 0
        }
      ],
      "meshes": [
        {
          "primitives": [
            {
              "attributes": {
                "POSITION": 0,
                "NORMAL": 1,
                "TEXCOORD_0": 2
              },
              "indices": 3,
              "material": 0
            },
            {
              "attributes": {
                "POSITION": 4,
                "NORMAL": 5,
                "TEXCOORD_0": 6
              },
              "indices": 7,
              "material": 1
            },
            {
              "attributes": {
                "POSITION": 8,
                "NORMAL": 9,
                "TEXCOORD_0": 10
              },
              "indices": 11,
              "material": 2
            }
          ]
        }
      ],
      "materials": [
        {
          "name": "Front Material",
          "pbrMetallicRoughness": {
            "baseColorTexture": {
              "index": 0
            },
            "metallicFactor": 0.0,
            "roughnessFactor": 0.9
          },
          "doubleSided": true
        },
        {
          "name": "Back Material",
          "pbrMetallicRoughness": {
            "baseColorTexture": {
              "index": 1
            },
            "metallicFactor": 0.0,
            "roughnessFactor": 0.9
          },
          "doubleSided": true
        },
        edgeImageData ? {
          "name": "Edge Material",
          "pbrMetallicRoughness": {
            "baseColorTexture": {
              "index": 2
            },
            "metallicFactor": 0.0,
            "roughnessFactor": 0.8
          },
          "doubleSided": true
        } : {
          "name": "Edge Material",
          "pbrMetallicRoughness": {
            "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
            "metallicFactor": 0.0,
            "roughnessFactor": 0.8
          },
          "doubleSided": true
        }
      ],
      "samplers": edgeImageData ? [
        { "magFilter": 9729, "minFilter": 9987, "wrapS": 33071, "wrapT": 33071 },  // Front/back: clamp to edge
        { "magFilter": 9729, "minFilter": 9987, "wrapS": 10497, "wrapT": 33071 }   // Edge: repeat horizontally, clamp vertically
      ] : [
        { "magFilter": 9729, "minFilter": 9987, "wrapS": 33071, "wrapT": 33071 }   // Clamp to edge
      ],
      "textures": edgeImageData ? [
        { "source": 0, "sampler": 0 },
        { "source": 1, "sampler": 0 },
        { "source": 2, "sampler": 1 }
      ] : [
        { "source": 0, "sampler": 0 },
        { "source": 1, "sampler": 0 }
      ],
      "images": edgeImageData ? [
        { "bufferView": 1, "mimeType": "image/png" },
        { "bufferView": 2, "mimeType": "image/png" },
        { "bufferView": 3, "mimeType": "image/png" }
      ] : [
        { "bufferView": 1, "mimeType": "image/png" },
        { "bufferView": 2, "mimeType": "image/png" }
      ],
      "accessors": createAccessors(geometryBuffer, frontVertexCount, frontIndexCount, backVertexCount, backIndexCount, edgeVertexCount, edgeIndexCount),
      "bufferViews": edgeImageData ? [
        {
          "buffer": 0,
          "byteOffset": 0,
          "byteLength": geometrySize,
          "target": 34962
        },
        {
          "buffer": 0,
          "byteOffset": geometryAligned,
          "byteLength": frontImageSize
        },
        {
          "buffer": 0,
          "byteOffset": geometryAligned + frontImageAligned,
          "byteLength": backImageSize
        },
        {
          "buffer": 0,
          "byteOffset": geometryAligned + frontImageAligned + backImageAligned,
          "byteLength": edgeImageSize
        }
      ] : [
        {
          "buffer": 0,
          "byteOffset": 0,
          "byteLength": geometrySize,
          "target": 34962
        },
        {
          "buffer": 0,
          "byteOffset": geometryAligned,
          "byteLength": frontImageSize
        },
        {
          "buffer": 0,
          "byteOffset": geometryAligned + frontImageAligned,
          "byteLength": backImageSize
        }
      ],
      "buffers": [
        {
          "byteLength": totalBinarySize
        }
      ]
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(gltf);
    const jsonBytes = new TextEncoder().encode(jsonString);
    
    // Pad JSON to 4-byte boundary
    const jsonPadded = padTo4Bytes(jsonBytes);
    
    // Create binary buffer with geometry and images
    const binaryBuffer = new ArrayBuffer(totalBinarySize);
    const binaryView = new Uint8Array(binaryBuffer);
    
    let offset = 0;
    
    // Add geometry
    binaryView.set(new Uint8Array(geometryBuffer), offset);
    offset = geometryAligned;
    
    // Add front image
    binaryView.set(new Uint8Array(frontImageData), offset);
    offset = geometryAligned + frontImageAligned;
    
    // Add back image
    binaryView.set(new Uint8Array(backImageData), offset);
    
    // Add edge image if copyright is enabled
    if (edgeImageData) {
      offset = geometryAligned + frontImageAligned + backImageAligned;
      binaryView.set(new Uint8Array(edgeImageData), offset);
    }
    
    // Create GLB file
    const glbSize = 12 + 8 + jsonPadded.byteLength + 8 + totalBinarySize;
    const glb = new ArrayBuffer(glbSize);
    const glbView = new DataView(glb);
    const glbBytes = new Uint8Array(glb);
    
    offset = 0;
    
    // GLB header
    glbView.setUint32(offset, 0x46546C67, true); // "glTF"
    offset += 4;
    glbView.setUint32(offset, 2, true); // version
    offset += 4;
    glbView.setUint32(offset, glbSize, true); // total length
    offset += 4;
    
    // JSON chunk
    glbView.setUint32(offset, jsonPadded.byteLength, true);
    offset += 4;
    glbView.setUint32(offset, 0x4E4F534A, true); // "JSON"
    offset += 4;
    glbBytes.set(jsonPadded, offset);
    offset += jsonPadded.byteLength;
    
    // Binary chunk
    glbView.setUint32(offset, totalBinarySize, true);
    offset += 4;
    glbView.setUint32(offset, 0x004E4942, true); // "BIN\0"
    offset += 4;
    glbBytes.set(new Uint8Array(binaryBuffer), offset);
    
    return glb;
    
  } catch (error) {
    console.error('Error creating working GLB:', error);
    throw error;
  }
}

/**
 * Create complete card geometry with front, back, edge faces, and rounded corners
 * Uses CR80 standard: 85.6mm × 53.98mm with 3.18mm corner radius
 */
function createCardGeometry() {
  // ID-1 format (CR80): 85.60mm × 53.98mm × 0.76mm
  // Corner radius: 2.88-3.48mm (using 3.18mm average)
  // Simple scale: 0.05 (1mm = 0.05 units for manageable size)
  const scale = 0.05;
  const cardWidth = 85.6 * scale;   // 4.28 units
  const cardHeight = 53.98 * scale; // 2.699 units
  const cardThickness = 0.76 * scale; // 0.038 units
  const cornerRadius = 3.18 * scale;  // 0.159 units
  
  // Use half dimensions for centered geometry
  const w = cardWidth / 2;     // 2.14 units
  const h = cardHeight / 2;    // 1.3495 units
  const d = cardThickness / 2; // 0.019 units
  const r = cornerRadius;      // 0.159 units
  
  // Create rounded rectangle geometry with proper ISO 7810 corner radius
  const { positions: frontPos, uvs: frontUV, indices: frontIdx } = createRoundedRectangle(w, h, r, d, true);
  const { positions: backPos, uvs: backUV, indices: backIdx } = createRoundedRectangle(w, h, r, -d, false);
  const { positions: edgePos, normals: edgeNorm, uvs: edgeUV, indices: edgeIdx } = createMatchingRoundedEdges(w, h, r, d);
  
  // Create normals for rounded rectangles
  const frontVertexCount = frontPos.length / 3;
  const backVertexCount = backPos.length / 3;
  const frontNormals = new Float32Array(frontVertexCount * 3);
  const backNormals = new Float32Array(backVertexCount * 3);
  
  // Fill front face normals (pointing up in +Z direction)
  for (let i = 0; i < frontVertexCount; i++) {
    frontNormals[i * 3] = 0;     // x
    frontNormals[i * 3 + 1] = 0; // y
    frontNormals[i * 3 + 2] = 1; // z
  }
  
  // Fill back face normals (pointing down in -Z direction)
  for (let i = 0; i < backVertexCount; i++) {
    backNormals[i * 3] = 0;      // x
    backNormals[i * 3 + 1] = 0;  // y
    backNormals[i * 3 + 2] = -1; // z
  }
  
  // Calculate total buffer size
  const totalSize = 
    frontPos.byteLength + frontNormals.byteLength + frontUV.byteLength + frontIdx.byteLength +
    backPos.byteLength + backNormals.byteLength + backUV.byteLength + backIdx.byteLength +
    edgePos.byteLength + edgeNorm.byteLength + edgeUV.byteLength + edgeIdx.byteLength;
  
  const buffer = new ArrayBuffer(totalSize);
  const bytes = new Uint8Array(buffer);
  
  let offset = 0;
  
  // Front face data
  bytes.set(new Uint8Array(frontPos.buffer), offset); offset += frontPos.byteLength;
  bytes.set(new Uint8Array(frontNormals.buffer), offset); offset += frontNormals.byteLength;
  bytes.set(new Uint8Array(frontUV.buffer), offset); offset += frontUV.byteLength;
  bytes.set(new Uint8Array(frontIdx.buffer), offset); offset += frontIdx.byteLength;
  
  // Back face data  
  bytes.set(new Uint8Array(backPos.buffer), offset); offset += backPos.byteLength;
  bytes.set(new Uint8Array(backNormals.buffer), offset); offset += backNormals.byteLength;
  bytes.set(new Uint8Array(backUV.buffer), offset); offset += backUV.byteLength;
  bytes.set(new Uint8Array(backIdx.buffer), offset); offset += backIdx.byteLength;
  
  // Edge face data
  bytes.set(new Uint8Array(edgePos.buffer), offset); offset += edgePos.byteLength;
  bytes.set(new Uint8Array(edgeNorm.buffer), offset); offset += edgeNorm.byteLength;
  bytes.set(new Uint8Array(edgeUV.buffer), offset); offset += edgeUV.byteLength;
  bytes.set(new Uint8Array(edgeIdx.buffer), offset);
  
  return {
    buffer,
    frontVertexCount,
    backVertexCount,
    frontIndexCount: frontIdx.length,
    backIndexCount: backIdx.length,
    edgeVertexCount: edgePos.length / 3,
    edgeIndexCount: edgeIdx.length
  };
}

/**
 * Create a rounded rectangle with specified corner radius
 * @param {number} w - half width
 * @param {number} h - half height  
 * @param {number} r - corner radius
 * @param {number} z - z position
 * @param {boolean} isFront - true for front face, false for back
 * @returns {Object} positions, uvs, and indices arrays
 */
function createSimpleRectangle(w, h, z, isFront) {
  // Simple 4-vertex rectangle
  const positions = new Float32Array([
    -w, -h, z,  // bottom-left
     w, -h, z,  // bottom-right
     w,  h, z,  // top-right
    -w,  h, z   // top-left
  ]);
  
  // Fix UV mapping for back face to appear correctly oriented
  let uvs;
  if (isFront) {
    // Front face: normal UV mapping
    uvs = new Float32Array([
      0, 1,  // bottom-left
      1, 1,  // bottom-right  
      1, 0,  // top-right
      0, 0   // top-left
    ]);
  } else {
    // Back face: flip horizontally to account for viewing from behind
    uvs = new Float32Array([
      1, 1,  // bottom-left (flipped horizontally)
      0, 1,  // bottom-right (flipped horizontally)
      0, 0,  // top-right (flipped horizontally)
      1, 0   // top-left (flipped horizontally)
    ]);
  }
  
  const indices = new Uint16Array([
    0, 1, 2,  // first triangle
    0, 2, 3   // second triangle
  ]);
  
  return { positions, uvs, indices };
}

function createSimpleEdges(w, h, d) {
  // Create edge faces (4 sides)
  const positions = new Float32Array([
    // Bottom edge
    -w, -h, -d,  w, -h, -d,  w, -h,  d, -w, -h,  d,
    // Top edge
    -w,  h, -d, -w,  h,  d,  w,  h,  d,  w,  h, -d,
    // Left edge
    -w, -h, -d, -w, -h,  d, -w,  h,  d, -w,  h, -d,
    // Right edge
     w, -h, -d,  w,  h, -d,  w,  h,  d,  w, -h,  d
  ]);
  
  const normals = new Float32Array([
    // Bottom edge normals
    0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
    // Top edge normals
    0,  1, 0,  0,  1, 0,  0,  1, 0,  0,  1, 0,
    // Left edge normals
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    // Right edge normals
     1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0
  ]);
  
  const uvs = new Float32Array([
    // Simple UV mapping for edges
    0, 0, 1, 0, 1, 1, 0, 1,  // Bottom
    0, 0, 1, 0, 1, 1, 0, 1,  // Top
    0, 0, 1, 0, 1, 1, 0, 1,  // Left
    0, 0, 1, 0, 1, 1, 0, 1   // Right
  ]);
  
  const indices = new Uint16Array([
    // Bottom edge
    0, 1, 2,  0, 2, 3,
    // Top edge
    4, 5, 6,  4, 6, 7,
    // Left edge
    8, 9, 10,  8, 10, 11,
    // Right edge
    12, 13, 14,  12, 14, 15
  ]);
  
  return { positions, normals, uvs, indices };
}

function createRoundedRectangle(w, h, r, z, isFront) {
  // Create a rounded rectangle using a grid of quads
  // This approach avoids the triangle fan distortion issues
  const positions = [];
  const uvs = [];
  const indices = [];
  
  // Number of segments for each corner arc (increased for smoother curves)
  const cornerSegments = 12;
  
  // Create vertices for rounded rectangle
  // We'll build it as a grid with rounded corners
  const vertices = [];
  
  // Bottom edge: left corner, straight edge, right corner
  // Bottom-left corner arc (180° to 270°)
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = Math.PI + (Math.PI / 2) * (i / cornerSegments);
    const x = (-w + r) + r * Math.cos(angle);
    const y = (-h + r) + r * Math.sin(angle);
    vertices.push({ x, y });
  }
  
  // Bottom straight edge
  const bottomSteps = 8;
  for (let i = 1; i < bottomSteps; i++) {
    const t = i / bottomSteps;
    const x = (-w + r) + t * (2 * w - 2 * r);
    const y = -h;
    vertices.push({ x, y });
  }
  
  // Bottom-right corner arc (270° to 360°)
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = (3 * Math.PI / 2) + (Math.PI / 2) * (i / cornerSegments);
    const x = (w - r) + r * Math.cos(angle);
    const y = (-h + r) + r * Math.sin(angle);
    vertices.push({ x, y });
  }
  
  // Right straight edge
  const rightSteps = 8;
  for (let i = 1; i < rightSteps; i++) {
    const t = i / rightSteps;
    const x = w;
    const y = (-h + r) + t * (2 * h - 2 * r);
    vertices.push({ x, y });
  }
  
  // Top-right corner arc (0° to 90°)
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = 0 + (Math.PI / 2) * (i / cornerSegments);
    const x = (w - r) + r * Math.cos(angle);
    const y = (h - r) + r * Math.sin(angle);
    vertices.push({ x, y });
  }
  
  // Top straight edge
  const topSteps = 8;
  for (let i = 1; i < topSteps; i++) {
    const t = i / topSteps;
    const x = (w - r) - t * (2 * w - 2 * r);
    const y = h;
    vertices.push({ x, y });
  }
  
  // Top-left corner arc (90° to 180°)
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = (Math.PI / 2) + (Math.PI / 2) * (i / cornerSegments);
    const x = (-w + r) + r * Math.cos(angle);
    const y = (h - r) + r * Math.sin(angle);
    vertices.push({ x, y });
  }
  
  // Left straight edge
  const leftSteps = 8;
  for (let i = 1; i < leftSteps; i++) {
    const t = i / leftSteps;
    const x = -w;
    const y = (h - r) - t * (2 * h - 2 * r);
    vertices.push({ x, y });
  }
  
  // Add center vertex for triangle fan
  vertices.unshift({ x: 0, y: 0 }); // Add at beginning
  
  // Convert vertices to positions and UVs
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    positions.push(vertex.x, vertex.y, z);
    
    // Calculate UV coordinates with proper radius mapping
    // The UV should map the texture so its corners align with the geometry corners
    // This means the UV radius should be r/(2*w) for U and r/(2*h) for V
    
    let u, v;
    
    // For the center vertex (index 0), use center UV
    if (i === 0) {
      u = 0.5;
      v = 0.5;
    } else {
      // Map vertex position to UV space maintaining the radius ratio
      // Add a small inset to prevent texture bleeding at edges
      const uvInset = 0.002; // Small inset to ensure clean edges
      
      // Calculate UV with inset
      u = (vertex.x + w) / (2 * w);
      v = (vertex.y + h) / (2 * h);
      
      // Apply inset toward center
      u = uvInset + u * (1 - 2 * uvInset);
      v = uvInset + v * (1 - 2 * uvInset);
    }
    
    if (isFront) {
      uvs.push(u, 1 - v); // Flip V for front face
    } else {
      uvs.push(1 - u, 1 - v); // Flip both for back face
    }
  }
  
  // Create triangle fan indices (center to each edge)
  const perimeterVertices = vertices.length - 1; // Exclude center vertex
  for (let i = 0; i < perimeterVertices; i++) {
    const next = (i + 1) % perimeterVertices;
    if (isFront) {
      indices.push(0, i + 1, next + 1);
    } else {
      indices.push(0, next + 1, i + 1); // Reverse winding for back face
    }
  }
  
  return {
    positions: new Float32Array(positions),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices)
  };
}

/**
 * Create rounded edge geometry that matches the rounded rectangle faces
 * @param {number} w - half width
 * @param {number} h - half height
 * @param {number} r - corner radius
 * @param {number} d - half depth
 * @returns {Object} positions, normals, uvs, and indices arrays
 */
function createMatchingRoundedEdges(w, h, r, d) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  
  // Number of segments for each corner arc (match the face geometry)
  const cornerSegments = 12;
  const bottomSteps = 8;
  const rightSteps = 8;
  const topSteps = 8;
  const leftSteps = 8;
  
  // Create the same perimeter path as in createRoundedRectangle
  const perimeterVertices = [];
  
  // Bottom-left corner arc (180° to 270°)
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = Math.PI + (Math.PI / 2) * (i / cornerSegments);
    const x = (-w + r) + r * Math.cos(angle);
    const y = (-h + r) + r * Math.sin(angle);
    perimeterVertices.push({ x, y, nx: Math.cos(angle), ny: Math.sin(angle) });
  }
  
  // Bottom straight edge
  for (let i = 1; i < bottomSteps; i++) {
    const t = i / bottomSteps;
    const x = (-w + r) + t * (2 * w - 2 * r);
    const y = -h;
    perimeterVertices.push({ x, y, nx: 0, ny: -1 });
  }
  
  // Bottom-right corner arc (270° to 360°)
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = (3 * Math.PI / 2) + (Math.PI / 2) * (i / cornerSegments);
    const x = (w - r) + r * Math.cos(angle);
    const y = (-h + r) + r * Math.sin(angle);
    perimeterVertices.push({ x, y, nx: Math.cos(angle), ny: Math.sin(angle) });
  }
  
  // Right straight edge
  for (let i = 1; i < rightSteps; i++) {
    const t = i / rightSteps;
    const x = w;
    const y = (-h + r) + t * (2 * h - 2 * r);
    perimeterVertices.push({ x, y, nx: 1, ny: 0 });
  }
  
  // Top-right corner arc (0° to 90°)
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = 0 + (Math.PI / 2) * (i / cornerSegments);
    const x = (w - r) + r * Math.cos(angle);
    const y = (h - r) + r * Math.sin(angle);
    perimeterVertices.push({ x, y, nx: Math.cos(angle), ny: Math.sin(angle) });
  }
  
  // Top straight edge
  for (let i = 1; i < topSteps; i++) {
    const t = i / topSteps;
    const x = (w - r) - t * (2 * w - 2 * r);
    const y = h;
    perimeterVertices.push({ x, y, nx: 0, ny: 1 });
  }
  
  // Top-left corner arc (90° to 180°)
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = (Math.PI / 2) + (Math.PI / 2) * (i / cornerSegments);
    const x = (-w + r) + r * Math.cos(angle);
    const y = (h - r) + r * Math.sin(angle);
    perimeterVertices.push({ x, y, nx: Math.cos(angle), ny: Math.sin(angle) });
  }
  
  // Left straight edge
  for (let i = 1; i < leftSteps; i++) {
    const t = i / leftSteps;
    const x = -w;
    const y = (h - r) - t * (2 * h - 2 * r);
    perimeterVertices.push({ x, y, nx: -1, ny: 0 });
  }
  
  // First, calculate total perimeter length for proper UV mapping
  let totalPerimeter = 0;
  const segmentLengths = [];
  for (let i = 0; i < perimeterVertices.length; i++) {
    const current = perimeterVertices[i];
    const next = perimeterVertices[(i + 1) % perimeterVertices.length];
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(len);
    totalPerimeter += len;
  }
  
  // The edge thickness (height of the edge strip) is 2*d
  const edgeHeight = 2 * d;
  
  // Calculate UV scale factor to maintain aspect ratio
  // We want the texture to tile properly - the texture is 512x32 (16:1 aspect)
  // The perimeter is much longer than the edge height
  // Scale U so that 1 unit of U = 1 unit of V in world space
  const textureAspect = 512 / 48; // ~10.67:1
  const uvScale = totalPerimeter / edgeHeight / textureAspect;
  
  // Create edge quads between front and back faces
  let vertexCount = 0;
  let accumulatedLength = 0;
  
  for (let i = 0; i < perimeterVertices.length; i++) {
    const current = perimeterVertices[i];
    const next = perimeterVertices[(i + 1) % perimeterVertices.length];
    
    // Create quad for this edge segment
    positions.push(
      current.x, current.y, -d,  // current back
      next.x, next.y, -d,       // next back
      next.x, next.y, d,        // next front  
      current.x, current.y, d   // current front
    );
    
    // Calculate outward normal for this edge segment
    const edgeVec = { x: next.x - current.x, y: next.y - current.y };
    const edgeLen = Math.sqrt(edgeVec.x * edgeVec.x + edgeVec.y * edgeVec.y);
    
    let nx = 0, ny = 0;
    if (edgeLen > 0.001) {
      // Perpendicular to edge, pointing outward (rotate 90° clockwise)
      nx = edgeVec.y / edgeLen;
      ny = -edgeVec.x / edgeLen;
    } else {
      // Use vertex normal if edge is too short
      nx = (current.nx + next.nx) / 2;
      ny = (current.ny + next.ny) / 2;
    }
    
    // All 4 vertices of this quad have the same outward normal
    normals.push(
      nx, ny, 0,  // current back
      nx, ny, 0,  // next back
      nx, ny, 0,  // next front
      nx, ny, 0   // current front
    );
    
    // UV mapping that maintains proper aspect ratio
    // U is based on actual distance along perimeter (scaled for texture aspect)
    // This allows the texture to tile/repeat naturally
    // Flip U coordinates (use negative direction) so text reads correctly from outside
    const u1 = (1 - accumulatedLength / totalPerimeter) * uvScale;
    const u2 = (1 - (accumulatedLength + segmentLengths[i]) / totalPerimeter) * uvScale;
    accumulatedLength += segmentLengths[i];
    
    uvs.push(
      u1, 0,  // current back
      u2, 0,  // next back
      u2, 1,  // next front
      u1, 1   // current front
    );
    
    // Two triangles to form the quad
    const baseIdx = vertexCount;
    indices.push(
      baseIdx, baseIdx + 1, baseIdx + 2,      // First triangle
      baseIdx, baseIdx + 2, baseIdx + 3       // Second triangle
    );
    
    vertexCount += 4;
  }
  
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices)
  };
}

/**
 * Create rounded edge geometry
 * @param {number} w - half width
 * @param {number} h - half height
 * @param {number} r - corner radius
 * @param {number} d - half depth
 * @returns {Object} positions, normals, uvs, and indices arrays
 */
function createRoundedEdges(w, h, r, halfThickness) {
  const cornerSegments = 8;
  const edgeSteps = 6;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  
  let vertexCount = 0;
  
  // Create the same perimeter path as in createRoundedRectangle
  const perimeterPoints = [];
  
  // Bottom-right corner arc (270° to 360°)
  const brCenter = { x: w - r, y: -h + r };
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = (3 * Math.PI / 2) + (Math.PI / 2) * (i / cornerSegments);
    const x = brCenter.x + r * Math.cos(angle);
    const y = brCenter.y + r * Math.sin(angle);
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    perimeterPoints.push({ x, y, nx, ny });
  }
  
  // Bottom edge
  for (let i = 1; i < edgeSteps; i++) {
    const t = i / edgeSteps;
    const x = (w - r) - t * (2 * (w - r));
    const y = -h;
    perimeterPoints.push({ x, y, nx: 0, ny: -1 });
  }
  
  // Bottom-left corner arc (180° to 270°)
  const blCenter = { x: -w + r, y: -h + r };
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = Math.PI + (Math.PI / 2) * (i / cornerSegments);
    const x = blCenter.x + r * Math.cos(angle);
    const y = blCenter.y + r * Math.sin(angle);
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    perimeterPoints.push({ x, y, nx, ny });
  }
  
  // Left edge
  for (let i = 1; i < edgeSteps; i++) {
    const t = i / edgeSteps;
    const x = -w;
    const y = (-h + r) + t * (2 * (h - r));
    perimeterPoints.push({ x, y, nx: -1, ny: 0 });
  }
  
  // Top-left corner arc (90° to 180°)
  const tlCenter = { x: -w + r, y: h - r };
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = (Math.PI / 2) + (Math.PI / 2) * (i / cornerSegments);
    const x = tlCenter.x + r * Math.cos(angle);
    const y = tlCenter.y + r * Math.sin(angle);
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    perimeterPoints.push({ x, y, nx, ny });
  }
  
  // Top edge
  for (let i = 1; i < edgeSteps; i++) {
    const t = i / edgeSteps;
    const x = (-w + r) + t * (2 * (w - r));
    const y = h;
    perimeterPoints.push({ x, y, nx: 0, ny: 1 });
  }
  
  // Top-right corner arc (0° to 90°)
  const trCenter = { x: w - r, y: h - r };
  for (let i = 0; i <= cornerSegments; i++) {
    const angle = 0 + (Math.PI / 2) * (i / cornerSegments);
    const x = trCenter.x + r * Math.cos(angle);
    const y = trCenter.y + r * Math.sin(angle);
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    perimeterPoints.push({ x, y, nx, ny });
  }
  
  // Right edge
  for (let i = 1; i < edgeSteps; i++) {
    const t = i / edgeSteps;
    const x = w;
    const y = (h - r) - t * (2 * (h - r));
    perimeterPoints.push({ x, y, nx: 1, ny: 0 });
  }
  
  // Create edge quads between adjacent perimeter points
  for (let i = 0; i < perimeterPoints.length; i++) {
    const p1 = perimeterPoints[i];
    const p2 = perimeterPoints[(i + 1) % perimeterPoints.length]; // Wrap around
    
    const startIdx = vertexCount;
    
    // Create quad: p1_back, p2_back, p2_front, p1_front (proper winding)
    positions.push(
      p1.x, p1.y, -halfThickness,  // p1 back (0)
      p2.x, p2.y, -halfThickness,  // p2 back (1)
      p2.x, p2.y, halfThickness,   // p2 front (2)
      p1.x, p1.y, halfThickness    // p1 front (3)
    );
    
    // Calculate edge normal (perpendicular to edge direction, pointing outward)
    const edgeVec = { x: p2.x - p1.x, y: p2.y - p1.y };
    const edgeLen = Math.sqrt(edgeVec.x * edgeVec.x + edgeVec.y * edgeVec.y);
    let nx = 0, ny = 0;
    
    if (edgeLen > 0.001) {
      // Normalize edge vector
      edgeVec.x /= edgeLen;
      edgeVec.y /= edgeLen;
      
      // Get perpendicular (rotate 90 degrees clockwise for outward normal)
      nx = edgeVec.y;
      ny = -edgeVec.x;
    } else {
      // Fallback to point normal if edge is too short
      nx = (p1.nx + p2.nx) / 2;
      ny = (p1.ny + p2.ny) / 2;
    }
    
    // All vertices on this edge have same outward normal
    normals.push(
      nx, ny, 0,  // p1 back normal
      nx, ny, 0,  // p2 back normal  
      nx, ny, 0,  // p2 front normal
      nx, ny, 0   // p1 front normal
    );
    
    // Simple UV mapping for white edges (stretch texture along edge)
    const u1 = i / perimeterPoints.length;
    const u2 = (i + 1) / perimeterPoints.length;
    uvs.push(
      u1, 0,  // p1 back
      u2, 0,  // p2 back
      u2, 1,  // p2 front
      u1, 1   // p1 front
    );
    
    // Two triangles to form the quad (counter-clockwise winding)
    indices.push(
      startIdx, startIdx + 1, startIdx + 2,      // First triangle
      startIdx, startIdx + 2, startIdx + 3       // Second triangle
    );
    
    vertexCount += 4;
  }
  
  console.log('Created edge geometry:', { 
    perimeterPoints: perimeterPoints.length, 
    totalVertices: vertexCount,
    totalQuads: perimeterPoints.length
  });
  
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices)
  };
}

/**
 * Create accessors dynamically based on geometry data
 * @param {ArrayBuffer} geometryBuffer - The geometry buffer
 * @returns {Array} glTF accessors array
 */
function createAccessors(geometryBuffer, frontVertexCount, frontIndexCount, backVertexCount, backIndexCount, edgeVertexCount, edgeIndexCount) {
  // CR80 dimensions for min/max bounds with correct scale
  const scale = 0.05;
  const w = 85.6 / 2 * scale;
  const h = 53.98 / 2 * scale;
  const halfThickness = 0.76 / 2 * scale;
  
  let offset = 0;
  const accessors = [];
  
  // Front face accessors (0, 1, 2, 3)
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5126,
    "count": frontVertexCount,
    "max": [w, h, halfThickness],
    "min": [-w, -h, halfThickness],
    "type": "VEC3"
  });
  offset += frontVertexCount * 12; // 3 floats * 4 bytes
  
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5126,
    "count": frontVertexCount,
    "type": "VEC3"
  });
  offset += frontVertexCount * 12;
  
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5126,
    "count": frontVertexCount,
    "type": "VEC2"
  });
  offset += frontVertexCount * 8; // 2 floats * 4 bytes
  
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5123,
    "count": frontIndexCount,
    "type": "SCALAR"
  });
  offset += frontIndexCount * 2; // 1 uint16 * 2 bytes
  
  // Back face accessors (4, 5, 6, 7)
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5126,
    "count": backVertexCount,
    "max": [w, h, -halfThickness],
    "min": [-w, -h, -halfThickness],
    "type": "VEC3"
  });
  offset += backVertexCount * 12;
  
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5126,
    "count": backVertexCount,
    "type": "VEC3"
  });
  offset += backVertexCount * 12;
  
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5126,
    "count": backVertexCount,
    "type": "VEC2"
  });
  offset += backVertexCount * 8;
  
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5123,
    "count": backIndexCount,
    "type": "SCALAR"
  });
  offset += backIndexCount * 2;
  
  // Edge accessors (8, 9, 10, 11)
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5126,
    "count": edgeVertexCount,
    "max": [w, h, halfThickness],
    "min": [-w, -h, -halfThickness],
    "type": "VEC3"
  });
  offset += edgeVertexCount * 12;
  
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5126,
    "count": edgeVertexCount,
    "type": "VEC3"
  });
  offset += edgeVertexCount * 12;
  
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5126,
    "count": edgeVertexCount,
    "type": "VEC2"
  });
  offset += edgeVertexCount * 8;
  
  accessors.push({
    "bufferView": 0,
    "byteOffset": offset,
    "componentType": 5123,
    "count": edgeIndexCount,
    "type": "SCALAR"
  });
  
  return accessors;
}

// Helper functions
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function alignTo4(size) {
  return Math.ceil(size / 4) * 4;
}

function padTo4Bytes(data) {
  const padding = (4 - (data.length % 4)) % 4;
  const padded = new Uint8Array(data.length + padding);
  padded.set(data);
  // Fill padding with spaces
  for (let i = 0; i < padding; i++) {
    padded[data.length + i] = 0x20;
  }
  return padded;
}