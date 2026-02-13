// Note: fs imports don't work in Cloudflare Workers
// HTML is embedded directly in the function

/**
 * Serve the HTML UI
 * @returns {Response} HTML response
 */
export function serveUI() {
  // In Workers environment, we need to read the HTML differently
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Card Generator - OOCard</title>
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.1.1/model-viewer.min.js"></script>
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
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(2, 48, 71, 0.2);
            max-width: 900px;
            width: 95%;
            margin: 20px auto;
            padding: 0;
            animation: slideUp 0.5s ease-out;
            overflow: hidden;
        }
        
        .tab-content {
            padding: 40px;
        }
        
        .tab-content-container {
            background: white;
        }
        
        .content-tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
            overflow-x: auto;
            scrollbar-width: thin;
        }
        
        .content-tab {
            padding: 18px 30px;
            background: transparent;
            border: none;
            color: #6c757d;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
            border-bottom: 3px solid transparent;
            position: relative;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .content-tab:hover {
            background: rgba(33, 158, 188, 0.08);
            color: #219EBC;
        }
        
        .content-tab.active {
            color: #219EBC;
            background: white;
            border-bottom-color: #219EBC;
        }
        
        .tab-panel {
            padding: 40px;
            display: none;
        }
        
        .tab-panel.active {
            display: block;
            animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
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
        
        .page-header {
            padding: 40px 40px 20px 40px;
            text-align: center;
            background: linear-gradient(135deg, #8ECAE6 0%, #219EBC 100%);
            color: white;
        }
        
        h1 {
            color: white;
            margin-bottom: 16px;
            font-size: 36px;
            font-weight: 700;
        }
        
        .subtitle {
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 0;
            font-size: 18px;
            font-weight: 400;
        }
        
        .upload-area {
            border: 2px dashed rgba(33, 158, 188, 0.3);
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
            transition: all 0.3s ease;
            background: rgba(142, 202, 230, 0.02);
        }
        
        .upload-area:hover {
            border-color: #219EBC;
            background: rgba(142, 202, 230, 0.08);
        }
        
        .file-input-group {
            margin: 24px 0;
            text-align: left;
            padding: 24px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(2, 48, 71, 0.08);
            border: 1px solid rgba(33, 158, 188, 0.1);
        }
        
        .file-input-label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        
        .file-input-wrapper {
            position: relative;
            display: inline-block;
            cursor: pointer;
            width: 100%;
        }
        
        .file-input {
            position: absolute;
            opacity: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }
        
        .file-input-button {
            display: block;
            width: 100%;
            padding: 12px 20px;
            background: #f5f5f5;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            color: #666;
            font-size: 14px;
            transition: all 0.3s ease;
            text-align: left;
        }
        
        .file-input-wrapper:hover .file-input-button {
            background: #fff;
            border-color: #219EBC;
            color: #219EBC;
        }
        
        .file-input-button.has-file {
            background: rgba(142, 202, 230, 0.1);
            border-color: #219EBC;
            color: #023047;
        }
        
        .required {
            color: #e74c3c;
        }
        
        .file-requirements {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }
        
        .button {
            background: linear-gradient(135deg, #FFB703 0%, #FB8500 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-block;
            margin: 12px 8px;
            box-shadow: 0 4px 12px rgba(251, 133, 0, 0.2);
        }
        
        .button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(251, 133, 0, 0.3);
        }
        
        .button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .button.secondary {
            background: rgba(2, 48, 71, 0.1);
            color: #023047;
            box-shadow: 0 4px 12px rgba(2, 48, 71, 0.1);
        }
        
        .button.secondary:hover:not(:disabled) {
            background: rgba(2, 48, 71, 0.15);
            box-shadow: 0 8px 24px rgba(2, 48, 71, 0.15);
        }
        
        .progress-container {
            margin: 30px 0;
            display: none;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #FFB703 0%, #FB8500 100%);
            width: 0%;
            transition: width 0.3s ease;
            border-radius: 10px;
        }
        
        .progress-text {
            margin-top: 10px;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        
        .status-message {
            padding: 15px 20px;
            border-radius: 10px;
            margin: 20px 0;
            display: none;
        }
        
        .status-message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .status-message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .status-message.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        
        .spec-note {
            background: rgba(142, 202, 230, 0.08);
            border-left: 4px solid #219EBC;
            padding: 32px;
            margin: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(2, 48, 71, 0.08);
        }
        
        .spec-note h4 {
            color: #023047;
            margin-bottom: 16px;
            font-weight: 600;
        }
        
        .spec-note ul {
            list-style: none;
            padding-left: 0;
        }
        
        .spec-note li {
            padding: 5px 0;
            color: #666;
        }
        
        .spec-note li:before {
            content: "✓ ";
            color: #219EBC;
            font-weight: bold;
        }
        
        .preview-section {
            display: none;
            text-align: center;
            padding: 30px;
            background: #f5f3ff;
            border-radius: 15px;
            margin-top: 30px;
        }
        
        .preview-section h3 {
            color: #333;
            margin-bottom: 20px;
        }
        
        .model-viewer-container {
            width: 100%;
            height: 400px;
            margin: 20px 0;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        model-viewer {
            width: 100%;
            height: 100%;
            background-color: #f0f0f0;
            --poster-color: transparent;
        }
        
        .viewer-controls {
            margin: 20px 0;
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .control-button {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            border: 1px solid #667eea;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .control-button:hover {
            background: #667eea;
            color: white;
        }
        
        .file-info {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            padding: 15px;
            background: white;
            border-radius: 10px;
        }
        
        .file-info-item {
            text-align: center;
        }
        
        .file-info-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .file-info-value {
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="page-header">
            <h1>3D Card Generator</h1>
            <p class="subtitle">Transform your card designs into 3D GLB models for WordPress</p>
        </div>
        
        <!-- Material-UI Style Tabs -->
        <div class="mui-tabs" style="background: white; border-bottom: 1px solid #e0e0e0;">
            <div class="mui-tab-list" style="display: flex; padding: 0 40px;">
                <button class="mui-tab mui-tab-active" onclick="showTab('upload')" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #219EBC; border-bottom: 2px solid #219EBC; cursor: pointer; transition: all 0.3s; min-width: 90px;">Upload</button>
                <button class="mui-tab" onclick="showTab('specs')" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(2,48,71,0.6); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.3s; min-width: 90px;">Specs</button>
                <button class="mui-tab" onclick="showTab('guide')" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(2,48,71,0.6); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.3s; min-width: 90px;">Guide</button>
                <a href="/preview" class="mui-tab" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(2,48,71,0.6); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.3s; min-width: 90px; text-decoration: none; display: inline-block;">Preview</a>
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
            .mui-tab-panel {
                display: none;
                animation: fadeIn 0.3s;
            }
            .mui-tab-panel.active {
                display: block;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        </style>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
            <div class="spec-note">
                <h4>Card Specifications</h4>
                <ul>
                    <li>CR80 Standard: 85.6mm × 53.98mm × 0.76mm</li>
                    <li>Corner Radius: 3.18mm (1/8 inch)</li>
                    <li>File Naming: Any name ending with -F.png (front) and -R.png (back)</li>
                    <li>Format: PNG images, optional SVG overlay</li>
                </ul>
            </div>
            
            <div class="spec-note">
                <h4>Available Routes</h4>
                <ul>
                    <li><strong>/</strong> - Main generator (this page)</li>
                    <li><strong>/preview</strong> - Interactive 3D card viewer</li>
                    <li><strong>/test</strong> - Test with sample images</li>
                    <li><strong>/preview?session=ID</strong> - Load specific card</li>
                </ul>
            </div>
        </div>
        
        <style>
            @media (max-width: 768px) {
                .spec-note:nth-child(1), .spec-note:nth-child(2) {
                    grid-column: 1;
                }
                div[style*="grid-template-columns"] {
                    grid-template-columns: 1fr !important;
                }
            }
        </style>
        
        <!-- Tab Content Sections -->
        <div id="uploadTab" class="tab-content mui-tab-panel active">
            <form id="uploadForm">
                <div class="upload-area" id="uploadArea">
                <div class="file-input-group">
                    <label class="file-input-label">
                        Front Image <span class="required">*</span>
                    </label>
                    <div class="file-input-wrapper">
                        <input type="file" 
                               id="frontImage" 
                               name="frontImage" 
                               class="file-input" 
                               accept=".png,image/png" 
                               required>
                        <div class="file-input-button" id="frontButton">
                            Choose front image (must end with -F.png)
                        </div>
                    </div>
                    <div class="file-requirements">Required: PNG format, filename must end with -F.png</div>
                </div>
                
                <div class="file-input-group">
                    <label class="file-input-label">
                        Back Image <span class="required">*</span>
                    </label>
                    <div class="file-input-wrapper">
                        <input type="file" 
                               id="backImage" 
                               name="backImage" 
                               class="file-input" 
                               accept=".png,image/png" 
                               required>
                        <div class="file-input-button" id="backButton">
                            Choose back image (must end with -R.png)
                        </div>
                    </div>
                    <div class="file-requirements">Required: PNG format, filename must end with -R.png</div>
                </div>
                
                <div class="file-input-group">
                    <label class="file-input-label">
                        Overlay (Optional)
                    </label>
                    <div class="file-input-wrapper">
                        <input type="file" 
                               id="overlay" 
                               name="overlay" 
                               class="file-input" 
                               accept=".svg,image/svg+xml">
                        <div class="file-input-button" id="overlayButton">
                            Choose overlay SVG (optional)
                        </div>
                    </div>
                    <div class="file-requirements">Optional: SVG format for additional effects</div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding: 30px 0;">
                <button type="button" class="button secondary" id="resetBtn" style="margin-right: 15px;">Reset</button>
                <button type="submit" class="button" id="generateBtn">Generate 3D Card</button>
            </div>
        </form>
        
        <div class="progress-container" id="progressContainer">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text" id="progressText">Uploading files...</div>
        </div>
        
        <div class="status-message" id="statusMessage"></div>
        
        <div class="success-actions" id="successActions" style="display: none; margin-top: 30px;">
            <div style="background: #d4edda; border: 2px solid #c3e6cb; border-radius: 15px; padding: 30px; margin-top: 30px; text-align: center;">
                <h3 style="color: #155724; margin-bottom: 20px; font-size: 24px;">🎉 Your 3D Card is Ready!</h3>
                <p style="color: #155724; margin-bottom: 25px; font-size: 16px;">Choose what you'd like to do next:</p>
                
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <button 
                        id="previewBtn"
                        class="button" 
                        style="background: linear-gradient(135deg, #219EBC 0%, #023047 100%); min-width: 200px; display: flex; align-items: center; justify-content: center; gap: 10px;"
                        onclick="openPreview()">
                        <span>🎴</span>
                        <span>View in 3D</span>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                            <path d="M11 1H3C1.9 1 1 1.9 1 3V11C1 12.1 1.9 13 3 13H11C12.1 13 13 12.1 13 11V3C13 1.9 12.1 1 11 1ZM11 11H3V3H11V11ZM9 5L5 9V7H7V5H9Z"/>
                        </svg>
                    </button>
                    
                    <button 
                        id="downloadBtn"
                        class="button" 
                        style="background: linear-gradient(135deg, #FFB703 0%, #FB8500 100%); min-width: 200px; display: flex; align-items: center; justify-content: center; gap: 10px;"
                        onclick="downloadCard()">
                        <span>📥</span>
                        <span>Download GLB</span>
                    </button>
                </div>
                
                <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid #c3e6cb;">
                    <button 
                        class="button secondary" 
                        style="background: #f5f5f5; color: #666;"
                        onclick="createAnother()">
                        Create Another Card
                    </button>
                </div>
                
                <div style="margin-top: 20px; font-size: 14px; color: #666;">
                    <p>Session ID: <code id="sessionIdDisplay" style="background: #f0f0f0; padding: 2px 8px; border-radius: 4px;">-</code></p>
                    <p style="margin-top: 10px; color: #999;">Your card will be available for 1 hour</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // DOM Elements
        const uploadForm = document.getElementById('uploadForm');
        const uploadArea = document.getElementById('uploadArea');
        const frontImage = document.getElementById('frontImage');
        const backImage = document.getElementById('backImage');
        const overlay = document.getElementById('overlay');
        const frontButton = document.getElementById('frontButton');
        const backButton = document.getElementById('backButton');
        const overlayButton = document.getElementById('overlayButton');
        const generateBtn = document.getElementById('generateBtn');
        const resetBtn = document.getElementById('resetBtn');
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const statusMessage = document.getElementById('statusMessage');
        
        let currentSessionId = null;
        
        // File input change handlers
        frontImage.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                frontButton.textContent = \`Selected: \${e.target.files[0].name}\`;
                frontButton.classList.add('has-file');
            } else {
                frontButton.textContent = 'Choose front image (must end with -F.png)';
                frontButton.classList.remove('has-file');
            }
        });
        
        backImage.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                backButton.textContent = \`Selected: \${e.target.files[0].name}\`;
                backButton.classList.add('has-file');
            } else {
                backButton.textContent = 'Choose back image (must end with -R.png)';
                backButton.classList.remove('has-file');
            }
        });
        
        overlay.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                overlayButton.textContent = \`Selected: \${e.target.files[0].name}\`;
                overlayButton.classList.add('has-file');
            } else {
                overlayButton.textContent = 'Choose overlay SVG (optional)';
                overlayButton.classList.remove('has-file');
            }
        });
        
        // Form submission
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(uploadForm);
            
            // Validate file names
            const frontFile = formData.get('frontImage');
            const backFile = formData.get('backImage');
            
            if (!validateFileName(frontFile.name, 'F')) {
                showStatus('Front image filename must end with -F.png', 'error');
                return;
            }
            
            if (!validateFileName(backFile.name, 'R')) {
                showStatus('Back image filename must end with -R.png', 'error');
                return;
            }
            
            // Start processing
            generateBtn.disabled = true;
            resetBtn.disabled = true;
            progressContainer.style.display = 'block';
            
            try {
                // Upload files
                updateProgress(10, 'Uploading files...');
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
                updateProgress(30, 'Processing images...');
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
                progressContainer.style.display = 'none';
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
                    updateProgress(100, 'Complete!');
                    showStatus('3D card generated successfully!', 'success');
                    
                    generateBtn.disabled = false;
                    resetBtn.disabled = false;
                    
                    // Hide progress after a moment
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                    }, 1500);
                    
                    // Show success actions
                    showSuccessActions(currentSessionId, result.downloadUrl || '/api/download?sessionId=' + currentSessionId);
                    
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
        
        // Reset form
        resetBtn.addEventListener('click', () => {
            uploadForm.reset();
            frontButton.textContent = 'Choose front image (must end with -F.png)';
            frontButton.classList.remove('has-file');
            backButton.textContent = 'Choose back image (must end with -R.png)';
            backButton.classList.remove('has-file');
            overlayButton.textContent = 'Choose overlay SVG (optional)';
            overlayButton.classList.remove('has-file');
            progressContainer.style.display = 'none';
            statusMessage.style.display = 'none';
            document.getElementById('successActions').style.display = 'none';
            currentSessionId = null;
            window.currentDownloadUrl = null;
        });
        
        // Helper functions
        function validateFileName(filename, type) {
            // Allow any naming pattern as long as it ends with -F or -R before the extension
            const pattern = new RegExp(\`-\${type}\\\\.(png|PNG)\$\`, 'i');
            return pattern.test(filename);
        }
        
        function updateProgress(percent, text) {
            progressFill.style.width = percent + '%';
            progressText.textContent = text;
        }
        
        function showStatus(message, type) {
            statusMessage.textContent = message;
            statusMessage.className = 'status-message ' + type;
            statusMessage.style.display = 'block';
            
            if (type === 'success') {
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                }, 5000);
            }
        }
        
        function showPreview(downloadUrl, fileSize) {
            // Create preview section if it doesn't exist
            let previewSection = document.querySelector('.preview-section');
            if (!previewSection) {
                previewSection = document.createElement('div');
                previewSection.className = 'preview-section';
                previewSection.innerHTML = '<h3>3D Card Preview</h3>' +
                    '<div class="model-viewer-container">' +
                        '<model-viewer id="cardViewer" ' +
                                      'auto-rotate ' +
                                      'camera-controls ' +
                                      'shadow-intensity="1" ' +
                                      'exposure="0.8" ' +
                                      'tone-mapping="neutral" ' +
                                      'poster-color="#f0f0f0">' +
                        '</model-viewer>' +
                    '</div>' +
                    '<div class="viewer-controls">' +
                        '<button class="control-button" onclick="resetView()">Reset View</button>' +
                        '<button class="control-button" onclick="toggleRotation()">Toggle Rotation</button>' +
                        '<button class="control-button" onclick="flipCard()">Flip Card</button>' +
                        '<button class="button" onclick="downloadModel()">Download GLB</button>' +
                    '</div>' +
                    '<div class="file-info">' +
                        '<div class="file-info-item">' +
                            '<div class="file-info-label">File Size</div>' +
                            '<div class="file-info-value" id="fileSizeInfo">-</div>' +
                        '</div>' +
                        '<div class="file-info-item">' +
                            '<div class="file-info-label">Format</div>' +
                            '<div class="file-info-value">GLB 2.0</div>' +
                        '</div>' +
                        '<div class="file-info-item">' +
                            '<div class="file-info-label">Dimensions</div>' +
                            '<div class="file-info-value">CR80 Standard</div>' +
                        '</div>' +
                    '</div>';
                document.querySelector('.container').appendChild(previewSection);
            }
            
            // Update model source and file info
            const modelViewer = document.getElementById('cardViewer');
            modelViewer.src = downloadUrl;
            document.getElementById('fileSizeInfo').textContent = formatFileSize(fileSize);
            
            // Store download URL for button
            window.currentDownloadUrl = downloadUrl;
            
            // Show the preview
            previewSection.style.display = 'block';
            
            // Scroll to preview
            previewSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        function formatFileSize(bytes) {
            if (typeof bytes !== 'number') return bytes;
            const sizes = ['Bytes', 'KB', 'MB'];
            if (bytes === 0) return '0 Bytes';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round(bytes / Math.pow(1024, i) * 10) / 10 + ' ' + sizes[i];
        }
        
        // Model viewer control functions
        function resetView() {
            const viewer = document.getElementById('cardViewer');
            viewer.cameraTarget = '0 0 0';
            viewer.cameraOrbit = '0deg 75deg 8m';
        }
        
        function toggleRotation() {
            const viewer = document.getElementById('cardViewer');
            viewer.autoRotate = !viewer.autoRotate;
        }
        
        function flipCard() {
            const viewer = document.getElementById('cardViewer');
            const currentOrbit = viewer.cameraOrbit || '0deg 75deg 8m';
            const parts = currentOrbit.split(' ');
            const azimuth = parseFloat(parts[0]) || 0;
            const newAzimuth = (azimuth + 180) % 360;
            viewer.cameraOrbit = newAzimuth + 'deg ' + (parts[1] || '75deg') + ' ' + (parts[2] || '8m');
        }
        
        function downloadModel() {
            if (window.currentDownloadUrl) {
                window.location.href = window.currentDownloadUrl;
            }
        }
        
        // Success action functions
        function showSuccessActions(sessionId, downloadUrl) {
            console.log('showSuccessActions called with:', { sessionId, downloadUrl });
            const successActions = document.getElementById('successActions');
            const sessionIdDisplay = document.getElementById('sessionIdDisplay');
            
            // Store session and download URL globally
            window.currentSessionId = sessionId;
            window.currentDownloadUrl = downloadUrl;
            
            console.log('Stored globally:', { 
                currentSessionId: window.currentSessionId, 
                currentDownloadUrl: window.currentDownloadUrl 
            });
            
            // Update session ID display
            sessionIdDisplay.textContent = sessionId;
            
            // Show success actions
            successActions.style.display = 'block';
            
            // Smooth scroll to success actions
            setTimeout(() => {
                successActions.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
        
        function openPreview() {
            console.log('openPreview called, currentSessionId:', window.currentSessionId);
            if (window.currentSessionId) {
                // Open preview in new tab with session ID
                const previewUrl = '/preview?session=' + encodeURIComponent(window.currentSessionId);
                console.log('Opening preview with URL:', previewUrl);
                console.log('Session ID being passed:', window.currentSessionId);
                window.open(previewUrl, '_blank');
            } else {
                console.error('No session ID found');
                alert('No session ID found. Please generate a card first.');
            }
        }
        
        function downloadCard() {
            if (window.currentDownloadUrl) {
                // Create a temporary link and trigger download
                const link = document.createElement('a');
                link.href = window.currentDownloadUrl;
                link.download = 'card-' + (window.currentSessionId || 'model') + '.glb';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Show feedback
                showStatus('Download started! Check your downloads folder.', 'info');
            }
        }
        
        function createAnother() {
            // Reset the form and hide success actions
            resetBtn.click();
            document.getElementById('successActions').style.display = 'none';
            
            // Scroll back to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Tab functionality
        function showTab(tabName) {
            // Hide all tabs
            const tabs = document.querySelectorAll('.mui-tab-panel');
            tabs.forEach(tab => {
                tab.style.display = 'none';
                tab.classList.remove('active');
            });
            
            // Show selected tab
            const selectedTab = document.getElementById(tabName + 'Tab');
            if (selectedTab) {
                selectedTab.style.display = 'block';
                selectedTab.classList.add('active');
            }
            
            // Update tab buttons
            const tabButtons = document.querySelectorAll('.mui-tab');
            tabButtons.forEach(btn => {
                btn.classList.remove('mui-tab-active');
                btn.style.color = 'rgba(0,0,0,0.6)';
                btn.style.borderBottomColor = 'transparent';
            });
            
            // Activate clicked tab
            event.target.classList.add('mui-tab-active');
            event.target.style.color = '#219EBC';
            event.target.style.borderBottomColor = '#219EBC';
        }
    </script>
        </div>
    </div>
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
    <title>3D Card Generator - Test</title>
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
        
        .container {
            max-width: 900px;
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
        
        .test-content {
            padding: 48px;
        }
        
        .sample-images {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
        }
        
        .sample-image {
            text-align: center;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .sample-image h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .sample-image canvas {
            border-radius: 10px;
            max-width: 100%;
            height: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .button {
            background: linear-gradient(135deg, #FFB703 0%, #FB8500 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-block;
            margin: 20px 8px;
            box-shadow: 0 4px 12px rgba(251, 133, 0, 0.2);
        }
        
        .button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(251, 133, 0, 0.3);
        }
        
        .button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .status {
            margin: 20px 0;
            padding: 15px 20px;
            border-radius: 10px;
            display: none;
        }
        
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .status.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        
        .mui-tab:hover {
            background-color: rgba(33, 158, 188, 0.06) !important;
            color: #219EBC !important;
        }
        
        .mui-tab-active {
            color: #219EBC !important;
            border-bottom-color: #219EBC !important;
        }
        
        @media (max-width: 768px) {
            .sample-images {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .sample-image canvas {
                width: 100%;
                max-width: 300px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 3D Card Test</h1>
        <p>Test the 3D card generator with sample images</p>
    </div>
    
    <div class="container">
        <!-- Material-UI Style Navigation Tabs -->
        <div class="mui-tabs" style="background: white; border-bottom: 1px solid #e0e0e0;">
            <div class="mui-tab-list" style="display: flex; padding: 0 40px;">
                <a href="/" class="mui-tab" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(2,48,71,0.6); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.3s; min-width: 90px; text-decoration: none; display: inline-block;">Upload</a>
                <a href="/preview" class="mui-tab" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(2,48,71,0.6); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.3s; min-width: 90px; text-decoration: none; display: inline-block;">Preview</a>
                <button class="mui-tab mui-tab-active" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #219EBC; border-bottom: 2px solid #219EBC; cursor: pointer; transition: all 0.3s; min-width: 90px;">Test</button>
                <a href="/drive" class="mui-tab" style="background: none; border: none; padding: 16px 24px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(2,48,71,0.6); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.3s; min-width: 90px; text-decoration: none; display: inline-block;">Drive</a>
            </div>
        </div>
        
        <div class="test-content">
            <h1 style="color: #333; margin-bottom: 10px; font-size: 28px;">Test 3D Card Generation</h1>
            <p style="color: #666; margin-bottom: 30px; font-size: 16px;">Click the button below to test the 3D card generator with automatically generated sample images</p>
            
            <div class="sample-images">
                <div class="sample-image">
                    <h3>Front Side</h3>
                    <canvas id="front" width="400" height="250"></canvas>
                </div>
                <div class="sample-image">
                    <h3>Back Side</h3>
                    <canvas id="back" width="400" height="250"></canvas>
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <button class="button" onclick="test()" id="testBtn">🚀 Generate 3D Test Card</button>
            </div>
            
            <div class="status" id="status"></div>
            
            <div id="download" style="display: none; text-align: center; margin: 30px 0;">
                <div style="background: #d4edda; border: 2px solid #c3e6cb; border-radius: 15px; padding: 30px; margin-top: 20px;">
                    <h3 style="color: #155724; margin-bottom: 20px; font-size: 24px;">🎉 Test Card Generated!</h3>
                    <p style="color: #155724; margin-bottom: 25px; font-size: 16px;">Your test 3D card is ready for download and preview:</p>
                    
                    <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                        <button id="previewTestBtn" class="button" style="background: linear-gradient(135deg, #219EBC 0%, #023047 100%); min-width: 200px;">
                            🎴 View in 3D
                        </button>
                        <button id="dlBtn" class="button" style="background: linear-gradient(135deg, #FFB703 0%, #FB8500 100%); min-width: 200px;">
                            📥 Download GLB
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

        let currentTestSession = null;
        let currentDownloadUrl = null;
        
        function init() {
            // Generate front canvas
            const frontCanvas = document.getElementById("front");
            const frontCtx = frontCanvas.getContext("2d");
            frontCtx.fillStyle = "#4A90E2";
            frontCtx.fillRect(0, 0, 400, 250);
            frontCtx.fillStyle = "#fff";
            frontCtx.font = "bold 28px Arial";
            frontCtx.textAlign = "center";
            frontCtx.fillText("SAMPLE CARD", 200, 100);
            frontCtx.font = "20px Arial";
            frontCtx.fillText("Front Side", 200, 140);
            frontCtx.font = "14px Arial";
            frontCtx.fillText("Test Image - CR80 Standard", 200, 170);
            
            // Generate back canvas
            const backCanvas = document.getElementById("back");
            const backCtx = backCanvas.getContext("2d");
            backCtx.fillStyle = "#2ECC71";
            backCtx.fillRect(0, 0, 400, 250);
            backCtx.fillStyle = "#fff";
            backCtx.font = "bold 28px Arial";
            backCtx.textAlign = "center";
            backCtx.fillText("SAMPLE CARD", 200, 100);
            backCtx.font = "20px Arial";
            backCtx.fillText("Back Side", 200, 140);
            backCtx.font = "14px Arial";
            backCtx.fillText("Test Image - CR80 Standard", 200, 170);
        }
        
        async function test() {
            const status = document.getElementById("status");
            const testBtn = document.getElementById("testBtn");
            
            try {
                // Disable button and show processing
                testBtn.disabled = true;
                testBtn.textContent = "🔄 Processing...";
                status.textContent = "Generating test images and processing...";
                status.className = "status info";
                status.style.display = "block";
                
                // Get canvas elements
                const frontCanvas = document.getElementById("front");
                const backCanvas = document.getElementById("back");
                
                // Convert to blobs
                const frontBlob = await new Promise(resolve => frontCanvas.toBlob(resolve, "image/png"));
                const backBlob = await new Promise(resolve => backCanvas.toBlob(resolve, "image/png"));
                
                // Create form data
                const formData = new FormData();
                formData.append("frontImage", new File([frontBlob], "test-F.png"));
                formData.append("backImage", new File([backBlob], "test-R.png"));
                
                // Upload files
                status.textContent = "Uploading test images...";
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
                
                // Start processing
                status.textContent = "Generating 3D model...";
                const processResponse = await fetch(\`/api/process?sessionId=\${currentTestSession}\`, {
                    method: "POST"
                });
                
                if (!processResponse.ok) {
                    const error = await processResponse.json();
                    throw new Error(error.error || 'Processing failed');
                }
                
                // Poll for completion
                await pollTestStatus();
                
            } catch (error) {
                status.textContent = "Error: " + error.message;
                status.className = "status error";
                testBtn.disabled = false;
                testBtn.textContent = "🚀 Generate 3D Test Card";
            }
        }
        
        async function pollTestStatus() {
            const status = document.getElementById("status");
            const maxAttempts = 30;
            let attempts = 0;
            
            const poll = async () => {
                if (attempts >= maxAttempts) {
                    throw new Error('Processing timeout');
                }
                
                const response = await fetch(\`/api/status?sessionId=\${currentTestSession}\`);
                const result = await response.json();
                
                if (result.status === 'completed') {
                    status.textContent = "Test card generated successfully!";
                    status.className = "status success";
                    
                    // Store download URL
                    currentDownloadUrl = result.downloadUrl || '/api/download?sessionId=' + currentTestSession;
                    
                    // Show download section
                    document.getElementById("download").style.display = "block";
                    
                    // Set up buttons
                    document.getElementById("dlBtn").onclick = () => {
                        const link = document.createElement('a');
                        link.href = currentDownloadUrl;
                        link.download = 'test-card.glb';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };
                    
                    document.getElementById("previewTestBtn").onclick = () => {
                        const previewUrl = '/preview?session=' + encodeURIComponent(currentTestSession);
                        window.open(previewUrl, '_blank');
                    };
                    
                    // Reset button
                    const testBtn = document.getElementById("testBtn");
                    testBtn.disabled = false;
                    testBtn.textContent = "🚀 Generate 3D Test Card";
                    
                } else if (result.status === 'error') {
                    throw new Error(result.error || 'Processing failed');
                } else {
                    // Still processing
                    status.textContent = "Generating 3D model... (" + Math.round((attempts / maxAttempts) * 100) + "%)";
                    attempts++;
                    setTimeout(poll, 2000);
                }
            };
            
            await poll();
        }
        
        // Initialize when page loads
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