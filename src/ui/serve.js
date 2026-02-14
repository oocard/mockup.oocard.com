// Note: fs imports don't work in Cloudflare Workers
// HTML is embedded directly in the function
import { getHoloCardCSS, getHoloCardHTML, getHoloCardJS, getHoloOverlayCSS, getHoloOverlayHTML, getHoloOverlayHTMLClose, getHoloOverlayJS } from './holoCard.js';

/**
 * Serve the HTML UI
 * @returns {Response} HTML response
 */
export function serveUI() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Card Generator - OOCard</title>
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .text-balance { text-wrap: balance; }
        .text-pretty { text-wrap: pretty; }
        model-viewer { width: 100%; height: 100%; background-color: transparent; --poster-color: transparent; --progress-bar-color: #0077b6; }
        ${getHoloCardCSS()}
        ${getHoloOverlayCSS()}
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
                <a href="/" class="text-sm font-medium text-ocean-800">Upload</a>
                <a href="/preview" class="text-sm text-ocean-950/60 hover:text-ocean-800">Preview</a>
                <a href="/test" class="text-sm text-ocean-950/60 hover:text-ocean-800">Test</a>
                <a href="/drive" class="text-sm text-ocean-950/60 hover:text-ocean-800">Drive</a>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <!-- Page Header -->
        <div class="mb-8">
            <h1 class="text-balance text-2xl font-semibold tracking-tight text-ocean-950 sm:text-3xl">3D Card Generator</h1>
            <p class="text-pretty mt-2 text-ocean-950/70">Transform your card designs into 3D GLB models for WordPress</p>
        </div>

        <div class="grid gap-8 lg:grid-cols-3">
            <!-- Left Column: Upload Form -->
            <div class="lg:col-span-2">
                <form id="uploadForm" class="space-y-6">
                    <!-- Upload Area -->
                    <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                        <h2 class="mb-4 text-sm font-medium text-ocean-950">Card Images</h2>
                        
                        <div class="space-y-4">
                            <!-- Front Image -->
                            <div>
                                <label for="frontImage" class="mb-1.5 block text-sm font-medium text-ocean-950">
                                    Front Image <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <input 
                                        type="file" 
                                        id="frontImage" 
                                        name="frontImage" 
                                        class="peer sr-only" 
                                        accept=".png,image/png" 
                                        required
                                    >
                                    <label 
                                        for="frontImage" 
                                        id="frontButton"
                                        class="flex cursor-pointer items-center justify-between rounded-md border border-ocean-300 bg-white px-4 py-2.5 text-sm text-ocean-950/60 hover:border-ocean-600 hover:bg-ocean-100 peer-focus:border-ocean-800 peer-focus:ring-1 peer-focus:ring-ocean-800"
                                    >
                                        <span>Choose front image</span>
                                        <svg class="size-5 text-ocean-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                        </svg>
                                    </label>
                                </div>
                                <p class="mt-1 text-xs text-ocean-950/60">PNG format required</p>
                            </div>

                            <!-- Back Image -->
                            <div>
                                <label for="backImage" class="mb-1.5 block text-sm font-medium text-ocean-950">
                                    Back Image <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <input 
                                        type="file" 
                                        id="backImage" 
                                        name="backImage" 
                                        class="peer sr-only" 
                                        accept=".png,image/png" 
                                        required
                                    >
                                    <label 
                                        for="backImage" 
                                        id="backButton"
                                        class="flex cursor-pointer items-center justify-between rounded-md border border-ocean-300 bg-white px-4 py-2.5 text-sm text-ocean-950/60 hover:border-ocean-600 hover:bg-ocean-100 peer-focus:border-ocean-800 peer-focus:ring-1 peer-focus:ring-ocean-800"
                                    >
                                        <span>Choose back image</span>
                                        <svg class="size-5 text-ocean-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                        </svg>
                                    </label>
                                </div>
                                <p class="mt-1 text-xs text-ocean-950/60">PNG format required</p>
                            </div>

                        </div>
                    </div>

                    <!-- Copyright Text Option -->
                    <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                        <div class="flex items-start gap-3">
                            <input 
                                type="checkbox" 
                                id="copyrightEnabled" 
                                name="copyrightEnabled"
                                class="mt-1 size-4 rounded border-ocean-300 text-ocean-800 focus:ring-ocean-800"
                                onchange="toggleCopyrightText()"
                            >
                            <div class="flex-1">
                                <label for="copyrightEnabled" class="block text-sm font-medium text-ocean-950 cursor-pointer">
                                    Add Copyright Text
                                </label>
                                <p class="mt-0.5 text-xs text-ocean-950/60">Repeating text along the card edge for copyright protection</p>
                                
                                <div id="copyrightTextContainer" class="mt-3 hidden">
                                    <label for="copyrightText" class="mb-1.5 block text-sm font-medium text-ocean-950">
                                        Copyright Text
                                    </label>
                                    <input 
                                        type="text" 
                                        id="copyrightText" 
                                        name="copyrightText"
                                        value="© DESIGN COPYRIGHT 2026"
                                        maxlength="100"
                                        class="w-full rounded-md border border-ocean-300 px-3 py-2 text-sm text-ocean-950 placeholder:text-ocean-950/40 focus:border-ocean-800 focus:outline-none focus:ring-1 focus:ring-ocean-800"
                                        placeholder="Enter copyright text..."
                                    >
                                    <p class="mt-1 text-xs text-ocean-950/60">This text will repeat along all four edges of the card</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Status Message -->
                    <div id="statusMessage" class="hidden rounded-md p-4 text-sm" role="alert"></div>

                    <!-- Progress Bar -->
                    <div id="progressContainer" class="hidden rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                        <div class="mb-2 flex items-center justify-between text-sm">
                            <span class="font-medium text-ocean-950">Processing</span>
                            <span id="progressText" class="tabular-nums text-ocean-950/70">0%</span>
                        </div>
                        <div class="h-2 w-full overflow-hidden rounded-full bg-ocean-100">
                            <div id="progressFill" class="h-full rounded-full bg-ocean-800 transition-[width] duration-150" style="width: 0%"></div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-3">
                        <button
                            type="submit"
                            id="generateBtn"
                            class="inline-flex items-center justify-center rounded-md bg-ocean-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-ocean-950 focus:outline-none focus:ring-2 focus:ring-ocean-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Generate 3D Card
                        </button>
                        <button
                            type="button"
                            id="loadTestBtn"
                            class="inline-flex items-center justify-center rounded-md border border-ocean-600 bg-ocean-100 px-4 py-2.5 text-sm font-medium text-ocean-800 hover:bg-ocean-300 focus:outline-none focus:ring-2 focus:ring-ocean-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Load Test Images
                        </button>
                        <button
                            type="button"
                            id="resetBtn"
                            class="inline-flex items-center justify-center rounded-md border border-ocean-300 bg-white px-4 py-2.5 text-sm font-medium text-ocean-950 hover:bg-ocean-100 focus:outline-none focus:ring-2 focus:ring-ocean-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Reset
                        </button>
                    </div>

                    <!-- Holographic Card Preview (shows on image select) -->
                    <div id="holoPreviewSection" class="hidden space-y-3">
                        <h3 class="text-sm font-medium text-ocean-950">Holo v1</h3>
                        <div class="rounded-lg border border-ocean-300 bg-white shadow-sm overflow-hidden">
                            <div class="relative h-[400px] bg-gradient-to-br from-ocean-100 to-ocean-300/50">
                                ${getHoloCardHTML('upload')}
                            </div>
                        </div>
                    </div>

                    <!-- Download Section -->
                    <div id="downloadSection" class="hidden space-y-4">
                        <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                            <div class="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h3 class="font-medium text-ocean-950">Your 3D Card is Ready</h3>
                                    <div class="mt-2 flex flex-wrap gap-4 text-sm">
                                        <div>
                                            <span class="text-ocean-950/60">Format:</span>
                                            <span class="ml-1 font-medium text-ocean-950">GLB</span>
                                        </div>
                                        <div>
                                            <span class="text-ocean-950/60">Size:</span>
                                            <span id="fileSize" class="ml-1 tabular-nums font-medium text-ocean-950">-</span>
                                        </div>
                                        <div>
                                            <span class="text-ocean-950/60">Time:</span>
                                            <span id="processTime" class="ml-1 tabular-nums font-medium text-ocean-950">-</span>
                                        </div>
                                    </div>
                                    <p class="mt-2 text-xs text-ocean-950/60">Session: <code id="sessionIdDisplay" class="rounded bg-ocean-100 px-1.5 py-0.5">-</code></p>
                                </div>
                                <div class="flex gap-2">
                                    <button
                                        id="previewBtn"
                                        class="inline-flex items-center gap-2 rounded-md border border-ocean-300 bg-white px-4 py-2 text-sm font-medium text-ocean-950 hover:bg-ocean-100 focus:outline-none focus:ring-2 focus:ring-ocean-800 focus:ring-offset-2"
                                    >
                                        <svg class="size-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                                        </svg>
                                        Full Preview
                                    </button>
                                    <button
                                        id="downloadBtn"
                                        class="inline-flex items-center gap-2 rounded-md bg-ocean-800 px-4 py-2 text-sm font-medium text-white hover:bg-ocean-950 focus:outline-none focus:ring-2 focus:ring-ocean-800 focus:ring-offset-2"
                                    >
                                        <svg class="size-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                                        </svg>
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                        <!-- 3D Viewer with holographic CSS overlay -->
                        <h3 class="text-sm font-medium text-ocean-950">Model Viewer</h3>
                        <div class="rounded-lg border border-ocean-300 bg-white shadow-sm overflow-hidden">
                            <div class="relative h-[400px] bg-gradient-to-br from-ocean-100 to-ocean-300/50">
                                ${getHoloOverlayHTML('result')}
                                    <model-viewer
                                        id="resultViewer"
                                        camera-controls
                                        touch-action="pan-y"
                                        auto-rotate
                                        auto-rotate-delay="500"
                                        rotation-per-second="30deg"
                                        shadow-intensity="1"
                                        exposure="1"
                                        style="width: 100%; height: 100%;">
                                    </model-viewer>
                                ${getHoloOverlayHTMLClose()}
                            </div>
                        </div>

                        <!-- Holographic Overlay Controls -->
                        <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                            <h3 class="mb-4 text-sm font-medium text-ocean-950">Holographic Overlay</h3>
                            <div class="flex flex-wrap gap-4">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="resultHoloMode" value="off" checked class="accent-ocean-800" onchange="setResultHolo('off')">
                                    <span class="text-sm text-ocean-950">Off</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="resultHoloMode" value="hologram" class="accent-ocean-800" onchange="setResultHolo('hologram')">
                                    <span class="text-sm text-ocean-950">Hologram</span>
                                </label>
                            </div>
                            <div id="resultHoloIntensityGroup" class="mt-3 hidden">
                                <label class="flex items-center justify-between text-sm">
                                    <span class="text-ocean-950/70">Intensity</span>
                                    <span id="resultHoloIntensityValue" class="tabular-nums font-medium text-ocean-950">50%</span>
                                </label>
                                <input type="range" id="resultHoloIntensitySlider" min="5" max="100" value="50" class="mt-1 w-full accent-ocean-800">
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Right Column: Specifications -->
            <div class="lg:col-span-1">
                <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                    <h2 class="mb-4 text-sm font-medium text-ocean-950">Card Specifications</h2>
                    <dl class="space-y-3 text-sm">
                        <div>
                            <dt class="text-ocean-950/60">Standard</dt>
                            <dd class="mt-0.5 font-medium text-ocean-950">CR80 (ISO/IEC 7810)</dd>
                        </div>
                        <div>
                            <dt class="text-ocean-950/60">Dimensions</dt>
                            <dd class="mt-0.5 tabular-nums font-medium text-ocean-950">85.6 × 53.98 × 0.76 mm</dd>
                        </div>
                        <div>
                            <dt class="text-ocean-950/60">Corner Radius</dt>
                            <dd class="mt-0.5 tabular-nums font-medium text-ocean-950">3.18 mm</dd>
                        </div>
                        <div>
                            <dt class="text-ocean-950/60">Output Format</dt>
                            <dd class="mt-0.5 font-medium text-ocean-950">GLB (Binary glTF)</dd>
                        </div>
                    </dl>

                    <hr class="my-5 border-ocean-200" />

                    <h3 class="mb-3 text-sm font-medium text-ocean-950">File Requirements</h3>
                    <ul class="space-y-2 text-sm text-ocean-950/70">
                        <li class="flex items-start gap-2">
                            <svg class="mt-0.5 size-4 shrink-0 text-ocean-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                            <span>Front: Any PNG image</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <svg class="mt-0.5 size-4 shrink-0 text-ocean-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                            <span>Back: Any PNG image</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <svg class="mt-0.5 size-4 shrink-0 text-ocean-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                            <span>Max file size: 10 MB</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

    </main>

    <!-- Footer -->
    <footer class="mt-auto border-t border-ocean-300 bg-white">
        <div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <p class="text-center text-sm text-ocean-950/60">© 2026 OOCard. All rights reserved. · v1.12 · ${new Date().toISOString().slice(0, 19)}Z</p>
        </div>
    </footer>

    <script>
        // DOM Elements
        const uploadForm = document.getElementById('uploadForm');
        const frontImage = document.getElementById('frontImage');
        const backImage = document.getElementById('backImage');
        const frontButton = document.getElementById('frontButton');
        const backButton = document.getElementById('backButton');
        const generateBtn = document.getElementById('generateBtn');
        const resetBtn = document.getElementById('resetBtn');
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const statusMessage = document.getElementById('statusMessage');
        const downloadSection = document.getElementById('downloadSection');
        const downloadBtn = document.getElementById('downloadBtn');
        const previewBtn = document.getElementById('previewBtn');
        const fileSize = document.getElementById('fileSize');
        const processTime = document.getElementById('processTime');
        const sessionIdDisplay = document.getElementById('sessionIdDisplay');
        
        let currentSessionId = null;
        let currentDownloadUrl = null;
        let holoFaceBlobUrl = null;
        let resultHoloMode = 'off';
        let resultHoloIntensity = 0.5;
        let origMaterialState = null;
        let whiteTexture = null;
        let guillocheThicknessTexture = null;
        let noiseThicknessTexture = null;

        function eachMat(viewer, fn) {
            if (!viewer || !viewer.model) return;
            const mats = viewer.model.materials;
            if (mats[0]) fn(mats[0]);
            if (mats[1]) fn(mats[1]);
        }

        // Create a small white texture
        async function getWhiteTexture(viewer) {
            if (whiteTexture) return whiteTexture;
            const c = document.createElement('canvas');
            c.width = 4; c.height = 4;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, 4, 4);
            whiteTexture = await viewer.createTexture(c.toDataURL('image/png'));
            return whiteTexture;
        }



        // Noise thickness texture — creates organic iridescence distribution
        async function getNoiseThicknessTexture(viewer) {
            if (noiseThicknessTexture) return noiseThicknessTexture;
            const sz = 256;
            const c = document.createElement('canvas');
            c.width = sz; c.height = sz;
            const ctx = c.getContext('2d');
            const img = ctx.createImageData(sz, sz);
            for (let i = 0; i < img.data.length; i += 4) {
                const v = Math.random() * 255;
                img.data[i] = v;
                img.data[i+1] = v;
                img.data[i+2] = v;
                img.data[i+3] = 255;
            }
            ctx.putImageData(img, 0, 0);
            noiseThicknessTexture = await viewer.createTexture(c.toDataURL('image/png'));
            return noiseThicknessTexture;
        }

        // Cache the original guilloche thickness texture from the GLB
        function cacheGuillocheTexture(viewer) {
            if (guillocheThicknessTexture) return;
            if (!viewer || !viewer.model) return;
            const m = viewer.model.materials[0];
            if (m && m.iridescenceThicknessTexture) {
                guillocheThicknessTexture = m.iridescenceThicknessTexture.texture;
            }
        }

        async function setResultHolo(mode) {
            resultHoloMode = mode;
            const viewer = document.getElementById('resultViewer');
            const intensityGroup = document.getElementById('resultHoloIntensityGroup');

            if (mode === 'off') {
                intensityGroup.classList.add('hidden');
                eachMat(viewer, mat => {
                    mat.setIridescenceFactor(0);
                    mat.setEmissiveFactor([0, 0, 0]);
                    if (origMaterialState) {
                        mat.pbrMetallicRoughness.setBaseColorFactor(origMaterialState.baseColor);
                        mat.pbrMetallicRoughness.setMetallicFactor(origMaterialState.metallic);
                        mat.pbrMetallicRoughness.setRoughnessFactor(origMaterialState.roughness);
                    }
                });
                return;
            }

            intensityGroup.classList.remove('hidden');
            if (!viewer || !viewer.model) return;

            const m0 = viewer.model.materials[0];
            if (!origMaterialState && m0) {
                origMaterialState = {
                    baseColor: m0.pbrMetallicRoughness.baseColorFactor,
                    metallic: m0.pbrMetallicRoughness.metallicFactor,
                    roughness: m0.pbrMetallicRoughness.roughnessFactor
                };
            }

            cacheGuillocheTexture(viewer);
            const i = resultHoloIntensity;
            const wt = await getWhiteTexture(viewer);
            const nt = await getNoiseThicknessTexture(viewer);

            if (mode === 'hologram') {
                eachMat(viewer, mat => {
                    mat.pbrMetallicRoughness.setMetallicFactor(0.7);
                    mat.pbrMetallicRoughness.setRoughnessFactor(0.4);
                    mat.setIridescenceFactor(i * 0.15);
                    mat.setIridescenceIor(1.2);
                    mat.setIridescenceThicknessMinimum(0);
                    mat.setIridescenceThicknessMaximum(200);
                    if (wt && mat.iridescenceTexture) mat.iridescenceTexture.setTexture(wt);
                    // Combine guilloche pattern with noise for organic refractive look
                    if (guillocheThicknessTexture && mat.iridescenceThicknessTexture) {
                        mat.iridescenceThicknessTexture.setTexture(guillocheThicknessTexture);
                    }
                    mat.setEmissiveFactor([0, 0, 0]);
                });
            }
        }

        // Attach load listener
        customElements.whenDefined('model-viewer').then(() => {
            const viewer = document.getElementById('resultViewer');
            if (viewer) {
                viewer.addEventListener('load', async () => {
                    origMaterialState = null;
                    whiteTexture = null;
                    rainbowTexture = null;
                    guillocheRainbowTexture = null;
                    guillocheThicknessTexture = null;
                    if (resultHoloMode !== 'off') await setResultHolo(resultHoloMode);
                });
            }
        });

        // Intensity slider — controls both iridescence and emissive glow
        document.getElementById('resultHoloIntensitySlider').addEventListener('input', (e) => {
            resultHoloIntensity = parseInt(e.target.value) / 100;
            document.getElementById('resultHoloIntensityValue').textContent = e.target.value + '%';
            const viewer = document.getElementById('resultViewer');
            const i = resultHoloIntensity;
            eachMat(viewer, mat => {
                mat.setIridescenceFactor(i * 0.15);
                mat.setEmissiveFactor([0, 0, 0]);
            });
            const mvWrap = document.getElementById('oc-mv-wrap-result');
            if (mvWrap) mvWrap.style.setProperty('--oc-card-opacity', i.toFixed(2));
        });
        
        // File input change handlers
        function updateFileButton(input, button, defaultText) {
            if (input.files.length > 0) {
                const fileName = input.files[0].name;
                button.querySelector('span').textContent = fileName;
                button.classList.remove('text-ocean-950/60');
                button.classList.add('text-ocean-950', 'border-ocean-800');
            } else {
                button.querySelector('span').textContent = defaultText;
                button.classList.add('text-ocean-950/60');
                button.classList.remove('text-ocean-950', 'border-ocean-800');
            }
        }

        frontImage.addEventListener('change', () => {
            updateFileButton(frontImage, frontButton, 'Choose front image');
            // Update holo card face from selected file
            const holoFace = document.getElementById('oc-holo-face-upload');
            if (holoFace && frontImage.files.length > 0) {
                if (holoFaceBlobUrl) URL.revokeObjectURL(holoFaceBlobUrl);
                holoFaceBlobUrl = URL.createObjectURL(frontImage.files[0]);
                holoFace.src = holoFaceBlobUrl;
                document.getElementById('holoPreviewSection').classList.remove('hidden');
            }
        });
        backImage.addEventListener('change', () => updateFileButton(backImage, backButton, 'Choose back image'));

        // Load test images from R2
        document.getElementById('loadTestBtn').addEventListener('click', async function() {
            const btn = this;
            btn.disabled = true;
            btn.textContent = 'Loading...';
            try {
                const [fRes, bRes] = await Promise.all([
                    fetch('/static/test-f.png'),
                    fetch('/static/test-r.png')
                ]);
                const [fBlob, bBlob] = await Promise.all([fRes.blob(), bRes.blob()]);

                const setFiles = (input, blob, name, button, label) => {
                    const file = new File([blob], name, { type: 'image/png' });
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    input.files = dt.files;
                    updateFileButton(input, button, label);
                };
                setFiles(frontImage, fBlob, 'test-f.png', frontButton, 'Choose front image');
                setFiles(backImage, bBlob, 'test-r.png', backButton, 'Choose back image');
                // Update holo card face with test front image
                const holoFaceTest = document.getElementById('oc-holo-face-upload');
                if (holoFaceTest) {
                    if (holoFaceBlobUrl) URL.revokeObjectURL(holoFaceBlobUrl);
                    holoFaceBlobUrl = URL.createObjectURL(fBlob);
                    holoFaceTest.src = holoFaceBlobUrl;
                    document.getElementById('holoPreviewSection').classList.remove('hidden');
                }
            } catch (err) {
                showStatus('Failed to load test images: ' + err.message, 'error');
            }
            btn.disabled = false;
            btn.textContent = 'Load Test Images';
        });
        // Form submission
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(uploadForm);
            
            // Start processing
            generateBtn.disabled = true;
            resetBtn.disabled = true;
            progressContainer.classList.remove('hidden');
            downloadSection.classList.add('hidden');
            hideStatus();
            
            try {
                // Upload files
                updateProgress(10, 'Uploading...');
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadResponse.ok) {
                    const error = await uploadResponse.json();
                    throw new Error(error.error || 'Upload failed');
                }
                
                const uploadResult = await uploadResponse.json();
                currentSessionId = uploadResult.sessionId;
                
                // Start processing
                updateProgress(30, 'Processing...');
                const processResponse = await fetch(\`/api/process?sessionId=\${currentSessionId}\`, {
                    method: 'POST'
                });
                
                if (!processResponse.ok) {
                    const error = await processResponse.json();
                    throw new Error(error.error || 'Processing failed');
                }
                
                // Poll for completion
                updateProgress(50, 'Generating 3D model...');
                await pollStatus();
                
            } catch (error) {
                showStatus(error.message, 'error');
                generateBtn.disabled = false;
                resetBtn.disabled = false;
                progressContainer.classList.add('hidden');
            }
        });
        
        // Poll for processing status
        async function pollStatus() {
            const maxAttempts = 60;
            let attempts = 0;
            
            const poll = async () => {
                if (attempts >= maxAttempts) {
                    throw new Error('Processing timeout');
                }
                
                const response = await fetch(\`/api/status?sessionId=\${currentSessionId}\`);
                const result = await response.json();
                
                if (result.status === 'completed') {
                    updateProgress(100, 'Complete');
                    showStatus('3D card generated successfully', 'success');
                    
                    // Store download URL
                    currentDownloadUrl = result.downloadUrl || '/api/download?sessionId=' + currentSessionId;
                    
                    // Show download section
                    downloadSection.classList.remove('hidden');
                    sessionIdDisplay.textContent = currentSessionId;

                    // Load GLB into inline viewer
                    const resultViewer = document.getElementById('resultViewer');
                    if (resultViewer) {
                        resultViewer.src = currentDownloadUrl;
                    }
                    
                    // Update file info
                    if (result.fileSize) {
                        fileSize.textContent = formatFileSize(result.fileSize);
                    }
                    if (result.processingTime) {
                        processTime.textContent = formatTime(result.processingTime);
                    }
                    
                    // Set download URL
                    downloadBtn.onclick = () => {
                        const link = document.createElement('a');
                        link.href = currentDownloadUrl;
                        link.download = 'card-' + currentSessionId + '.glb';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };
                    
                    // Set preview URL
                    previewBtn.onclick = () => {
                        window.open('/preview?session=' + encodeURIComponent(currentSessionId), '_blank');
                    };
                    
                    generateBtn.disabled = false;
                    resetBtn.disabled = false;
                    
                    setTimeout(() => {
                        progressContainer.classList.add('hidden');
                    }, 500);
                    
                } else if (result.status === 'error') {
                    throw new Error(result.error || 'Processing failed');
                } else {
                    // Update progress based on status
                    if (result.status === 'processing') {
                        const progress = Math.min(90, 50 + (attempts * 2));
                        updateProgress(progress, 'Generating 3D model...');
                    }
                    
                    attempts++;
                    setTimeout(poll, 2000);
                }
            };
            
            await poll();
        }
        
        // Toggle copyright text field
        function toggleCopyrightText() {
            const checkbox = document.getElementById('copyrightEnabled');
            const container = document.getElementById('copyrightTextContainer');
            if (checkbox.checked) {
                container.classList.remove('hidden');
            } else {
                container.classList.add('hidden');
            }
        }
        
        // Reset form
        resetBtn.addEventListener('click', () => {
            uploadForm.reset();
            updateFileButton(frontImage, frontButton, 'Choose front image');
            updateFileButton(backImage, backButton, 'Choose back image');
            progressContainer.classList.add('hidden');
            downloadSection.classList.add('hidden');
            hideStatus();
            currentSessionId = null;
            currentDownloadUrl = null;
            // Reset copyright text
            document.getElementById('copyrightTextContainer').classList.add('hidden');
            // Reset holographic overlay
            setResultHolo('off');
            document.querySelector('input[name="resultHoloMode"][value="off"]').checked = true;
            const resultViewer = document.getElementById('resultViewer');
            if (resultViewer) resultViewer.removeAttribute('src');
            // Reset holo card face
            if (holoFaceBlobUrl) { URL.revokeObjectURL(holoFaceBlobUrl); holoFaceBlobUrl = null; }
            const holoFaceReset = document.getElementById('oc-holo-face-upload');
            if (holoFaceReset) holoFaceReset.src = '';
            document.getElementById('holoPreviewSection').classList.add('hidden');
        });
        
        // Helper functions
        function updateProgress(percent, text) {
            progressFill.style.width = percent + '%';
            progressText.textContent = text;
        }
        
        function showStatus(message, type) {
            statusMessage.textContent = message;
            statusMessage.classList.remove('hidden', 'bg-red-50', 'text-red-800', 'bg-green-50', 'text-green-800', 'bg-ocean-100', 'text-ocean-800');
            
            if (type === 'error') {
                statusMessage.classList.add('bg-red-50', 'text-red-800');
            } else if (type === 'success') {
                statusMessage.classList.add('bg-green-50', 'text-green-800');
            } else {
                statusMessage.classList.add('bg-ocean-100', 'text-ocean-800');
            }
        }

        function hideStatus() {
            statusMessage.classList.add('hidden');
        }
        
        function formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
        
        function formatTime(ms) {
            if (ms < 1000) return ms + ' ms';
            return (ms / 1000).toFixed(1) + ' s';
        }
        ${getHoloCardJS('upload')}
        ${getHoloOverlayJS('result')}
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

/**
 * Serve test page with embedded sample images
 * @returns {Response} Test HTML response
 */
export function serveTestPage() {
  const testHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test - 3D Card Generator</title>
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
                <a href="/preview" class="text-sm text-ocean-950/60 hover:text-ocean-800">Preview</a>
                <a href="/test" class="text-sm font-medium text-ocean-800">Test</a>
                <a href="/drive" class="text-sm text-ocean-950/60 hover:text-ocean-800">Drive</a>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div class="mb-8">
            <h1 class="text-2xl font-semibold tracking-tight text-ocean-950 sm:text-3xl">Test Card Generation</h1>
            <p class="mt-2 text-ocean-950/70">Generate a 3D card using sample images to test the system</p>
        </div>

        <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-sm font-medium text-ocean-950">Sample Card Images</h2>
            
            <div class="grid grid-cols-2 gap-6">
                <div class="text-center">
                    <p class="mb-2 text-sm font-medium text-ocean-950">Front Side</p>
                    <canvas id="front" width="400" height="250" class="w-full rounded-md border border-ocean-300"></canvas>
                </div>
                <div class="text-center">
                    <p class="mb-2 text-sm font-medium text-ocean-950">Back Side</p>
                    <canvas id="back" width="400" height="250" class="w-full rounded-md border border-ocean-300"></canvas>
                </div>
            </div>

            <div class="mt-6 flex justify-center">
                <button 
                    id="testBtn"
                    onclick="test()"
                    class="inline-flex items-center justify-center rounded-md bg-ocean-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-ocean-950 focus:outline-none focus:ring-2 focus:ring-ocean-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Generate Test Card
                </button>
            </div>
        </div>

        <!-- Status -->
        <div id="status" class="mt-6 hidden rounded-md p-4 text-sm" role="alert"></div>

        <!-- Download Section -->
        <div id="download" class="mt-6 hidden rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
            <div class="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h3 class="font-medium text-ocean-950">Test Card Generated</h3>
                    <p class="mt-1 text-sm text-ocean-950/60">Your test 3D card is ready</p>
                </div>
                <div class="flex gap-2">
                    <button 
                        id="previewTestBtn"
                        class="inline-flex items-center gap-2 rounded-md border border-ocean-300 bg-white px-4 py-2 text-sm font-medium text-ocean-950 hover:bg-ocean-100"
                    >
                        Preview
                    </button>
                    <button 
                        id="dlBtn"
                        class="inline-flex items-center gap-2 rounded-md bg-ocean-800 px-4 py-2 text-sm font-medium text-white hover:bg-ocean-950"
                    >
                        Download
                    </button>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="mt-auto border-t border-ocean-300 bg-white">
        <div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <p class="text-center text-sm text-ocean-950/60">© 2026 OOCard. All rights reserved. · v1.12 · ${new Date().toISOString().slice(0, 19)}Z</p>
        </div>
    </footer>

    <script>
        let currentTestSession = null;
        let currentDownloadUrl = null;
        
        function init() {
            const frontCanvas = document.getElementById("front");
            const frontCtx = frontCanvas.getContext("2d");
            frontCtx.fillStyle = "#03045e";
            frontCtx.fillRect(0, 0, 400, 250);
            frontCtx.fillStyle = "#fff";
            frontCtx.font = "bold 24px Inter, sans-serif";
            frontCtx.textAlign = "center";
            frontCtx.fillText("SAMPLE CARD", 200, 100);
            frontCtx.font = "16px Inter, sans-serif";
            frontCtx.fillText("Front Side", 200, 135);
            frontCtx.font = "12px Inter, sans-serif";
            frontCtx.fillStyle = "#90e0ef";
            frontCtx.fillText("CR80 Standard Test", 200, 165);
            
            const backCanvas = document.getElementById("back");
            const backCtx = backCanvas.getContext("2d");
            backCtx.fillStyle = "#0077b6";
            backCtx.fillRect(0, 0, 400, 250);
            backCtx.fillStyle = "#fff";
            backCtx.font = "bold 24px Inter, sans-serif";
            backCtx.textAlign = "center";
            backCtx.fillText("SAMPLE CARD", 200, 100);
            backCtx.font = "16px Inter, sans-serif";
            backCtx.fillText("Back Side", 200, 135);
            backCtx.font = "12px Inter, sans-serif";
            backCtx.fillStyle = "#caf0f8";
            backCtx.fillText("CR80 Standard Test", 200, 165);
        }
        
        async function test() {
            const status = document.getElementById("status");
            const testBtn = document.getElementById("testBtn");
            
            try {
                testBtn.disabled = true;
                testBtn.textContent = "Processing...";
                showStatus("Generating test images and processing...", "info");
                
                const frontCanvas = document.getElementById("front");
                const backCanvas = document.getElementById("back");
                
                const frontBlob = await new Promise(resolve => frontCanvas.toBlob(resolve, "image/png"));
                const backBlob = await new Promise(resolve => backCanvas.toBlob(resolve, "image/png"));
                
                const formData = new FormData();
                formData.append("frontImage", new File([frontBlob], "front.png"));
                formData.append("backImage", new File([backBlob], "back.png"));
                
                showStatus("Uploading test images...", "info");
                const uploadResponse = await fetch("/api/upload", {
                    method: "POST",
                    body: formData
                });
                
                if (!uploadResponse.ok) {
                    const error = await uploadResponse.json();
                    throw new Error(error.error || 'Upload failed');
                }
                
                const uploadData = await uploadResponse.json();
                currentTestSession = uploadData.sessionId;
                
                showStatus("Generating 3D model...", "info");
                const processResponse = await fetch(\`/api/process?sessionId=\${currentTestSession}\`, {
                    method: "POST"
                });
                
                if (!processResponse.ok) {
                    const error = await processResponse.json();
                    throw new Error(error.error || 'Processing failed');
                }
                
                await pollTestStatus();
                
            } catch (error) {
                showStatus("Error: " + error.message, "error");
                testBtn.disabled = false;
                testBtn.textContent = "Generate Test Card";
            }
        }
        
        async function pollTestStatus() {
            const maxAttempts = 30;
            let attempts = 0;
            
            const poll = async () => {
                if (attempts >= maxAttempts) {
                    throw new Error('Processing timeout');
                }
                
                const response = await fetch(\`/api/status?sessionId=\${currentTestSession}\`);
                const result = await response.json();
                
                if (result.status === 'completed') {
                    showStatus("Test card generated successfully", "success");
                    
                    currentDownloadUrl = result.downloadUrl || '/api/download?sessionId=' + currentTestSession;
                    
                    document.getElementById("download").classList.remove("hidden");
                    
                    document.getElementById("dlBtn").onclick = () => {
                        const link = document.createElement('a');
                        link.href = currentDownloadUrl;
                        link.download = 'test-card.glb';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };
                    
                    document.getElementById("previewTestBtn").onclick = () => {
                        window.open('/preview?session=' + encodeURIComponent(currentTestSession), '_blank');
                    };
                    
                    const testBtn = document.getElementById("testBtn");
                    testBtn.disabled = false;
                    testBtn.textContent = "Generate Test Card";
                    
                } else if (result.status === 'error') {
                    throw new Error(result.error || 'Processing failed');
                } else {
                    showStatus("Generating 3D model... " + Math.round((attempts / maxAttempts) * 100) + "%", "info");
                    attempts++;
                    setTimeout(poll, 2000);
                }
            };
            
            await poll();
        }
        
        function showStatus(message, type) {
            const status = document.getElementById("status");
            status.textContent = message;
            status.classList.remove('hidden', 'bg-red-50', 'text-red-800', 'bg-green-50', 'text-green-800', 'bg-ocean-100', 'text-ocean-800');
            
            if (type === 'error') {
                status.classList.add('bg-red-50', 'text-red-800');
            } else if (type === 'success') {
                status.classList.add('bg-green-50', 'text-green-800');
            } else {
                status.classList.add('bg-ocean-100', 'text-ocean-800');
            }
        }
        
        window.addEventListener('load', init);
    </script>
</body>
</html>`;

  return new Response(testHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
