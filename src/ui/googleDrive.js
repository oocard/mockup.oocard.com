/**
 * Google Drive Integration UI
 * Provides interface for connecting to Google Drive and batch processing folders
 */

export function serveGoogleDriveUI() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Drive Batch Processor - OOCard</title>
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
            max-width: 1000px;
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
        
        /* Navigation Tabs */
        .mui-tabs {
            background: white;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .mui-tab-list {
            display: flex;
            padding: 0 40px;
        }
        
        .mui-tab {
            background: none;
            border: none;
            padding: 16px 24px;
            font-size: 14px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: rgba(2,48,71,0.6);
            border-bottom: 2px solid transparent;
            cursor: pointer;
            transition: all 0.3s;
            min-width: 90px;
            text-decoration: none;
            display: inline-block;
        }
        
        .mui-tab:hover {
            background-color: rgba(33, 158, 188, 0.06) !important;
            color: #219EBC !important;
        }
        
        .mui-tab-active {
            color: #219EBC !important;
            border-bottom-color: #219EBC !important;
        }
        
        .content-section {
            padding: 48px;
        }
        
        .auth-section {
            text-align: center;
            padding: 60px 20px;
        }
        
        .auth-section h2 {
            color: #023047;
            margin-bottom: 16px;
            font-size: 24px;
        }
        
        .auth-section p {
            color: #666;
            margin-bottom: 32px;
            font-size: 16px;
        }
        
        .auth-button {
            background: linear-gradient(135deg, #FFB703 0%, #FB8500 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(251, 133, 0, 0.2);
        }
        
        .auth-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(251, 133, 0, 0.3);
        }
        
        .auth-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .user-info {
            background: rgba(142, 202, 230, 0.08);
            border: 1px solid rgba(33, 158, 188, 0.2);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .user-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #219EBC;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: 600;
        }
        
        .user-details h3 {
            color: #023047;
            margin-bottom: 4px;
        }
        
        .user-details p {
            color: #666;
            font-size: 14px;
        }
        
        .folder-section {
            display: none;
        }
        
        .folder-section.active {
            display: block;
        }
        
        .folder-list {
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 24px;
        }
        
        .folder-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .folder-item:last-child {
            border-bottom: none;
        }
        
        .folder-item:hover {
            background: rgba(142, 202, 230, 0.04);
        }
        
        .folder-item.selected {
            background: rgba(142, 202, 230, 0.1);
            border-left: 4px solid #219EBC;
        }
        
        .folder-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .folder-icon {
            width: 24px;
            height: 24px;
            color: #219EBC;
        }
        
        .folder-actions {
            display: flex;
            gap: 8px;
        }
        
        .scan-button, .process-button {
            background: #219EBC;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .scan-button:hover, .process-button:hover {
            background: #023047;
        }
        
        .process-button {
            background: linear-gradient(135deg, #FFB703 0%, #FB8500 100%);
        }
        
        .process-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .scan-results {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            margin-top: 16px;
            display: none;
        }
        
        .scan-results.active {
            display: block;
        }
        
        .scan-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .stat-item {
            text-align: center;
            padding: 16px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #219EBC;
            margin-bottom: 4px;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            font-weight: 500;
        }
        
        .batch-progress {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-top: 24px;
            display: none;
            border: 1px solid #e0e0e0;
        }
        
        .batch-progress.active {
            display: block;
        }
        
        .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 16px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #FFB703 0%, #FB8500 100%);
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .progress-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
        }
        
        .progress-stat {
            text-align: center;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        
        .results-section {
            margin-top: 24px;
            display: none;
        }
        
        .results-section.active {
            display: block;
        }
        
        .result-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 8px;
        }
        
        .result-success {
            border-color: #28a745;
            background: rgba(40, 167, 69, 0.05);
        }
        
        .result-error {
            border-color: #dc3545;
            background: rgba(220, 53, 69, 0.05);
        }
        
        .result-actions {
            display: flex;
            gap: 8px;
        }
        
        .download-btn, .preview-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        
        .download-btn {
            background: #28a745;
            color: white;
        }
        
        .preview-btn {
            background: #219EBC;
            color: white;
        }
        
        .hidden {
            display: none !important;
        }
        
        @media (max-width: 768px) {
            .content-section {
                padding: 24px;
            }
            
            .scan-stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .progress-stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📂 Google Drive Batch Processor</h1>
        <p>Connect to Google Drive and batch process entire folders of card images</p>
    </div>
    
    <div class="container">
        <!-- Navigation Tabs -->
        <div class="mui-tabs">
            <div class="mui-tab-list">
                <a href="/" class="mui-tab">Upload</a>
                <a href="/preview" class="mui-tab">Preview</a>
                <a href="/test" class="mui-tab">Test</a>
                <button class="mui-tab mui-tab-active">Drive</button>
            </div>
        </div>
        
        <div class="content-section">
            <!-- Authentication Section -->
            <div class="auth-section" id="authSection">
                <h2>Connect to Google Drive</h2>
                <p>Sign in with your Google account to access your Drive folders and batch process card images.</p>
                <button class="auth-button" id="connectBtn" onclick="connectToGoogle()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google Drive
                </button>
            </div>
            
            <!-- User Info & Folder Selection -->
            <div class="folder-section" id="folderSection">
                <div class="user-info" id="userInfo">
                    <div class="user-avatar" id="userAvatar"></div>
                    <div class="user-details">
                        <h3 id="userName"></h3>
                        <p id="userEmail"></p>
                    </div>
                    <button class="auth-button" onclick="disconnectGoogle()" style="margin-left: auto; font-size: 14px; padding: 8px 16px;">
                        Disconnect
                    </button>
                </div>
                
                <h2 style="margin-bottom: 16px; color: #023047;">Select Folder to Process</h2>
                <p style="margin-bottom: 24px; color: #666;">Choose a Google Drive folder containing card images with -F.png (front) and -R.png (back) naming convention.</p>
                
                <div class="folder-list" id="folderList">
                    <div style="padding: 40px; text-align: center; color: #666;">
                        <div style="margin-bottom: 16px;">📁</div>
                        <p>Loading your Google Drive folders...</p>
                    </div>
                </div>
                
                <!-- Scan Results -->
                <div class="scan-results" id="scanResults">
                    <h3 style="margin-bottom: 16px; color: #023047;">Folder Scan Results</h3>
                    <div class="scan-stats" id="scanStats"></div>
                    <div id="scanDetails"></div>
                </div>
                
                <!-- Batch Progress -->
                <div class="batch-progress" id="batchProgress">
                    <div class="progress-header">
                        <h3 style="color: #023047;">Processing Cards...</h3>
                        <span id="progressPercent">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-stats" id="progressStats"></div>
                </div>
                
                <!-- Results -->
                <div class="results-section" id="resultsSection">
                    <h3 style="margin-bottom: 16px; color: #023047;">Processing Results</h3>
                    <div id="resultsList"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentSession = null;
        let selectedFolder = null;
        let scanData = null;
        let batchId = null;
        
        // Initialize page
        window.addEventListener('load', () => {
            checkAuthStatus();
        });
        
        // Handle auth popup messages
        window.addEventListener('message', (event) => {
            if (event.data.type === 'google_auth_success') {
                currentSession = event.data.sessionId;
                showUserInfo(event.data.userInfo);
                loadFolders();
            } else if (event.data.type === 'google_auth_error') {
                console.error('Auth error:', event.data.error);
                alert('Authentication failed: ' + event.data.error);
            }
        });
        
        async function checkAuthStatus() {
            const sessionId = localStorage.getItem('googleSessionId');
            if (!sessionId) return;
            
            try {
                const response = await fetch('/api/google-auth?action=status&sessionId=' + sessionId);
                const data = await response.json();
                
                if (data.authenticated) {
                    currentSession = sessionId;
                    showUserInfo(data.userInfo);
                    loadFolders();
                } else {
                    localStorage.removeItem('googleSessionId');
                }
            } catch (error) {
                console.error('Auth status check failed:', error);
                localStorage.removeItem('googleSessionId');
            }
        }
        
        async function connectToGoogle() {
            const connectBtn = document.getElementById('connectBtn');
            connectBtn.disabled = true;
            connectBtn.textContent = 'Connecting...';
            
            try {
                const response = await fetch('/api/google-auth?action=login');
                const data = await response.json();
                
                // Open popup window for auth
                const popup = window.open(data.authUrl, 'googleAuth', 'width=500,height=600,scrollbars=yes,resizable=yes');
                
                // Reset button after popup closes or auth completes
                const checkClosed = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(checkClosed);
                        connectBtn.disabled = false;
                        connectBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Sign in with Google Drive';
                    }
                }, 1000);
                
            } catch (error) {
                console.error('Connect error:', error);
                alert('Failed to connect to Google Drive');
                connectBtn.disabled = false;
                connectBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Sign in with Google Drive';
            }
        }
        
        function showUserInfo(userInfo) {
            localStorage.setItem('googleSessionId', currentSession);
            
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('folderSection').classList.add('active');
            
            const avatar = document.getElementById('userAvatar');
            const name = document.getElementById('userName');
            const email = document.getElementById('userEmail');
            
            avatar.textContent = userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?';
            name.textContent = userInfo.name || 'Unknown';
            email.textContent = userInfo.email || '';
        }
        
        async function loadFolders() {
            try {
                const response = await fetch('/api/google-drive?action=list-folders&sessionId=' + currentSession);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load folders');
                }
                
                displayFolders(data.folders);
            } catch (error) {
                console.error('Load folders error:', error);
                document.getElementById('folderList').innerHTML = 
                    '<div style="padding: 40px; text-align: center; color: #dc3545;"><p>Failed to load folders: ' + error.message + '</p></div>';
            }
        }
        
        function displayFolders(folders) {
            const folderList = document.getElementById('folderList');
            
            if (folders.length === 0) {
                folderList.innerHTML = 
                    '<div style="padding: 40px; text-align: center; color: #666;"><p>No folders found in your Google Drive.</p></div>';
                return;
            }
            
            folderList.innerHTML = folders.map(folder => 
                '<div class="folder-item" onclick="selectFolder(\'' + folder.id + '\', \'' + folder.name + '\')">' +
                    '<div class="folder-info">' +
                        '<svg class="folder-icon" fill="currentColor" viewBox="0 0 24 24">' +
                            '<path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>' +
                        '</svg>' +
                        '<div>' +
                            '<div style="font-weight: 500; color: #023047;">' + folder.name + '</div>' +
                            '<div style="font-size: 12px; color: #666;">Modified: ' + new Date(folder.modifiedTime).toLocaleDateString() + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="folder-actions">' +
                        '<button class="scan-button" onclick="event.stopPropagation(); scanFolder(\'' + folder.id + '\', \'' + folder.name + '\')">Scan</button>' +
                    '</div>' +
                '</div>'
            ).join('');
        }
        
        function selectFolder(folderId, folderName) {
            // Clear previous selection
            document.querySelectorAll('.folder-item').forEach(item => item.classList.remove('selected'));
            
            // Select current folder
            event.currentTarget.classList.add('selected');
            selectedFolder = { id: folderId, name: folderName };
        }
        
        async function scanFolder(folderId, folderName) {
            const scanResults = document.getElementById('scanResults');
            scanResults.classList.add('active');
            
            const scanStats = document.getElementById('scanStats');
            scanStats.innerHTML = '<div style="text-align: center; padding: 20px;">Scanning folder...</div>';
            
            try {
                const response = await fetch('/api/google-drive?action=scan-folder&sessionId=' + currentSession + '&folderId=' + folderId);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Scan failed');
                }
                
                scanData = data;
                displayScanResults(data, folderName);
                
            } catch (error) {
                console.error('Scan error:', error);
                scanStats.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Scan failed: ' + error.message + '</div>';
            }
        }
        
        function displayScanResults(data, folderName) {
            const scanStats = document.getElementById('scanStats');
            const scanDetails = document.getElementById('scanDetails');
            
            scanStats.innerHTML = 
                '<div class="stat-item">' +
                    '<div class="stat-value">' + data.totalFiles + '</div>' +
                    '<div class="stat-label">Total Files</div>' +
                '</div>' +
                '<div class="stat-item">' +
                    '<div class="stat-value">' + data.validPairs + '</div>' +
                    '<div class="stat-label">Valid Pairs</div>' +
                '</div>' +
                '<div class="stat-item">' +
                    '<div class="stat-value">' + data.unpairedFiles.length + '</div>' +
                    '<div class="stat-label">Unpaired Files</div>' +
                '</div>' +
                '<div class="stat-item">' +
                    '<div class="stat-value">' + data.errors.length + '</div>' +
                    '<div class="stat-label">Errors</div>' +
                '</div>';
            
            let detailsHtml = '';
            
            if (data.validPairs > 0) {
                detailsHtml += '<h4 style="margin: 16px 0 8px 0; color: #28a745;">✅ Ready to Process (' + data.validPairs + ' pairs)</h4>';
                detailsHtml += '<div style="margin-bottom: 16px;">';
                data.cardPairs.slice(0, 5).forEach(pair => {
                    detailsHtml += '<div style="font-size: 14px; padding: 4px 0;">• ' + pair.baseName + '</div>';
                });
                if (data.cardPairs.length > 5) {
                    detailsHtml += '<div style="font-size: 14px; color: #666; padding: 4px 0;">... and ' + (data.cardPairs.length - 5) + ' more</div>';
                }
                detailsHtml += '</div>';
                
                detailsHtml += '<button class="process-button" onclick="processFolderBatch(\'' + selectedFolder.id + '\', \'' + folderName + '\')">' +
                              '🚀 Process All Cards (' + data.validPairs + ')' +
                              '</button>';
            }
            
            if (data.errors.length > 0) {
                detailsHtml += '<h4 style="margin: 16px 0 8px 0; color: #dc3545;">❌ Issues Found</h4>';
                data.errors.forEach(error => {
                    detailsHtml += '<div style="font-size: 14px; color: #dc3545; padding: 2px 0;">• ' + error + '</div>';
                });
            }
            
            scanDetails.innerHTML = detailsHtml;
        }
        
        async function processFolderBatch(folderId, folderName) {
            const batchProgress = document.getElementById('batchProgress');
            batchProgress.classList.add('active');
            
            try {
                const response = await fetch('/api/google-drive?action=process-folder&sessionId=' + currentSession + '&folderId=' + folderId);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to start processing');
                }
                
                batchId = data.batchId;
                pollBatchProgress();
                
            } catch (error) {
                console.error('Process error:', error);
                alert('Failed to start processing: ' + error.message);
            }
        }
        
        async function pollBatchProgress() {
            if (!batchId) return;
            
            try {
                const response = await fetch('/api/google-drive?action=batch-status&batchId=' + batchId);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to get status');
                }
                
                updateProgressDisplay(data);
                
                if (data.status === 'processing') {
                    setTimeout(pollBatchProgress, 2000); // Poll every 2 seconds
                } else if (data.status === 'completed' || data.status === 'failed') {
                    showResults(data);
                }
                
            } catch (error) {
                console.error('Progress poll error:', error);
                setTimeout(pollBatchProgress, 5000); // Retry after 5 seconds
            }
        }
        
        function updateProgressDisplay(data) {
            const progressPercent = document.getElementById('progressPercent');
            const progressFill = document.getElementById('progressFill');
            const progressStats = document.getElementById('progressStats');
            
            progressPercent.textContent = data.progress + '%';
            progressFill.style.width = data.progress + '%';
            
            progressStats.innerHTML = 
                '<div class="progress-stat">' +
                    '<div style="font-weight: 600;">' + data.processed + '</div>' +
                    '<div style="font-size: 12px; color: #666;">Processed</div>' +
                '</div>' +
                '<div class="progress-stat">' +
                    '<div style="font-weight: 600; color: #28a745;">' + data.successful + '</div>' +
                    '<div style="font-size: 12px; color: #666;">Successful</div>' +
                '</div>' +
                '<div class="progress-stat">' +
                    '<div style="font-weight: 600; color: #dc3545;">' + data.failed + '</div>' +
                    '<div style="font-size: 12px; color: #666;">Failed</div>' +
                '</div>' +
                '<div class="progress-stat">' +
                    '<div style="font-weight: 600;">' + (data.totalPairs - data.processed) + '</div>' +
                    '<div style="font-size: 12px; color: #666;">Remaining</div>' +
                '</div>';
        }
        
        function showResults(data) {
            const resultsSection = document.getElementById('resultsSection');
            const resultsList = document.getElementById('resultsList');
            
            resultsSection.classList.add('active');
            
            let resultsHtml = '';
            
            // Successful results
            data.results.forEach(result => {
                resultsHtml += 
                    '<div class="result-item result-success">' +
                        '<div>' +
                            '<div style="font-weight: 500;">' + result.baseName + '</div>' +
                            '<div style="font-size: 12px; color: #666;">✅ Processing completed successfully</div>' +
                        '</div>' +
                        '<div class="result-actions">' +
                            '<a href="/preview?session=' + result.sessionId + '" target="_blank" class="preview-btn">👁️ Preview</a>' +
                            '<a href="' + result.downloadUrl + '" class="download-btn">📥 Download</a>' +
                        '</div>' +
                    '</div>';
            });
            
            // Error results
            data.errors.forEach(error => {
                if (error.baseName) {
                    resultsHtml += 
                        '<div class="result-item result-error">' +
                            '<div>' +
                                '<div style="font-weight: 500;">' + error.baseName + '</div>' +
                                '<div style="font-size: 12px; color: #dc3545;">❌ ' + error.error + '</div>' +
                            '</div>' +
                        '</div>';
                }
            });
            
            resultsList.innerHTML = resultsHtml;
        }
        
        async function disconnectGoogle() {
            if (confirm('Are you sure you want to disconnect from Google Drive?')) {
                try {
                    await fetch('/api/google-auth?action=logout&sessionId=' + currentSession);
                } catch (error) {
                    console.error('Logout error:', error);
                }
                
                localStorage.removeItem('googleSessionId');
                currentSession = null;
                selectedFolder = null;
                scanData = null;
                batchId = null;
                
                document.getElementById('authSection').classList.remove('hidden');
                document.getElementById('folderSection').classList.remove('active');
                document.getElementById('scanResults').classList.remove('active');
                document.getElementById('batchProgress').classList.remove('active');
                document.getElementById('resultsSection').classList.remove('active');
            }
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