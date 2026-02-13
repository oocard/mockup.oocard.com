# 3D Card Renderer - Cloudflare Workers

A tool that transforms PNG card designs into 3D GLB models for WordPress 3D viewer plugins. Built with Cloudflare Workers, R2 storage, and Three.js.

## Features

- **CR80 Standard Cards**: Generates cards with standard dimensions (85.6mm × 53.98mm × 0.76mm)
- **Rounded Corners**: Automatically applies 3.18mm corner radius
- **File Validation**: Enforces Fxx-F.png and Fxx-R.png naming convention
- **SVG Overlay Support**: Optional overlay for additional effects
- **GLB Export**: WordPress 3D viewer compatible format
- **Cloud Native**: Built for Cloudflare Workers with R2 storage

## Quick Start

### Prerequisites
- Node.js 16+
- Cloudflare account with Workers and R2 enabled
- Wrangler CLI installed (`npm install -g wrangler`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/3d-card-generator.git
cd 3d-card-generator
```

2. Install dependencies:
```bash
npm install
```

3. Configure Cloudflare:
```bash
# Login to Cloudflare
wrangler login

# Create R2 bucket
wrangler r2 bucket create card-assets

# Create KV namespace
wrangler kv:namespace create SESSIONS
```

4. Update `wrangler.toml` with your account details and namespace IDs

### Development

Run locally with Wrangler:
```bash
npm run dev
```

Visit `http://localhost:8787` to access the UI.

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Usage

1. **Prepare Images**: 
   - Front image: `F01-F.png`
   - Back image: `F01-R.png`
   - Optional SVG overlay

2. **Upload**: Use the web interface to upload your files

3. **Process**: The system automatically:
   - Validates file naming
   - Applies rounded corners
   - Creates 3D model
   - Exports to GLB

4. **Download**: Get your GLB file for WordPress

## API Endpoints

- `GET /` - Web interface
- `POST /api/upload` - Upload card images
- `POST /api/process` - Start 3D generation
- `GET /api/status` - Check processing status
- `GET /api/download` - Download GLB file

## File Naming Convention

- **Front**: `Fxx-F.png` (e.g., F01-F.png, F02-F.png)
- **Back**: `Fxx-R.png` (e.g., F01-R.png, F02-R.png)
- **Overlay**: `overlay.svg` (optional)

## Configuration

Environment variables in `wrangler.toml`:
- `MAX_FILE_SIZE`: Maximum upload size (default: 10MB)
- `SESSION_TIMEOUT`: Session expiry (default: 3600 seconds)

## Architecture

```
├── src/
│   ├── index.js           # Main worker entry
│   ├── handlers/          # Request handlers
│   │   ├── upload.js
│   │   ├── process.js
│   │   ├── status.js
│   │   └── download.js
│   ├── processing/        # Image & 3D processing
│   │   ├── imageProcessor.js
│   │   └── cardGenerator.js
│   ├── utils/            # Helper functions
│   │   └── helpers.js
│   └── ui/              # Web interface
│       ├── index.html
│       └── serve.js
```

## AWS Migration Path

The codebase is designed for easy migration to AWS:

1. **Storage**: Switch R2 to S3 by updating storage adapter
2. **Sessions**: Replace KV with DynamoDB
3. **Compute**: Deploy to Lambda or EC2
4. **CDN**: Use CloudFront instead of Cloudflare CDN

## Limitations

- Cloudflare Workers: 128MB memory, 30s execution time
- R2 Storage: 10MB per file upload
- Image Processing: Limited in Workers environment
- Three.js: WebGL rendering in Workers has constraints

## Future Enhancements

- [ ] Real-time 3D preview
- [ ] Batch processing
- [ ] Custom textures and materials
- [ ] Animation support
- [ ] Multiple card templates
- [ ] API key authentication

## Support

For issues or questions, please open a GitHub issue.

## License

MIT