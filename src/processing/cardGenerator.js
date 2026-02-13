// Simplified 3D card generation for Cloudflare Workers
// Three.js is too heavy for Workers, so we create a basic GLB structure

/**
 * CR80 Card specifications
 */
const CARD_SPECS = {
  width: 85.6,    // mm
  height: 53.98,  // mm
  thickness: 0.76, // mm
  cornerRadius: 3.18, // mm
  scale: 0.1      // Scale factor for Three.js units
};

/**
 * Create a 3D card model with textures
 * @param {string} frontTextureData - Base64 or data URL for front texture
 * @param {string} backTextureData - Base64 or data URL for back texture
 * @param {Object} options - Additional options
 * @returns {Promise<THREE.Scene>} Three.js scene with card model
 */
export async function create3DCard(frontTextureData, backTextureData, options = {}) {
  try {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Calculate dimensions in Three.js units
    const cardWidth = CARD_SPECS.width * CARD_SPECS.scale;
    const cardHeight = CARD_SPECS.height * CARD_SPECS.scale;
    const cardThickness = CARD_SPECS.thickness * CARD_SPECS.scale;
    
    // Create rounded box geometry for the card
    const geometry = createRoundedBoxGeometry(
      cardWidth,
      cardHeight,
      cardThickness,
      CARD_SPECS.cornerRadius * CARD_SPECS.scale
    );
    
    // Create texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Load textures
    const frontTexture = await loadTexture(textureLoader, frontTextureData);
    const backTexture = await loadTexture(textureLoader, backTextureData);
    
    // Configure textures
    frontTexture.encoding = THREE.sRGBEncoding;
    backTexture.encoding = THREE.sRGBEncoding;
    
    // Create materials for each face
    const materials = [
      // Right edge (positive X)
      new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.1
      }),
      // Left edge (negative X)
      new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.1
      }),
      // Top edge (positive Y)
      new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.1
      }),
      // Bottom edge (negative Y)
      new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.1
      }),
      // Front face (positive Z)
      new THREE.MeshStandardMaterial({ 
        map: frontTexture,
        roughness: 0.4,
        metalness: 0.1
      }),
      // Back face (negative Z)
      new THREE.MeshStandardMaterial({ 
        map: backTexture,
        roughness: 0.4,
        metalness: 0.1
      })
    ];
    
    // Create card mesh
    const card = new THREE.Mesh(geometry, materials);
    card.castShadow = true;
    card.receiveShadow = true;
    scene.add(card);
    
    // Add lighting
    setupLighting(scene);
    
    // Add optional camera if needed for export
    if (options.includeCamera) {
      const camera = new THREE.PerspectiveCamera(
        45,
        cardWidth / cardHeight,
        0.1,
        100
      );
      camera.position.set(0, 0, 15);
      camera.lookAt(0, 0, 0);
      scene.add(camera);
    }
    
    return scene;
  } catch (error) {
    console.error('Error creating 3D card:', error);
    throw new Error('Failed to create 3D card model');
  }
}

/**
 * Create rounded box geometry
 * @param {number} width - Box width
 * @param {number} height - Box height
 * @param {number} depth - Box depth
 * @param {number} radius - Corner radius
 * @returns {THREE.BoxGeometry} Rounded box geometry
 */
function createRoundedBoxGeometry(width, height, depth, radius) {
  // For now, using standard box geometry
  // In production, you'd want to use RoundedBoxGeometry or custom geometry
  const geometry = new THREE.BoxGeometry(width, height, depth);
  
  // Add UV mapping for proper texture display
  const uvs = geometry.attributes.uv;
  
  // Adjust UVs for front and back faces to display textures correctly
  // Front face (face index 4)
  for (let i = 16; i < 20; i++) {
    uvs.setXY(i, uvs.getX(i), 1 - uvs.getY(i));
  }
  
  // Back face (face index 5)
  for (let i = 20; i < 24; i++) {
    uvs.setXY(i, 1 - uvs.getX(i), 1 - uvs.getY(i));
  }
  
  return geometry;
}

/**
 * Load texture from data URL
 * @param {THREE.TextureLoader} loader - Texture loader instance
 * @param {string} textureData - Base64 or data URL
 * @returns {Promise<THREE.Texture>} Loaded texture
 */
async function loadTexture(loader, textureData) {
  return new Promise((resolve, reject) => {
    loader.load(
      textureData,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
        reject(new Error('Failed to load texture'));
      }
    );
  });
}

/**
 * Setup scene lighting
 * @param {THREE.Scene} scene - Three.js scene
 */
function setupLighting(scene) {
  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  // Main directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  
  // Configure shadow properties
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  
  scene.add(directionalLight);
  
  // Fill light from opposite side
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);
}

/**
 * Export scene to GLB format
 * @param {THREE.Scene} scene - Three.js scene to export
 * @param {Object} options - Export options
 * @returns {Promise<ArrayBuffer>} GLB file data
 */
export async function exportToGLB(scene, options = {}) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    
    const exportOptions = {
      binary: true,        // Export as GLB
      embedImages: true,   // Embed textures in GLB
      maxTextureSize: options.maxTextureSize || 2048,
      onlyVisible: true,
      includeCustomExtensions: false,
      ...options
    };
    
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          // If not binary, convert to ArrayBuffer
          const encoder = new TextEncoder();
          const jsonString = JSON.stringify(result);
          resolve(encoder.encode(jsonString).buffer);
        }
      },
      (error) => {
        console.error('Export error:', error);
        reject(new Error('Failed to export GLB: ' + error.message));
      },
      exportOptions
    );
  });
}

/**
 * Create a preview image of the 3D card
 * @param {THREE.Scene} scene - Three.js scene
 * @param {number} width - Preview width
 * @param {number} height - Preview height
 * @returns {Promise<string>} Data URL of preview image
 */
export async function createPreview(scene, width = 512, height = 320) {
  try {
    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create camera for preview
    const camera = new THREE.PerspectiveCamera(
      35,
      width / height,
      0.1,
      100
    );
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 0, 0);
    
    // Render scene
    renderer.render(scene, camera);
    
    // Get data URL
    const dataURL = renderer.domElement.toDataURL('image/png');
    
    // Clean up
    renderer.dispose();
    
    return dataURL;
  } catch (error) {
    console.error('Error creating preview:', error);
    throw new Error('Failed to create preview');
  }
}