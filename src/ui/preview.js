/**
 * Serve the card preview page with Google model-viewer
 * @param {string} sessionId - Optional session ID for loading a specific card
 * @returns {Response} HTML response
 */
export function servePreview(sessionId = null) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Card Preview - OOCard</title>
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #8ECAE6 0%, #219EBC 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
            padding: 0 20px;
        }
        
        .header h1 {
            font-size: 36px;
            margin-bottom: 16px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 18px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .preview-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(2, 48, 71, 0.2);
            animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .viewer-section {
            padding: 0;
            background: #f8f9fa;
        }
        
        .model-viewer-container {
            width: 100%;
            height: 70vh;
            min-height: 500px;
            position: relative;
            background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        
        model-viewer {
            width: 100%;
            height: 100%;
            background-color: transparent;
            --poster-color: transparent;
            --progress-bar-color: #FFB703;
            --progress-mask: rgba(255, 255, 255, 0.2);
        }
        
        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }
        
        .loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #FFB703;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .controls-panel {
            padding: 30px;
            background: white;
            border-top: 1px solid #e9ecef;
        }
        
        .controls-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .control-group {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
        }
        
        .control-group h3 {
            color: #495057;
            margin-bottom: 15px;
            font-size: 16px;
            font-weight: 600;
        }
        
        .control-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .control-btn {
            background: #219EBC;
            color: white;
            border: none;
            padding: 12px 18px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s;
            flex: 1;
            min-width: 120px;
        }
        
        .control-btn:hover {
            background: #023047;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(33, 158, 188, 0.4);
        }
        
        .control-btn.secondary {
            background: #6c757d;
        }
        
        .control-btn.secondary:hover {
            background: #5a6268;
        }
        
        .control-btn.active {
            background: #28a745;
        }
        
        .slider-group {
            margin-bottom: 15px;
        }
        
        .slider-label {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 5px;
            font-size: 14px;
            color: #495057;
        }
        
        .slider-value {
            font-weight: 600;
            color: #219EBC;
        }
        
        .slider {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #dee2e6;
            outline: none;
            -webkit-appearance: none;
        }
        
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #219EBC;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            background: #023047;
        }
        
        .slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #219EBC;
            cursor: pointer;
            border: none;
        }
        
        .card-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            background: #e9ecef;
            padding: 20px;
            border-radius: 12px;
        }
        
        .info-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
        }
        
        .info-label {
            font-size: 12px;
            color: #6c757d;
            text-transform: uppercase;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        .info-value {
            font-size: 18px;
            font-weight: 600;
            color: #495057;
        }
        
        .action-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .action-btn {
            background: linear-gradient(135deg, #FFB703 0%, #FB8500 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(251, 133, 0, 0.2);
        }
        
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(251, 133, 0, 0.3);
        }
        
        .action-btn.secondary {
            background: rgba(2, 48, 71, 0.1);
            color: #023047;
            box-shadow: 0 4px 12px rgba(2, 48, 71, 0.1);
        }
        
        .action-btn.secondary:hover {
            background: rgba(2, 48, 71, 0.15);
            box-shadow: 0 8px 24px rgba(2, 48, 71, 0.15);
        }
        
        .upload-section {
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #e9ecef;
        }
        
        .upload-area {
            border: 2px dashed #dee2e6;
            border-radius: 12px;
            padding: 40px 20px;
            margin: 20px 0;
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .upload-area:hover {
            border-color: #219EBC;
            background: rgba(142, 202, 230, 0.08);
        }
        
        .upload-area.dragover {
            border-color: #219EBC;
            background: rgba(142, 202, 230, 0.12);
            transform: scale(1.02);
        }
        
        .upload-icon {
            font-size: 48px;
            color: #adb5bd;
            margin-bottom: 15px;
        }
        
        .upload-text {
            color: #495057;
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .upload-subtext {
            color: #6c757d;
            font-size: 14px;
        }
        
        .hidden {
            display: none !important;
        }
        
        @media (max-width: 768px) {
            .tab-container {
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .tab-link {
                padding: 10px 18px;
                font-size: 14px;
            }
            .controls-grid {
                grid-template-columns: 1fr;
            }
            
            .control-buttons {
                flex-direction: column;
            }
            
            .control-btn {
                min-width: auto;
            }
            
            .action-buttons {
                flex-direction: column;
            }
            
            .model-viewer-container {
                height: 50vh;
                min-height: 300px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎴 3D Card Preview</h1>
        <p>Interactive 3D viewer powered by Google Model-Viewer</p>
    </div>
    
    <div class="preview-container">
        <!-- Material-UI Style Navigation Tabs -->
        <div class="mui-tabs" style="background: white; border-bottom: 1px solid #e0e0e0;">
            <div class="mui-tab-list" style="display: flex; padding: 0 30px;">
                <a href="/" class="mui-tab" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(2,48,71,0.6); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.3s; min-width: 90px; text-decoration: none; display: inline-block;">Upload</a>
                <button class="mui-tab mui-tab-active" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #219EBC; border-bottom: 2px solid #219EBC; cursor: pointer; transition: all 0.3s; min-width: 90px;">Preview</button>
                <a href="/test" class="mui-tab" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(2,48,71,0.6); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.3s; min-width: 90px; text-decoration: none; display: inline-block;">Test</a>
                <a href="/drive" class="mui-tab" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(2,48,71,0.6); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.3s; min-width: 90px; text-decoration: none; display: inline-block;">Drive</a>
            </div>
        </div>
        
        <style>
            .mui-tab:hover {
                background-color: rgba(33, 158, 188, 0.06) !important;
                color: #219EBC !important;
            }
            .mui-tab-active {
                color: #219EBC !important;
                border-bottom-color: #219EBC !important;
            }
        </style>
        <div class="upload-section" id="uploadSection">
            <h2>Load Your 3D Card</h2>
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">📤</div>
                <div class="upload-text">Drop your GLB file here or click to browse</div>
                <div class="upload-subtext">Supports GLB files up to 10MB</div>
                <input type="file" id="fileInput" accept=".glb" style="display: none;">
            </div>
            <p style="margin-top: 20px; color: #6c757d;">
                Don't have a 3D card? <a href="/" style="color: #667eea;">Create one here</a>
            </p>
        </div>
        
        <div class="viewer-section hidden" id="viewerSection">
            <div class="model-viewer-container">
                <div class="loading-overlay" id="loadingOverlay">
                    <div class="loading-spinner"></div>
                </div>
                <model-viewer 
                    id="cardViewer"
                    camera-controls 
                    touch-action="pan-y"
                    disable-zoom
                    auto-rotate
                    auto-rotate-delay="1000"
                    rotation-per-second="30deg"
                    shadow-intensity="1"
                    shadow-softness="0.3"
                    exposure="1"
                    tone-mapping="neutral"
                    environment-image="neutral"
                    skybox-image="neutral">
                    <div slot="poster">
                        <div class="loading-spinner"></div>
                    </div>
                </model-viewer>
            </div>
        </div>
        
        <div class="controls-panel hidden" id="controlsPanel">
            <div class="controls-grid">
                <div class="control-group">
                    <h3>🎥 Camera Controls</h3>
                    <div class="control-buttons">
                        <button class="control-btn" onclick="resetCamera()">Reset View</button>
                        <button class="control-btn" onclick="frontView()">Front View</button>
                        <button class="control-btn" onclick="backView()">Back View</button>
                        <button class="control-btn" onclick="sideView()">Side View</button>
                    </div>
                    <div class="slider-group">
                        <div class="slider-label">
                            <span>Field of View</span>
                            <span class="slider-value" id="fovValue">45°</span>
                        </div>
                        <input type="range" class="slider" id="fovSlider" min="10" max="90" value="45">
                    </div>
                </div>
                
                <div class="control-group">
                    <h3>🔄 Animation</h3>
                    <div class="control-buttons">
                        <button class="control-btn active" id="autoRotateBtn" onclick="toggleAutoRotate()">Auto Rotate: ON</button>
                        <button class="control-btn" onclick="slowRotation()">Slow</button>
                        <button class="control-btn" onclick="normalRotation()">Normal</button>
                        <button class="control-btn" onclick="fastRotation()">Fast</button>
                    </div>
                </div>
                
                <div class="control-group">
                    <h3>💡 Lighting</h3>
                    <div class="slider-group">
                        <div class="slider-label">
                            <span>Exposure</span>
                            <span class="slider-value" id="exposureValue">1.0</span>
                        </div>
                        <input type="range" class="slider" id="exposureSlider" min="0.1" max="3.0" value="1.0" step="0.1">
                    </div>
                    <div class="slider-group">
                        <div class="slider-label">
                            <span>Shadow Intensity</span>
                            <span class="slider-value" id="shadowValue">1.0</span>
                        </div>
                        <input type="range" class="slider" id="shadowSlider" min="0" max="2" value="1" step="0.1">
                    </div>
                </div>
                
                <div class="control-group">
                    <h3>🎨 Display Options</h3>
                    <div class="control-buttons">
                        <button class="control-btn" id="wireframeBtn" onclick="toggleWireframe()">Wireframe: OFF</button>
                        <button class="control-btn" onclick="toggleEnvironment()">Environment</button>
                        <button class="control-btn" onclick="resetAll()">Reset All</button>
                    </div>
                </div>
            </div>
            
            <div class="card-info">
                <div class="info-item">
                    <div class="info-label">File Size</div>
                    <div class="info-value" id="fileSize">-</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Format</div>
                    <div class="info-value">GLB 2.0</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Dimensions</div>
                    <div class="info-value">CR80 Standard</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Vertices</div>
                    <div class="info-value" id="vertexCount">-</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Triangles</div>
                    <div class="info-value" id="triangleCount">-</div>
                </div>
            </div>
            
            <div class="action-buttons">
                <a href="#" class="action-btn" id="downloadBtn">📥 Download GLB</a>
                <a href="/" class="action-btn secondary">🔄 Create New Card</a>
                <button class="action-btn secondary" onclick="loadNewFile()">📂 Load Another File</button>
            </div>
        </div>
    </div>

    <script>
        let currentModel = null;
        let modelViewer = null;
        
        document.addEventListener('DOMContentLoaded', function() {
            modelViewer = document.getElementById('cardViewer');
            setupEventListeners();
            setupSliders();
            
            // Check if there's a session ID in URL
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('session');
            if (sessionId) {
                loadModelFromSession(sessionId);
            }
        });
        
        function setupEventListeners() {
            const fileInput = document.getElementById('fileInput');
            const uploadArea = document.getElementById('uploadArea');
            
            // File input change
            fileInput.addEventListener('change', handleFileSelect);
            
            // Upload area click
            uploadArea.addEventListener('click', () => fileInput.click());
            
            // Drag and drop
            uploadArea.addEventListener('dragover', handleDragOver);
            uploadArea.addEventListener('dragleave', handleDragLeave);
            uploadArea.addEventListener('drop', handleDrop);
            
            // Model viewer events
            modelViewer.addEventListener('load', handleModelLoad);
            modelViewer.addEventListener('error', handleModelError);
        }
        
        function setupSliders() {
            // FOV slider
            const fovSlider = document.getElementById('fovSlider');
            const fovValue = document.getElementById('fovValue');
            fovSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                fovValue.textContent = value + '°';
                modelViewer.fieldOfView = value + 'deg';
            });
            
            // Exposure slider
            const exposureSlider = document.getElementById('exposureSlider');
            const exposureValue = document.getElementById('exposureValue');
            exposureSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                exposureValue.textContent = value.toFixed(1);
                modelViewer.exposure = value;
            });
            
            // Shadow slider
            const shadowSlider = document.getElementById('shadowSlider');
            const shadowValue = document.getElementById('shadowValue');
            shadowSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                shadowValue.textContent = value.toFixed(1);
                modelViewer.shadowIntensity = value;
            });
        }
        
        function handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) loadModel(file);
        }
        
        function handleDragOver(event) {
            event.preventDefault();
            event.currentTarget.classList.add('dragover');
        }
        
        function handleDragLeave(event) {
            event.currentTarget.classList.remove('dragover');
        }
        
        function handleDrop(event) {
            event.preventDefault();
            event.currentTarget.classList.remove('dragover');
            
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                loadModel(files[0]);
            }
        }
        
        function loadModel(file) {
            if (!file.name.toLowerCase().endsWith('.glb')) {
                alert('Please select a GLB file.');
                return;
            }
            
            const url = URL.createObjectURL(file);
            currentModel = { file, url };
            
            // Update file info
            document.getElementById('fileSize').textContent = formatFileSize(file.size);
            
            // Show loading
            showLoading();
            
            // Load model
            modelViewer.src = url;
        }
        
        async function loadModelFromSession(sessionId) {
            try {
                console.log('Loading model from session:', sessionId);
                showLoading();
                
                const downloadUrl = '/api/download?sessionId=' + encodeURIComponent(sessionId);
                console.log('Fetching from:', downloadUrl);
                
                const response = await fetch(downloadUrl);
                console.log('Response status:', response.status, response.statusText);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Download failed:', errorText);
                    throw new Error('Failed to load model: ' + response.status + ' ' + response.statusText);
                }
                
                const blob = await response.blob();
                console.log('Blob received, size:', blob.size, 'type:', blob.type);
                
                if (blob.size === 0) {
                    throw new Error('Received empty file from server');
                }
                
                const file = new File([blob], 'card.glb', { type: 'model/gltf-binary' });
                loadModel(file);
                
            } catch (error) {
                console.error('Error loading model:', error);
                alert('Failed to load model: ' + error.message);
                hideLoading();
            }
        }
        
        function handleModelLoad() {
            hideLoading();
            showViewer();
            
            // Update model info
            setTimeout(() => {
                try {
                    const model = modelViewer.model;
                    if (model) {
                        // These are approximate values as model-viewer doesn't expose detailed stats
                        document.getElementById('vertexCount').textContent = '~380';
                        document.getElementById('triangleCount').textContent = '~288';
                    }
                } catch (e) {
                    console.log('Could not get model stats:', e);
                }
            }, 1000);
        }
        
        function handleModelError(event) {
            hideLoading();
            alert('Failed to load 3D model. Please check the file format.');
            console.error('Model loading error:', event);
        }
        
        function showLoading() {
            document.getElementById('loadingOverlay').style.display = 'flex';
        }
        
        function hideLoading() {
            document.getElementById('loadingOverlay').style.display = 'none';
        }
        
        function showViewer() {
            document.getElementById('uploadSection').classList.add('hidden');
            document.getElementById('viewerSection').classList.remove('hidden');
            document.getElementById('controlsPanel').classList.remove('hidden');
            
            if (currentModel) {
                document.getElementById('downloadBtn').href = currentModel.url;
                document.getElementById('downloadBtn').download = 'card.glb';
            }
        }
        
        function loadNewFile() {
            document.getElementById('uploadSection').classList.remove('hidden');
            document.getElementById('viewerSection').classList.add('hidden');
            document.getElementById('controlsPanel').classList.add('hidden');
            
            if (currentModel && currentModel.url) {
                URL.revokeObjectURL(currentModel.url);
                currentModel = null;
            }
            
            document.getElementById('fileInput').value = '';
        }
        
        // Camera control functions
        function resetCamera() {
            modelViewer.cameraTarget = '0 0 0';
            modelViewer.cameraOrbit = '0deg 75deg 8m';
            modelViewer.fieldOfView = '45deg';
            document.getElementById('fovSlider').value = 45;
            document.getElementById('fovValue').textContent = '45°';
        }
        
        function frontView() {
            modelViewer.cameraOrbit = '0deg 90deg 8m';
        }
        
        function backView() {
            modelViewer.cameraOrbit = '180deg 90deg 8m';
        }
        
        function sideView() {
            modelViewer.cameraOrbit = '90deg 90deg 8m';
        }
        
        // Animation controls
        function toggleAutoRotate() {
            const btn = document.getElementById('autoRotateBtn');
            const isActive = btn.classList.contains('active');
            
            if (isActive) {
                modelViewer.autoRotate = false;
                btn.textContent = 'Auto Rotate: OFF';
                btn.classList.remove('active');
            } else {
                modelViewer.autoRotate = true;
                btn.textContent = 'Auto Rotate: ON';
                btn.classList.add('active');
            }
        }
        
        function slowRotation() {
            modelViewer.rotationPerSecond = '15deg';
        }
        
        function normalRotation() {
            modelViewer.rotationPerSecond = '30deg';
        }
        
        function fastRotation() {
            modelViewer.rotationPerSecond = '60deg';
        }
        
        // Display options
        function toggleWireframe() {
            // Note: wireframe mode isn't directly supported by model-viewer
            // This is a placeholder for the button
            const btn = document.getElementById('wireframeBtn');
            alert('Wireframe mode is not available in this viewer version.');
        }
        
        function toggleEnvironment() {
            const current = modelViewer.environmentImage;
            if (current === 'neutral') {
                modelViewer.environmentImage = 'legacy';
                modelViewer.skyboxImage = 'legacy';
            } else {
                modelViewer.environmentImage = 'neutral';
                modelViewer.skyboxImage = 'neutral';
            }
        }
        
        function resetAll() {
            // Reset camera
            resetCamera();
            
            // Reset lighting
            modelViewer.exposure = 1.0;
            modelViewer.shadowIntensity = 1.0;
            document.getElementById('exposureSlider').value = 1.0;
            document.getElementById('shadowSlider').value = 1.0;
            document.getElementById('exposureValue').textContent = '1.0';
            document.getElementById('shadowValue').textContent = '1.0';
            
            // Reset animation
            modelViewer.autoRotate = true;
            modelViewer.rotationPerSecond = '30deg';
            const btn = document.getElementById('autoRotateBtn');
            btn.textContent = 'Auto Rotate: ON';
            btn.classList.add('active');
            
            // Reset environment
            modelViewer.environmentImage = 'neutral';
            modelViewer.skyboxImage = 'neutral';
        }
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}