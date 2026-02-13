# 3D Card Generator - OOCard

A Cloudflare Workers application that transforms PNG card designs into 3D GLB models. Features Google Drive batch processing, copyright text embedding, and a gallery of generated cards.

**Live URL**: https://mockup.oocard.com

## Features

### Card Generation
- **CR80 Standard Cards**: Generates cards with ISO 7810 ID-1 dimensions (85.6mm × 53.98mm × 0.76mm)
- **Rounded Corners**: Automatically applies 3.18mm corner radius per ISO standard
- **GLB Export**: WordPress 3D viewer compatible format with embedded textures
- **SVG Overlay Support**: Optional overlay for holographic or special effects

### Copyright Text
- **Edge Embedding**: Repeating copyright text rendered along all card edges
- **Custom Text**: Configurable copyright message (default: "DESIGN COPYRIGHT 2026")
- **Inter-style Font**: Clean, modern bitmap font for crisp text rendering
- **Seamless Tiling**: Text tiles perfectly around the card perimeter

### Google Drive Integration
- **OAuth Authentication**: Secure Google Drive access
- **Folder Browser**: Hierarchical folder tree with expand/collapse
- **Batch Processing**: Process multiple card pairs from a folder
- **Auto-Upload**: Generated GLB files saved back to source folder
- **Progress Tracking**: Real-time logs and abort functionality

### Gallery
- **Thumbnail Grid**: Visual gallery of all generated cards
- **Date Sorting**: Cards sorted by creation date
- **Modal Viewer**: Click to view 3D model in fullscreen modal
- **Download**: Direct GLB download from gallery

## Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account with Workers and R2 enabled
- Wrangler CLI (`npm install -g wrangler`)

### Installation

```bash
# Clone the repository
git clone https://github.com/oocard/mockup.oocard.com.git
cd mockup.oocard.com

# Install dependencies
npm install

# Login to Cloudflare
wrangler login
```

### Configuration

1. Create R2 bucket and KV namespace:
```bash
wrangler r2 bucket create card-assets
wrangler kv:namespace create SESSIONS
```

2. Update `wrangler.toml` with your IDs

3. Set up secrets for production:
```bash
wrangler secret put BASIC_AUTH_USER --env production
wrangler secret put BASIC_AUTH_PASS --env production
wrangler secret put GOOGLE_CLIENT_ID --env production
wrangler secret put GOOGLE_CLIENT_SECRET --env production
```

### Development

```bash
npm run dev
# Visit http://localhost:8787
```

### Deployment

```bash
wrangler deploy --env production
```

## Usage

### Single Card Generation

1. Navigate to the Upload page (/)
2. Select front image (PNG)
3. Select back image (PNG)
4. Optionally enable copyright text
5. Click "Generate 3D Card"
6. Download the GLB file

### Batch Processing (Google Drive)

1. Navigate to the Drive page (/drive)
2. Connect your Google account
3. Browse to a folder containing card images
4. Images must follow naming convention:
   - Front: `*-F.png` or `*_F.png`
   - Back: `*-R.png` or `*_R.png`
5. Click "Process All Cards"
6. GLB files are saved back to the same folder

### Preview Gallery

1. Navigate to Preview page (/preview)
2. View all generated cards as thumbnails
3. Click any card to open 3D viewer modal
4. Download individual GLB files

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Upload interface |
| `/preview` | GET | 3D preview & gallery |
| `/drive` | GET | Google Drive integration |
| `/api/upload` | POST | Upload card images |
| `/api/process` | POST | Start 3D generation |
| `/api/status` | GET | Check processing status |
| `/api/download` | GET | Download GLB file |
| `/api/list-glbs` | GET | List all generated GLBs |
| `/api/thumbnail` | GET | Get card thumbnail |
| `/api/google-auth/*` | GET | Google OAuth flow |
| `/api/google-drive` | GET | Drive operations |

## File Naming Convention

For batch processing, images must be paired:

| Type | Pattern | Examples |
|------|---------|----------|
| Front | `*-F.png` or `*_F.png` | `Card01-F.png`, `Design_F.png` |
| Back | `*-R.png` or `*_R.png` | `Card01-R.png`, `Design_R.png` |

## Architecture

```
├── src/
│   ├── index.js              # Main worker entry & routing
│   ├── handlers/
│   │   ├── upload.js         # File upload handling
│   │   ├── process.js        # 3D card generation
│   │   ├── status.js         # Processing status
│   │   ├── download.js       # GLB download & gallery API
│   │   ├── googleAuth.js     # Google OAuth flow
│   │   └── googleDrive.js    # Drive integration & batch
│   ├── processing/
│   │   ├── imageProcessor.js # Image processing & copyright PNG
│   │   └── workingGLBGenerator.js # GLB file generation
│   ├── utils/
│   │   └── helpers.js        # Utility functions
│   └── ui/
│       ├── serve.js          # Upload page UI
│       ├── preview.js        # Preview & gallery UI
│       └── googleDrive.js    # Drive integration UI
├── wrangler.toml             # Cloudflare configuration
└── package.json
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MAX_FILE_SIZE` | Maximum upload size in bytes | 10485760 (10MB) |
| `SESSION_TIMEOUT` | Session expiry in seconds | 3600 |

## Secrets (Production)

| Secret | Description |
|--------|-------------|
| `BASIC_AUTH_USER` | HTTP Basic Auth username |
| `BASIC_AUTH_PASS` | HTTP Basic Auth password |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## Technical Details

### GLB Generation
- Creates valid glTF 2.0 binary format
- Embeds front/back textures as PNG
- Optional edge texture with copyright text
- Proper UV mapping for seamless texture tiling

### Copyright Text Rendering
- Pure JavaScript bitmap font (no Canvas API)
- 7x11 pixel Inter-style character set
- PNG generation with CRC32 and Adler32 checksums
- Texture repeats seamlessly around card perimeter

### Cloudflare Workers Constraints
- 128MB memory limit
- 30s CPU time per request
- Batch processing uses sequential single-card requests
- R2 for persistent storage, KV for session state

## License

MIT
