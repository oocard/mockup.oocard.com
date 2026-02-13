import { HOLO_TEXTURE_B64 } from '../assets/holoTexture.js';

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
    <title>Preview - 3D Card Generator</title>
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                    },
                    colors: {
                        ocean: {
                            950: '#03045e',
                            800: '#0077b6',
                            600: '#00b4d8',
                            300: '#90e0ef',
                            100: '#caf0f8',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        model-viewer {
            width: 100%;
            height: 100%;
            background-color: transparent;
            --poster-color: transparent;
            --progress-bar-color: #0077b6;
        }

        /* no additional CSS needed - holographic effect uses model-viewer Materials API */
    </style>
</head>
<body class="min-h-dvh bg-ocean-100 font-sans text-ocean-950 antialiased">
    <!-- Header -->
    <header class="border-b border-ocean-300 bg-white">
        <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div class="flex items-center gap-3">
                <svg class="size-8 text-ocean-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 10h18" />
                </svg>
                <span class="text-lg font-semibold text-ocean-950">OOCard</span>
            </div>
            <nav class="flex items-center gap-6">
                <a href="/" class="text-sm text-ocean-950/60 hover:text-ocean-800">Upload</a>
                <a href="/preview" class="text-sm font-medium text-ocean-800">Preview</a>
                <a href="/test" class="text-sm text-ocean-950/60 hover:text-ocean-800">Test</a>
                <a href="/drive" class="text-sm text-ocean-950/60 hover:text-ocean-800">Drive</a>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div class="mb-8">
            <h1 class="text-2xl font-semibold tracking-tight text-ocean-950 sm:text-3xl">3D Card Preview</h1>
            <p class="mt-2 text-ocean-950/70">Interactive 3D viewer powered by Google Model-Viewer</p>
        </div>

        <!-- Upload Section -->
        <div id="uploadSection" class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-sm font-medium text-ocean-950">Load Your 3D Card</h2>
            <div 
                id="uploadArea"
                class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-ocean-300 bg-ocean-100/50 p-12 hover:border-ocean-600 hover:bg-ocean-100"
            >
                <svg class="mb-4 size-12 text-ocean-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <p class="mb-1 text-sm font-medium text-ocean-950">Drop your GLB file here or click to browse</p>
                <p class="text-xs text-ocean-950/60">Supports GLB files up to 10MB</p>
                <input type="file" id="fileInput" accept=".glb" class="hidden">
            </div>
            <p class="mt-4 text-center text-sm text-ocean-950/60">
                Don't have a 3D card? <a href="/" class="font-medium text-ocean-800 hover:underline">Create one here</a>
            </p>
        </div>

        <!-- Gallery Section -->
        <div id="gallerySection" class="mt-8 rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
                <h2 class="text-sm font-medium text-ocean-950">Previously Generated Cards</h2>
                <button onclick="refreshGallery()" class="inline-flex items-center gap-1.5 rounded-md border border-ocean-300 bg-white px-2.5 py-1.5 text-xs font-medium text-ocean-950 hover:bg-ocean-100">
                    <svg id="galleryRefreshIcon" class="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd" />
                    </svg>
                    Refresh
                </button>
            </div>
            <div id="galleryGrid" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                <div class="col-span-full py-8 text-center text-sm text-ocean-950/60">
                    <svg class="mx-auto mb-2 size-6 animate-spin text-ocean-600" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading gallery...
                </div>
            </div>
            <p id="galleryCount" class="mt-4 text-xs text-ocean-950/60"></p>
        </div>

        <!-- GLB Modal -->
        <div id="glbModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/70 p-4">
            <div class="relative w-full max-w-4xl rounded-lg bg-white shadow-2xl">
                <div class="flex items-center justify-between border-b border-ocean-200 px-4 py-3">
                    <h3 id="modalTitle" class="text-sm font-medium text-ocean-950">3D Card Preview</h3>
                    <button onclick="closeModal()" class="rounded-md p-1 text-ocean-950/60 hover:bg-ocean-100 hover:text-ocean-950">
                        <svg class="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>
                <div class="relative h-[60vh] bg-gradient-to-br from-ocean-100 to-ocean-300/50">
                    <div id="modalLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
                        <div class="size-8 animate-spin rounded-full border-4 border-ocean-300 border-t-ocean-800"></div>
                    </div>
                    <model-viewer
                        id="modalViewer"
                        camera-controls
                        touch-action="pan-y"
                        auto-rotate
                        shadow-intensity="1"
                        exposure="1"
                        style="width: 100%; height: 100%;">
                    </model-viewer>
                </div>
                <div class="flex items-center justify-between border-t border-ocean-200 px-4 py-3">
                    <p id="modalInfo" class="text-xs text-ocean-950/60"></p>
                    <div class="flex gap-2">
                        <a id="modalDownloadBtn" href="#" class="rounded-md bg-ocean-100 px-3 py-1.5 text-xs font-medium text-ocean-950 hover:bg-ocean-200">Download GLB</a>
                        <button onclick="closeModal()" class="rounded-md bg-ocean-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-ocean-950">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Viewer Section -->
        <div id="viewerSection" class="hidden space-y-6">
            <!-- 3D Viewer -->
            <div class="overflow-hidden rounded-lg border border-ocean-300 bg-white shadow-sm">
                <div class="relative h-[500px] bg-gradient-to-br from-ocean-100 to-ocean-300/50">
                    <div id="loadingOverlay" class="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
                        <div class="size-8 animate-spin rounded-full border-4 border-ocean-300 border-t-ocean-800"></div>
                    </div>
                    <model-viewer
                        id="cardViewer"
                        camera-controls
                        touch-action="pan-y"
                        auto-rotate
                        auto-rotate-delay="1000"
                        rotation-per-second="30deg"
                        shadow-intensity="1"
                        shadow-softness="0.3"
                        exposure="1"
                        tone-mapping="neutral"
                        environment-image="neutral">
                    </model-viewer>
                </div>
            </div>

            <!-- Controls -->
            <div class="grid gap-6 lg:grid-cols-2">
                <!-- Camera Controls -->
                <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                    <h3 class="mb-4 text-sm font-medium text-ocean-950">Camera Controls</h3>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="resetCamera()" class="rounded-md border border-ocean-300 bg-white px-3 py-1.5 text-sm font-medium text-ocean-950 hover:bg-ocean-100">Reset View</button>
                        <button onclick="frontView()" class="rounded-md border border-ocean-300 bg-white px-3 py-1.5 text-sm font-medium text-ocean-950 hover:bg-ocean-100">Front</button>
                        <button onclick="backView()" class="rounded-md border border-ocean-300 bg-white px-3 py-1.5 text-sm font-medium text-ocean-950 hover:bg-ocean-100">Back</button>
                        <button onclick="sideView()" class="rounded-md border border-ocean-300 bg-white px-3 py-1.5 text-sm font-medium text-ocean-950 hover:bg-ocean-100">Side</button>
                    </div>
                    <div class="mt-4">
                        <label class="mb-2 flex items-center justify-between text-sm">
                            <span class="text-ocean-950/70">Field of View</span>
                            <span id="fovValue" class="tabular-nums font-medium text-ocean-950">45°</span>
                        </label>
                        <input type="range" id="fovSlider" min="10" max="90" value="45" class="w-full accent-ocean-800">
                    </div>
                </div>

                <!-- Animation Controls -->
                <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                    <h3 class="mb-4 text-sm font-medium text-ocean-950">Animation</h3>
                    <div class="flex flex-wrap gap-2">
                        <button id="autoRotateBtn" onclick="toggleAutoRotate()" class="rounded-md bg-ocean-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-ocean-950">Auto Rotate: ON</button>
                        <button onclick="slowRotation()" class="rounded-md border border-ocean-300 bg-white px-3 py-1.5 text-sm font-medium text-ocean-950 hover:bg-ocean-100">Slow</button>
                        <button onclick="normalRotation()" class="rounded-md border border-ocean-300 bg-white px-3 py-1.5 text-sm font-medium text-ocean-950 hover:bg-ocean-100">Normal</button>
                        <button onclick="fastRotation()" class="rounded-md border border-ocean-300 bg-white px-3 py-1.5 text-sm font-medium text-ocean-950 hover:bg-ocean-100">Fast</button>
                    </div>
                </div>

                <!-- Lighting Controls -->
                <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                    <h3 class="mb-4 text-sm font-medium text-ocean-950">Lighting</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="mb-2 flex items-center justify-between text-sm">
                                <span class="text-ocean-950/70">Exposure</span>
                                <span id="exposureValue" class="tabular-nums font-medium text-ocean-950">1.0</span>
                            </label>
                            <input type="range" id="exposureSlider" min="0.1" max="3.0" value="1.0" step="0.1" class="w-full accent-ocean-800">
                        </div>
                        <div>
                            <label class="mb-2 flex items-center justify-between text-sm">
                                <span class="text-ocean-950/70">Shadow</span>
                                <span id="shadowValue" class="tabular-nums font-medium text-ocean-950">1.0</span>
                            </label>
                            <input type="range" id="shadowSlider" min="0" max="2" value="1" step="0.1" class="w-full accent-ocean-800">
                        </div>
                    </div>
                </div>

                <!-- Holographic Overlay -->
                <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                    <h3 class="mb-4 text-sm font-medium text-ocean-950">Holographic Overlay</h3>
                    <div class="space-y-3">
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name="holoMode" value="off" checked class="accent-ocean-800" onchange="setHoloMode('off')">
                            <div>
                                <span class="text-sm font-medium text-ocean-950">Off</span>
                                <p class="text-xs text-ocean-950/60">No holographic effect</p>
                            </div>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name="holoMode" value="fargo" class="accent-ocean-800" onchange="setHoloMode('fargo')">
                            <div>
                                <span class="text-sm font-medium text-ocean-950">Fargo HoloSentria</span>
                                <p class="text-xs text-ocean-950/60">Security hologram with globe pattern</p>
                            </div>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name="holoMode" value="rainbow" class="accent-ocean-800" onchange="setHoloMode('rainbow')">
                            <div>
                                <span class="text-sm font-medium text-ocean-950">Rainbow Foil</span>
                                <p class="text-xs text-ocean-950/60">Iridescent rainbow shimmer</p>
                            </div>
                        </label>
                    </div>
                    <div id="holoIntensityGroup" class="mt-4 hidden">
                        <label class="mb-2 flex items-center justify-between text-sm">
                            <span class="text-ocean-950/70">Intensity</span>
                            <span id="holoIntensityValue" class="tabular-nums font-medium text-ocean-950">50%</span>
                        </label>
                        <input type="range" id="holoIntensitySlider" min="5" max="100" value="50" class="w-full accent-ocean-800">
                    </div>
                </div>

                <!-- File Info -->
                <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                    <h3 class="mb-4 text-sm font-medium text-ocean-950">File Information</h3>
                    <dl class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <dt class="text-ocean-950/60">File Size</dt>
                            <dd id="fileSize" class="tabular-nums font-medium text-ocean-950">-</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-ocean-950/60">Format</dt>
                            <dd class="font-medium text-ocean-950">GLB 2.0</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-ocean-950/60">Dimensions</dt>
                            <dd class="font-medium text-ocean-950">CR80 Standard</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap items-center justify-center gap-3">
                <a href="#" id="downloadBtn" class="inline-flex items-center gap-2 rounded-md bg-ocean-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-ocean-950">
                    <svg class="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    Download GLB
                </a>
                <a href="/" class="inline-flex items-center gap-2 rounded-md border border-ocean-300 bg-white px-4 py-2.5 text-sm font-medium text-ocean-950 hover:bg-ocean-100">
                    Create New Card
                </a>
                <button onclick="loadNewFile()" class="inline-flex items-center gap-2 rounded-md border border-ocean-300 bg-white px-4 py-2.5 text-sm font-medium text-ocean-950 hover:bg-ocean-100">
                    Load Another File
                </button>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="mt-auto border-t border-ocean-300 bg-white">
        <div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <p class="text-center text-sm text-ocean-950/60">© 2026 OOCard. All rights reserved.</p>
        </div>
    </footer>

    <script>
        let currentModel = null;
        let modelViewer = null;
        
        document.addEventListener('DOMContentLoaded', function() {
            modelViewer = document.getElementById('cardViewer');
            setupEventListeners();
            setupSliders();
            
            // Load gallery
            loadGallery();
            
            // Setup modal viewer
            const modalViewer = document.getElementById('modalViewer');
            modalViewer.addEventListener('load', () => {
                document.getElementById('modalLoading').classList.add('hidden');
            });
            
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
            
            fileInput.addEventListener('change', handleFileSelect);
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', handleDragOver);
            uploadArea.addEventListener('dragleave', handleDragLeave);
            uploadArea.addEventListener('drop', handleDrop);
            
            modelViewer.addEventListener('load', handleModelLoad);
            modelViewer.addEventListener('error', handleModelError);
        }
        
        function setupSliders() {
            const fovSlider = document.getElementById('fovSlider');
            const fovValue = document.getElementById('fovValue');
            fovSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                fovValue.textContent = value + '°';
                modelViewer.fieldOfView = value + 'deg';
            });
            
            const exposureSlider = document.getElementById('exposureSlider');
            const exposureValue = document.getElementById('exposureValue');
            exposureSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                exposureValue.textContent = value.toFixed(1);
                modelViewer.exposure = value;
            });
            
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
            event.currentTarget.classList.add('border-ocean-800', 'bg-ocean-100');
        }
        
        function handleDragLeave(event) {
            event.currentTarget.classList.remove('border-ocean-800', 'bg-ocean-100');
        }
        
        function handleDrop(event) {
            event.preventDefault();
            event.currentTarget.classList.remove('border-ocean-800', 'bg-ocean-100');
            
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
            
            document.getElementById('fileSize').textContent = formatFileSize(file.size);
            showLoading();
            modelViewer.src = url;
        }
        
        async function loadModelFromSession(sessionId) {
            try {
                console.log('Loading model for session:', sessionId);
                showLoading();
                
                const downloadUrl = '/api/download?sessionId=' + encodeURIComponent(sessionId);
                console.log('Fetching from:', downloadUrl);
                
                const response = await fetch(downloadUrl);
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    // Try to get error message from response
                    let errorMsg = 'Failed to load model: ' + response.status;
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.error || errorMsg;
                    } catch (e) {}
                    throw new Error(errorMsg);
                }
                
                const contentType = response.headers.get('Content-Type');
                console.log('Content-Type:', contentType);
                
                const blob = await response.blob();
                console.log('Blob size:', blob.size);
                
                if (blob.size === 0) {
                    throw new Error('Received empty file from server');
                }
                
                const file = new File([blob], 'card.glb', { type: 'model/gltf-binary' });
                loadModel(file);
                
            } catch (error) {
                console.error('Error loading model:', error);
                hideLoading();
                // Show error in UI instead of alert
                document.getElementById('uploadSection').innerHTML = \`
                    <div class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                        <svg class="mx-auto mb-4 size-12 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" />
                        </svg>
                        <h3 class="mb-2 text-sm font-medium text-red-800">Failed to Load Model</h3>
                        <p class="text-sm text-red-600">\${error.message}</p>
                        <p class="mt-4 text-xs text-red-500">Session ID: \${sessionId}</p>
                        <a href="/drive" class="mt-4 inline-block rounded bg-ocean-800 px-4 py-2 text-sm font-medium text-white hover:bg-ocean-950">Back to Drive</a>
                    </div>
                \`;
            }
        }
        
        function handleModelLoad() {
            hideLoading();
            showViewer();
        }
        
        function handleModelError(event) {
            hideLoading();
            alert('Failed to load 3D model. Please check the file format.');
            console.error('Model loading error:', event);
        }
        
        function showLoading() {
            document.getElementById('loadingOverlay').classList.remove('hidden');
        }
        
        function hideLoading() {
            document.getElementById('loadingOverlay').classList.add('hidden');
        }
        
        function showViewer() {
            document.getElementById('uploadSection').classList.add('hidden');
            document.getElementById('viewerSection').classList.remove('hidden');
            
            if (currentModel) {
                document.getElementById('downloadBtn').href = currentModel.url;
                document.getElementById('downloadBtn').download = 'card.glb';
            }
        }
        
        function loadNewFile() {
            document.getElementById('uploadSection').classList.remove('hidden');
            document.getElementById('viewerSection').classList.add('hidden');
            
            if (currentModel && currentModel.url) {
                URL.revokeObjectURL(currentModel.url);
                currentModel = null;
            }
            
            document.getElementById('fileInput').value = '';
        }
        
        // Camera controls
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
            const isActive = modelViewer.autoRotate;
            
            if (isActive) {
                modelViewer.autoRotate = false;
                btn.textContent = 'Auto Rotate: OFF';
                btn.classList.remove('bg-ocean-800', 'text-white');
                btn.classList.add('bg-white', 'text-ocean-950', 'border', 'border-ocean-300');
            } else {
                modelViewer.autoRotate = true;
                btn.textContent = 'Auto Rotate: ON';
                btn.classList.add('bg-ocean-800', 'text-white');
                btn.classList.remove('bg-white', 'text-ocean-950', 'border', 'border-ocean-300');
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
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }
        
        // Gallery functions
        let galleryData = [];
        
        async function loadGallery() {
            const grid = document.getElementById('galleryGrid');
            const countEl = document.getElementById('galleryCount');
            
            try {
                const response = await fetch('/api/list-glbs');
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load gallery');
                }
                
                galleryData = data.sessions || [];
                
                if (galleryData.length === 0) {
                    grid.innerHTML = '<div class="col-span-full py-8 text-center text-sm text-ocean-950/60">No cards generated yet. <a href="/" class="text-ocean-800 hover:underline">Create your first card</a></div>';
                    countEl.textContent = '';
                    return;
                }
                
                grid.innerHTML = galleryData.map((item, index) => \`
                    <div class="group cursor-pointer" onclick="openModal('\${item.sessionId}', '\${escapeHtml(item.name)}', \${item.glbSize})">
                        <div class="relative aspect-[3/4] overflow-hidden rounded-lg border border-ocean-200 bg-ocean-50 transition-all group-hover:border-ocean-600 group-hover:shadow-lg">
                            <img 
                                src="/api/thumbnail?sessionId=\${item.sessionId}" 
                                alt="\${escapeHtml(item.name)}"
                                class="h-full w-full object-cover"
                                loading="lazy"
                            >
                            <div class="absolute inset-0 flex items-center justify-center bg-ocean-950/0 transition-colors group-hover:bg-ocean-950/40">
                                <svg class="size-10 text-white opacity-0 transition-opacity group-hover:opacity-100" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                    <path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <p class="mt-2 truncate text-xs font-medium text-ocean-950">\${escapeHtml(item.name)}</p>
                        <p class="text-xs text-ocean-950/50">\${formatFileSize(item.glbSize)} · \${formatDate(item.timestamp)}</p>
                    </div>
                \`).join('');
                
                countEl.textContent = \`\${galleryData.length} card\${galleryData.length === 1 ? '' : 's'} in gallery\`;
                
            } catch (error) {
                console.error('Gallery load error:', error);
                grid.innerHTML = '<div class="col-span-full py-8 text-center text-sm text-red-600">Failed to load gallery: ' + error.message + '</div>';
            }
        }
        
        function refreshGallery() {
            const icon = document.getElementById('galleryRefreshIcon');
            icon.classList.add('animate-spin');
            
            loadGallery().finally(() => {
                icon.classList.remove('animate-spin');
            });
        }
        
        function formatDate(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) return 'Just now';
            if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
            if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
            if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
            
            return date.toLocaleDateString();
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text || '';
            return div.innerHTML;
        }
        
        // Modal functions
        function openModal(sessionId, name, size) {
            const modal = document.getElementById('glbModal');
            const modalViewer = document.getElementById('modalViewer');
            const modalLoading = document.getElementById('modalLoading');
            const modalTitle = document.getElementById('modalTitle');
            const modalInfo = document.getElementById('modalInfo');
            const modalDownloadBtn = document.getElementById('modalDownloadBtn');
            
            modalTitle.textContent = name || 'Card Preview';
            modalInfo.textContent = formatFileSize(size);
            modalDownloadBtn.href = '/api/download?sessionId=' + sessionId;
            modalDownloadBtn.download = (name || 'card') + '.glb';
            
            modalLoading.classList.remove('hidden');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // Load the GLB
            fetch('/api/download?sessionId=' + sessionId)
                .then(response => {
                    if (!response.ok) throw new Error('Failed to load model');
                    return response.blob();
                })
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    modalViewer.src = url;
                })
                .catch(error => {
                    console.error('Modal load error:', error);
                    modalLoading.innerHTML = '<p class="text-red-600">Failed to load model</p>';
                });
            
            // Close on escape
            document.addEventListener('keydown', handleEscapeKey);
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
        
        function closeModal() {
            const modal = document.getElementById('glbModal');
            const modalViewer = document.getElementById('modalViewer');
            
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            
            // Clear the viewer
            modalViewer.src = '';
            
            // Remove escape listener
            document.removeEventListener('keydown', handleEscapeKey);
            
            // Restore body scroll
            document.body.style.overflow = '';
        }
        
        function handleEscapeKey(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        }
        
        // Close modal when clicking outside
        document.getElementById('glbModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'glbModal') {
                closeModal();
            }
        });

        // ── Holographic Overlay System ──
        let holoMode = 'off';
        let holoIntensity = 0.5;
        let origMatState = null;

        function hslToRgb(h, s, l) {
            let r, g, b;
            if (s === 0) { r = g = b = l; }
            else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                const hue2rgb = (pp, qq, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return pp + (qq - pp) * 6 * t;
                    if (t < 1/2) return qq;
                    if (t < 2/3) return pp + (qq - pp) * (2/3 - t) * 6;
                    return pp;
                };
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            return [r, g, b];
        }

        function getViewers() {
            return [document.getElementById('cardViewer'), document.getElementById('modalViewer')].filter(Boolean);
        }

        function eachMat(viewer, fn) {
            if (!viewer || !viewer.model) return;
            const mats = viewer.model.materials;
            if (mats[0]) fn(mats[0]);
            if (mats[1]) fn(mats[1]);
        }

        function setHoloMode(mode) {
            holoMode = mode;
            const intensityGroup = document.getElementById('holoIntensityGroup');
            const viewers = getViewers();

            if (mode === 'off') {
                intensityGroup.classList.add('hidden');
                viewers.forEach(v => eachMat(v, mat => {
                    mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
                    if (origMatState) {
                        mat.pbrMetallicRoughness.setMetallicFactor(origMatState.metallic);
                        mat.pbrMetallicRoughness.setRoughnessFactor(origMatState.roughness);
                    }
                }));
                return;
            }

            intensityGroup.classList.remove('hidden');

            const mainViewer = viewers[0];
            if (!origMatState && mainViewer && mainViewer.model) {
                const m = mainViewer.model.materials[0];
                origMatState = {
                    metallic: m.pbrMetallicRoughness.metallicFactor,
                    roughness: m.pbrMetallicRoughness.roughnessFactor
                };
            }

            viewers.forEach(v => {
                eachMat(v, mat => {
                    mat.pbrMetallicRoughness.setMetallicFactor(0.5);
                    mat.pbrMetallicRoughness.setRoughnessFactor(0.25);
                });
                updateHoloColor(v);
            });
        }

        function updateHoloColor(viewer) {
            if (!viewer || !viewer.model || holoMode === 'off') return;

            const orbit = viewer.getCameraOrbit();
            const theta = orbit.theta * (180 / Math.PI);
            const phi = orbit.phi * (180 / Math.PI);

            const hue = (((theta * 2) % 360) + 360) % 360;
            const [hr, hg, hb] = hslToRgb(hue / 360, 1.0, 0.5);

            const i = holoIntensity;
            const tr = 1.0 - (1.0 - hr) * i * 0.7;
            const tg = 1.0 - (1.0 - hg) * i * 0.7;
            const tb = 1.0 - (1.0 - hb) * i * 0.7;

            eachMat(viewer, mat => {
                mat.pbrMetallicRoughness.setBaseColorFactor([tr, tg, tb, 1.0]);
            });
        }

        // Hook into camera changes
        document.getElementById('cardViewer')?.addEventListener('camera-change', (e) => {
            updateHoloColor(e.target);
        });
        document.getElementById('modalViewer')?.addEventListener('camera-change', (e) => {
            updateHoloColor(e.target);
        });

        // Re-apply holo when a model loads
        document.getElementById('cardViewer')?.addEventListener('load', () => {
            if (holoMode !== 'off') setHoloMode(holoMode);
        });
        document.getElementById('modalViewer')?.addEventListener('load', () => {
            if (holoMode !== 'off') setHoloMode(holoMode);
        });

        // Intensity slider
        document.getElementById('holoIntensitySlider')?.addEventListener('input', (e) => {
            holoIntensity = parseInt(e.target.value) / 100;
            document.getElementById('holoIntensityValue').textContent = e.target.value + '%';
            getViewers().forEach(v => updateHoloColor(v));
        });
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
