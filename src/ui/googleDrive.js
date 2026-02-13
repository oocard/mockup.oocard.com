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
    <title>Google Drive - 3D Card Generator</title>
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
                <a href="/test" class="text-sm text-ocean-950/60 hover:text-ocean-800">Test</a>
                <a href="/drive" class="text-sm font-medium text-ocean-800">Drive</a>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div class="mb-8">
            <h1 class="text-2xl font-semibold tracking-tight text-ocean-950 sm:text-3xl">Google Drive Batch Processor</h1>
            <p class="mt-2 text-ocean-950/70">Connect to Google Drive and batch process entire folders of card images</p>
        </div>

        <!-- Authentication Section -->
        <div id="authSection" class="rounded-lg border border-ocean-300 bg-white p-8 text-center shadow-sm">
            <svg class="mx-auto mb-4 size-16 text-ocean-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <h2 class="mb-2 text-xl font-semibold text-ocean-950">Connect to Google Drive</h2>
            <p class="mb-6 text-ocean-950/70">Sign in with your Google account to access your Drive folders and batch process card images.</p>
            <button 
                id="connectBtn"
                onclick="connectToGoogle()"
                class="inline-flex items-center gap-2 rounded-md bg-ocean-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-ocean-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
            </button>
        </div>

        <!-- Folder Section (hidden by default) -->
        <div id="folderSection" class="hidden space-y-6">
            <!-- User Info -->
            <div class="flex items-center justify-between rounded-lg border border-ocean-300 bg-white p-4 shadow-sm">
                <div class="flex items-center gap-3">
                    <div id="userAvatar" class="flex size-10 items-center justify-center rounded-full bg-ocean-800 text-sm font-semibold text-white"></div>
                    <div>
                        <p id="userName" class="font-medium text-ocean-950"></p>
                        <p id="userEmail" class="text-sm text-ocean-950/60"></p>
                    </div>
                </div>
                <button 
                    onclick="disconnectGoogle()"
                    class="rounded-md border border-ocean-300 bg-white px-3 py-1.5 text-sm font-medium text-ocean-950 hover:bg-ocean-100"
                >
                    Disconnect
                </button>
            </div>

            <!-- Folder Selection -->
            <div class="rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                <div class="mb-2 flex items-center justify-between">
                    <h2 class="text-sm font-medium text-ocean-950">Select Folder to Process</h2>
                    <div class="flex items-center gap-2">
                        <button 
                            onclick="expandAll()"
                            class="inline-flex items-center gap-1 rounded-md border border-ocean-300 bg-white px-2 py-1 text-xs font-medium text-ocean-950 hover:bg-ocean-100"
                            title="Expand All"
                        >
                            <svg class="size-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                            </svg>
                            Expand
                        </button>
                        <button 
                            onclick="collapseAll()"
                            class="inline-flex items-center gap-1 rounded-md border border-ocean-300 bg-white px-2 py-1 text-xs font-medium text-ocean-950 hover:bg-ocean-100"
                            title="Collapse All"
                        >
                            <svg class="size-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                            </svg>
                            Collapse
                        </button>
                        <button 
                            id="refreshBtn"
                            onclick="refreshFolders()"
                            class="inline-flex items-center gap-1.5 rounded-md border border-ocean-300 bg-white px-2.5 py-1.5 text-xs font-medium text-ocean-950 hover:bg-ocean-100"
                        >
                            <svg id="refreshIcon" class="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>
                <p class="mb-4 text-sm text-ocean-950/70">Choose a Google Drive folder containing card images with <code class="rounded bg-ocean-100 px-1 py-0.5 text-xs text-ocean-800">-F.png</code> or <code class="rounded bg-ocean-100 px-1 py-0.5 text-xs text-ocean-800">_F.png</code> (front) and <code class="rounded bg-ocean-100 px-1 py-0.5 text-xs text-ocean-800">-R.png</code> or <code class="rounded bg-ocean-100 px-1 py-0.5 text-xs text-ocean-800">_R.png</code> (back) naming.</p>
                
                <!-- Search Box -->
                <div class="mb-4">
                    <div class="relative">
                        <svg class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ocean-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
                        </svg>
                        <input 
                            type="text" 
                            id="folderSearch" 
                            placeholder="Search folders by name or path..."
                            class="w-full rounded-md border border-ocean-300 py-2 pl-10 pr-4 text-sm placeholder:text-ocean-950/40 focus:border-ocean-800 focus:outline-none focus:ring-1 focus:ring-ocean-800"
                        >
                    </div>
                </div>

                <!-- Breadcrumb / Current Path -->
                <div id="folderBreadcrumb" class="mb-4 hidden">
                    <nav class="flex items-center gap-1 text-sm">
                        <button onclick="navigateToRoot()" class="text-ocean-950/60 hover:text-ocean-800">My Drive</button>
                    </nav>
                </div>
                
                <div id="folderList" class="max-h-96 divide-y divide-ocean-100 overflow-y-auto rounded-md border border-ocean-300">
                    <div class="p-8 text-center text-ocean-950/60">
                        <svg class="mx-auto mb-2 size-8 text-ocean-300" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                        </svg>
                        Loading your Google Drive folders...
                    </div>
                </div>
                
                <p id="folderCount" class="mt-2 text-xs text-ocean-950/60"></p>
            </div>

            <!-- Scan Results -->
            <div id="scanResults" class="hidden rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                <h3 class="mb-4 text-sm font-medium text-ocean-950">Folder Scan Results</h3>
                <div id="scanStats" class="mb-4 grid grid-cols-4 gap-4"></div>
                <div id="scanDetails"></div>
            </div>

            <!-- Batch Progress -->
            <div id="batchProgress" class="hidden rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                <div class="mb-4 flex items-center justify-between">
                    <h3 class="text-sm font-medium text-ocean-950">Processing Cards...</h3>
                    <div class="flex items-center gap-3">
                        <span id="progressPercent" class="tabular-nums text-sm text-ocean-950/70">0%</span>
                        <button 
                            id="abortBtn"
                            onclick="abortBatch()"
                            class="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-400"
                        >
                            <svg class="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                            Abort
                        </button>
                    </div>
                </div>
                <div class="mb-4 h-2 w-full overflow-hidden rounded-full bg-ocean-100">
                    <div id="progressFill" class="h-full rounded-full bg-ocean-800 transition-[width] duration-150" style="width: 0%"></div>
                </div>
                <div id="progressStats" class="mb-4 grid grid-cols-4 gap-4 text-center text-sm"></div>
                
                <!-- Logs Section -->
                <div class="border-t border-ocean-200 pt-4">
                    <button onclick="toggleLogs()" class="mb-2 flex w-full items-center justify-between text-left">
                        <span class="text-xs font-medium text-ocean-950/70">Processing Logs</span>
                        <svg id="logsToggleIcon" class="size-4 text-ocean-600 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <div id="logsContainer" class="hidden max-h-48 overflow-y-auto rounded-md border border-ocean-200 bg-ocean-50 p-2 font-mono text-xs text-ocean-950/80">
                        <div id="logsList"></div>
                    </div>
                </div>
            </div>

            <!-- Results -->
            <div id="resultsSection" class="hidden rounded-lg border border-ocean-300 bg-white p-6 shadow-sm">
                <h3 class="mb-4 text-sm font-medium text-ocean-950">Processing Results</h3>
                <div id="resultsList" class="space-y-2"></div>
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
        let currentSession = null;
        let selectedFolder = null;
        let scanData = null;
        let batchId = null;
        let allFolders = [];
        let folderPaths = new Map();
        let currentFolderId = 'root';
        
        window.addEventListener('load', () => {
            checkAuthStatus();
            setupSearch();
        });
        
        function setupSearch() {
            const searchInput = document.getElementById('folderSearch');
            let debounceTimer;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    filterFolders(e.target.value.toLowerCase());
                }, 300);
            });
        }
        
        function filterFolders(query) {
            if (!allFolders.length) return;
            
            const filtered = query 
                ? allFolders.filter(f => {
                    const name = f.name.toLowerCase();
                    const path = (f.path || '').toLowerCase();
                    return name.includes(query) || path.includes(query);
                })
                : allFolders;
            
            displayFolders(filtered);
            
            const countEl = document.getElementById('folderCount');
            if (query) {
                countEl.textContent = \`Showing \${filtered.length} of \${allFolders.length} folders\`;
            } else {
                countEl.textContent = \`\${allFolders.length} folders found\`;
            }
        }
        
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
                
                const popup = window.open(data.authUrl, 'googleAuth', 'width=500,height=600,scrollbars=yes,resizable=yes');
                
                const checkClosed = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(checkClosed);
                        connectBtn.disabled = false;
                        connectBtn.innerHTML = '<svg class="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Sign in with Google';
                    }
                }, 1000);
                
            } catch (error) {
                console.error('Connect error:', error);
                alert('Failed to connect to Google Drive');
                connectBtn.disabled = false;
                connectBtn.innerHTML = '<svg class="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Sign in with Google';
            }
        }
        
        function showUserInfo(userInfo) {
            localStorage.setItem('googleSessionId', currentSession);
            
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('folderSection').classList.remove('hidden');
            
            document.getElementById('userAvatar').textContent = userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?';
            document.getElementById('userName').textContent = userInfo.name || 'Unknown';
            document.getElementById('userEmail').textContent = userInfo.email || '';
        }
        
        async function loadFolders() {
            try {
                document.getElementById('folderList').innerHTML = '<div class="p-8 text-center text-ocean-950/60"><svg class="mx-auto mb-2 size-6 animate-spin text-ocean-600" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Loading folders...</div>';
                
                // Add timestamp to prevent caching
                const timestamp = Date.now();
                const response = await fetch('/api/google-drive?action=list-folders&sessionId=' + currentSession + '&_t=' + timestamp, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load folders');
                }
                
                allFolders = data.folders || [];
                await buildFolderPaths(allFolders);
                
                displayFolders(allFolders);
                
                const totalCount = data.totalCount || allFolders.length;
                document.getElementById('folderCount').textContent = \`\${totalCount} folders found\`;
                document.getElementById('folderSearch').value = '';
                
            } catch (error) {
                console.error('Load folders error:', error);
                document.getElementById('folderList').innerHTML = 
                    '<div class="p-8 text-center text-red-600">Failed to load folders: ' + error.message + '</div>';
            }
        }
        
        async function refreshFolders() {
            const refreshBtn = document.getElementById('refreshBtn');
            const refreshIcon = document.getElementById('refreshIcon');
            const folderCount = document.getElementById('folderCount');
            
            refreshBtn.disabled = true;
            refreshIcon.classList.add('animate-spin');
            folderCount.textContent = 'Refreshing...';
            
            try {
                await loadFolders();
            } catch (error) {
                console.error('Refresh error:', error);
                folderCount.textContent = 'Refresh failed';
            } finally {
                refreshBtn.disabled = false;
                refreshIcon.classList.remove('animate-spin');
            }
        }
        
        async function buildFolderPaths(folders) {
            // Paths are now built server-side, just ensure depth is set
            for (const folder of folders) {
                if (!folder.path) {
                    folder.path = folder.name;
                }
                if (folder.depth === undefined) {
                    folder.depth = (folder.path.match(/ \/ /g) || []).length;
                }
            }
        }
        
        // Track collapsed state for tree nodes
        let collapsedPaths = new Set();
        
        function displayFolders(folders) {
            const folderList = document.getElementById('folderList');
            
            if (folders.length === 0) {
                folderList.innerHTML = '<div class="p-8 text-center text-ocean-950/60">No folders found.</div>';
                return;
            }
            
            // Sort by path for hierarchical display
            folders.sort((a, b) => (a.path || a.name).localeCompare(b.path || b.name));
            
            // Build parent-child relationships
            const foldersByPath = new Map();
            folders.forEach(f => foldersByPath.set(f.path, f));
            
            // Determine which folders have children
            const hasChildren = new Set();
            folders.forEach(f => {
                const pathParts = (f.path || f.name).split(' / ');
                for (let i = 1; i < pathParts.length; i++) {
                    const parentPath = pathParts.slice(0, i).join(' / ');
                    hasChildren.add(parentPath);
                }
            });
            
            folderList.innerHTML = folders.map(folder => {
                const depth = folder.depth || 0;
                const indent = Math.min(depth, 8) * 20; // Max 8 levels of indent, 20px each
                const path = folder.path || folder.name;
                const hasSubs = hasChildren.has(path);
                const isCollapsed = collapsedPaths.has(path);
                
                // Check if this folder should be hidden due to collapsed parent
                const pathParts = path.split(' / ');
                let isHidden = false;
                for (let i = 1; i < pathParts.length; i++) {
                    const parentPath = pathParts.slice(0, i).join(' / ');
                    if (collapsedPaths.has(parentPath)) {
                        isHidden = true;
                        break;
                    }
                }
                
                return \`
                <div class="folder-row flex items-center justify-between p-2 hover:bg-ocean-100/50 cursor-pointer group border-l-2 border-transparent hover:border-ocean-600 \${isHidden ? 'hidden' : ''}" 
                     style="padding-left: \${8 + indent}px" 
                     data-path="\${escapeHtml(path)}"
                     data-depth="\${depth}"
                     onclick="selectFolder('\${folder.id}', '\${escapeHtml(folder.name)}')">
                    <div class="flex items-center gap-1 min-w-0 flex-1">
                        \${hasSubs ? \`
                        <button onclick="event.stopPropagation(); toggleFolder('\${escapeHtml(path)}')" class="p-0.5 hover:bg-ocean-200 rounded shrink-0">
                            <svg class="size-3.5 text-ocean-600 transition-transform \${isCollapsed ? '' : 'rotate-90'}" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        \` : '<span class="w-5"></span>'}
                        <svg class="size-4 shrink-0 text-ocean-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                        </svg>
                        <div class="min-w-0 flex-1 ml-1">
                            <p class="truncate text-sm font-medium text-ocean-950">\${escapeHtml(folder.name)}</p>
                            <p class="truncate text-xs text-ocean-950/40 font-mono">\${escapeHtml(path)}</p>
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); scanFolder('\${folder.id}', '\${escapeHtml(folder.name)}')" class="shrink-0 rounded-md bg-ocean-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 hover:bg-ocean-950 transition-opacity">Scan</button>
                </div>
                \`;
            }).join('');
        }
        
        function toggleFolder(path) {
            if (collapsedPaths.has(path)) {
                collapsedPaths.delete(path);
            } else {
                collapsedPaths.add(path);
            }
            // Re-render with current filter
            const searchTerm = document.getElementById('folderSearch').value.toLowerCase();
            if (searchTerm) {
                filterFolders(searchTerm);
            } else {
                displayFolders(allFolders);
            }
        }
        
        function collapseAll() {
            allFolders.forEach(f => {
                if (f.depth === 0 || f.path.split(' / ').length === 1) {
                    // Don't collapse root level
                } else {
                    const pathParts = (f.path || f.name).split(' / ');
                    for (let i = 1; i < pathParts.length; i++) {
                        collapsedPaths.add(pathParts.slice(0, i).join(' / '));
                    }
                }
            });
            displayFolders(allFolders);
        }
        
        function expandAll() {
            collapsedPaths.clear();
            displayFolders(allFolders);
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML.replace(/'/g, "\\\\'").replace(/"/g, '\\\\"');
        }
        
        function selectFolder(folderId, folderName) {
            selectedFolder = { id: folderId, name: folderName };
            document.querySelectorAll('#folderList > div').forEach(el => {
                el.classList.remove('bg-ocean-100');
            });
            event.currentTarget.classList.add('bg-ocean-100');
        }
        
        async function scanFolder(folderId, folderName) {
            const scanResults = document.getElementById('scanResults');
            scanResults.classList.remove('hidden');
            
            const scanStats = document.getElementById('scanStats');
            scanStats.innerHTML = '<div class="col-span-4 text-center py-4 text-ocean-950/60">Scanning folder...</div>';
            
            try {
                const response = await fetch('/api/google-drive?action=scan-folder&sessionId=' + currentSession + '&folderId=' + folderId);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Scan failed');
                }
                
                scanData = data;
                selectedFolder = { id: folderId, name: folderName };
                displayScanResults(data, folderName);
                
            } catch (error) {
                console.error('Scan error:', error);
                scanStats.innerHTML = '<div class="col-span-4 text-center py-4 text-red-600">Scan failed: ' + error.message + '</div>';
            }
        }
        
        function displayScanResults(data, folderName) {
            const scanStats = document.getElementById('scanStats');
            const scanDetails = document.getElementById('scanDetails');
            
            scanStats.innerHTML = \`
                <div class="rounded-md bg-ocean-100 p-3 text-center">
                    <p class="text-2xl font-semibold text-ocean-950">\${data.totalFiles}</p>
                    <p class="text-xs text-ocean-950/60">PNG Files</p>
                </div>
                <div class="rounded-md bg-ocean-100 p-3 text-center">
                    <p class="text-2xl font-semibold text-green-700">\${data.validPairs}</p>
                    <p class="text-xs text-ocean-950/60">Card Pairs</p>
                </div>
                <div class="rounded-md bg-ocean-100 p-3 text-center">
                    <p class="text-2xl font-semibold text-amber-600">\${data.unpairedFiles ? data.unpairedFiles.length : 0}</p>
                    <p class="text-xs text-ocean-950/60">Unpaired</p>
                </div>
                <div class="rounded-md bg-ocean-100 p-3 text-center">
                    <p class="text-2xl font-semibold text-red-600">\${data.errors ? data.errors.length : 0}</p>
                    <p class="text-xs text-ocean-950/60">Issues</p>
                </div>
            \`;
            
            let detailsHtml = '';
            
            if (data.validPairs > 0) {
                detailsHtml += '<div class="mb-4"><p class="mb-2 text-sm font-medium text-green-700">Ready to process (' + data.validPairs + ' pairs)</p>';
                detailsHtml += '<ul class="space-y-1 text-sm text-ocean-950/70">';
                (data.cardPairs || []).slice(0, 5).forEach(pair => {
                    detailsHtml += '<li class="flex gap-2"><span class="text-ocean-600">•</span><span>' + escapeHtml(pair.baseName || 'Card') + '</span></li>';
                });
                if ((data.cardPairs || []).length > 5) {
                    detailsHtml += '<li class="text-ocean-950/50 pl-4">... and ' + (data.cardPairs.length - 5) + ' more</li>';
                }
                detailsHtml += '</ul></div>';
                
                detailsHtml += '<p class="mb-3 text-xs text-ocean-950/60"><svg class="inline-block size-3.5 mr-1 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>GLB files will be saved back to this folder</p>';
                
                detailsHtml += '<button onclick="processFolderBatch(\\'' + selectedFolder.id + '\\', \\'' + escapeHtml(folderName) + '\\')" class="rounded-md bg-ocean-800 px-4 py-2 text-sm font-medium text-white hover:bg-ocean-950">Process All Cards (' + data.validPairs + ')</button>';
            } else {
                detailsHtml += '<p class="text-sm text-ocean-950/60">No valid card pairs found. Make sure your folder contains PNG files with -F/_F and -R/_R naming.</p>';
            }
            
            if (data.errors && data.errors.length > 0) {
                detailsHtml += '<div class="mt-4 rounded-md bg-red-50 p-3"><p class="mb-2 text-sm font-medium text-red-700">Issues Found</p>';
                detailsHtml += '<ul class="space-y-1 text-sm text-red-600">';
                data.errors.slice(0, 5).forEach(error => {
                    detailsHtml += '<li>• ' + escapeHtml(error) + '</li>';
                });
                if (data.errors.length > 5) {
                    detailsHtml += '<li>... and ' + (data.errors.length - 5) + ' more issues</li>';
                }
                detailsHtml += '</ul></div>';
            }
            
            scanDetails.innerHTML = detailsHtml;
        }
        
        async function processFolderBatch(folderId, folderName) {
            const batchProgress = document.getElementById('batchProgress');
            batchProgress.classList.remove('hidden');
            
            // Reset abort button
            const abortBtn = document.getElementById('abortBtn');
            abortBtn.disabled = false;
            abortBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            abortBtn.innerHTML = '<svg class="size-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg> Abort';
            
            try {
                // Start the batch (creates batch record with card pairs)
                const response = await fetch('/api/google-drive?action=process-folder&sessionId=' + currentSession + '&folderId=' + folderId);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to start processing');
                }
                
                batchId = data.batchId;
                
                // Process cards one by one
                processNextCardInBatch();
                
            } catch (error) {
                console.error('Process error:', error);
                alert('Failed to start processing: ' + error.message);
            }
        }
        
        async function processNextCardInBatch() {
            if (!batchId) return;
            
            try {
                // Call process-next to process one card
                const response = await fetch('/api/google-drive?action=process-next&batchId=' + batchId);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to process card');
                }
                
                // Get full status for display
                const statusResponse = await fetch('/api/google-drive?action=batch-status&batchId=' + batchId);
                const statusData = await statusResponse.json();
                
                updateProgressDisplay(statusData);
                
                // Check if there are more cards to process
                if (data.hasMore && !statusData.aborted) {
                    // Small delay then process next card
                    setTimeout(processNextCardInBatch, 500);
                } else {
                    // All done or aborted
                    showResults(statusData);
                }
                
            } catch (error) {
                console.error('Process card error:', error);
                // Try to get status and show results
                try {
                    const statusResponse = await fetch('/api/google-drive?action=batch-status&batchId=' + batchId);
                    const statusData = await statusResponse.json();
                    updateProgressDisplay(statusData);
                    
                    if (statusData.processed < statusData.totalPairs && !statusData.aborted) {
                        // Retry after delay
                        setTimeout(processNextCardInBatch, 2000);
                    } else {
                        showResults(statusData);
                    }
                } catch (e) {
                    alert('Processing error: ' + error.message);
                }
            }
        }
        
        function updateProgressDisplay(data) {
            document.getElementById('progressPercent').textContent = data.progress + '%';
            document.getElementById('progressFill').style.width = data.progress + '%';
            
            // Update abort button state
            const abortBtn = document.getElementById('abortBtn');
            if (data.aborted || data.status === 'completed' || data.status === 'failed' || data.status === 'aborted') {
                abortBtn.disabled = true;
                abortBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            
            // Update logs
            if (data.logs && data.logs.length > 0) {
                const logsList = document.getElementById('logsList');
                logsList.innerHTML = data.logs.map(log => \`<div class="py-0.5 border-b border-ocean-200 last:border-0">\${escapeHtml(log)}</div>\`).join('');
                // Auto-scroll to bottom
                const logsContainer = document.getElementById('logsContainer');
                if (!logsContainer.classList.contains('hidden')) {
                    logsContainer.scrollTop = logsContainer.scrollHeight;
                }
            }
            
            document.getElementById('progressStats').innerHTML = \`
                <div><p class="font-semibold text-ocean-950">\${data.processed}</p><p class="text-xs text-ocean-950/60">Processed</p></div>
                <div><p class="font-semibold text-green-700">\${data.successful}</p><p class="text-xs text-ocean-950/60">Successful</p></div>
                <div><p class="font-semibold text-red-600">\${data.failed}</p><p class="text-xs text-ocean-950/60">Failed</p></div>
                <div><p class="font-semibold text-ocean-950">\${(data.totalPairs || 0) - (data.processed || 0)}</p><p class="text-xs text-ocean-950/60">Remaining</p></div>
            \`;
        }
        
        function showResults(data) {
            const resultsSection = document.getElementById('resultsSection');
            const resultsList = document.getElementById('resultsList');
            
            resultsSection.classList.remove('hidden');
            
            let resultsHtml = '';
            
            (data.results || []).forEach(result => {
                const driveStatus = result.driveFileId 
                    ? '<span class="ml-2 inline-flex items-center gap-1 text-xs text-green-700"><svg class="size-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>Saved to Drive</span>'
                    : '';
                resultsHtml += \`
                    <div class="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-3">
                        <div>
                            <p class="text-sm font-medium text-ocean-950">\${escapeHtml(result.baseName || 'Card')}\${result.driveFileName ? '.glb' : ''}</p>
                            <p class="text-xs text-green-700">Completed successfully\${driveStatus}</p>
                        </div>
                        <div class="flex gap-2">
                            <a href="/preview?session=\${result.sessionId}" target="_blank" class="rounded bg-ocean-800 px-2 py-1 text-xs font-medium text-white hover:bg-ocean-950">Preview</a>
                            <a href="\${result.downloadUrl}" class="rounded bg-ocean-100 px-2 py-1 text-xs font-medium text-ocean-950 hover:bg-ocean-300">Download</a>
                        </div>
                    </div>
                \`;
            });
            
            (data.errors || []).forEach(error => {
                if (error.baseName) {
                    resultsHtml += \`
                        <div class="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3">
                            <div>
                                <p class="text-sm font-medium text-ocean-950">\${escapeHtml(error.baseName)}</p>
                                <p class="text-xs text-red-600">\${escapeHtml(error.error || 'Processing failed')}</p>
                            </div>
                        </div>
                    \`;
                }
            });
            
            if (!resultsHtml) {
                resultsHtml = '<p class="text-sm text-ocean-950/60">No results to display.</p>';
            }
            
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
                allFolders = [];
                
                document.getElementById('authSection').classList.remove('hidden');
                document.getElementById('folderSection').classList.add('hidden');
                document.getElementById('scanResults').classList.add('hidden');
                document.getElementById('batchProgress').classList.add('hidden');
                document.getElementById('resultsSection').classList.add('hidden');
            }
        }
        
        async function abortBatch() {
            if (!batchId) return;
            
            if (!confirm('Are you sure you want to abort the batch process? This will stop processing after the current card.')) {
                return;
            }
            
            const abortBtn = document.getElementById('abortBtn');
            abortBtn.disabled = true;
            abortBtn.innerHTML = '<svg class="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Aborting...';
            
            try {
                const response = await fetch('/api/google-drive?action=abort-batch&batchId=' + batchId);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to abort');
                }
                
                abortBtn.innerHTML = 'Aborted';
                
            } catch (error) {
                console.error('Abort error:', error);
                alert('Failed to abort: ' + error.message);
                abortBtn.disabled = false;
                abortBtn.innerHTML = '<svg class="size-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg> Abort';
            }
        }
        
        function toggleLogs() {
            const logsContainer = document.getElementById('logsContainer');
            const toggleIcon = document.getElementById('logsToggleIcon');
            
            if (logsContainer.classList.contains('hidden')) {
                logsContainer.classList.remove('hidden');
                toggleIcon.classList.add('rotate-180');
                // Scroll to bottom when opening
                logsContainer.scrollTop = logsContainer.scrollHeight;
            } else {
                logsContainer.classList.add('hidden');
                toggleIcon.classList.remove('rotate-180');
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
