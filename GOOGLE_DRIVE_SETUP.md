# Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for the 3D Card Generator, enabling batch processing of entire folders.

## 🔧 Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with the `oocard@oocard.com` account
3. Create a new project or select existing project
4. Note down the **Project ID**

### Step 2: Enable Required APIs

1. Go to **APIs & Services > Library**
2. Enable these APIs:
   - **Google Drive API**
   - **Google+ API** (for user info)

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields:
   - **App name**: "3D Card Generator - OOCard"
   - **User support email**: `oocard@oocard.com`
   - **Developer contact**: `oocard@oocard.com`
4. Add scopes:
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users if needed

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Configure:
   - **Name**: "3D Card Generator Web Client"
   - **Authorized JavaScript origins**:
     - `https://3d-card-generator.oocard.workers.dev`
     - `https://mockup.oocard.com` (if using custom domain)
   - **Authorized redirect URIs**:
     - `https://3d-card-generator.oocard.workers.dev/api/google-auth?action=callback`
     - `https://mockup.oocard.com/api/google-auth?action=callback` (if using custom domain)

5. Download the JSON credentials file
6. Note the **Client ID** and **Client Secret**

## 🚀 Cloudflare Worker Configuration

### Set Environment Variables

You need to set these environment variables in your Cloudflare Worker:

```bash
# Using Wrangler CLI
wrangler secret put GOOGLE_CLIENT_ID
# Paste your Google OAuth Client ID

wrangler secret put GOOGLE_CLIENT_SECRET  
# Paste your Google OAuth Client Secret

wrangler secret put GOOGLE_REDIRECT_URI
# Set to: https://3d-card-generator.oocard.workers.dev/api/google-auth?action=callback
```

### Alternative: Using Cloudflare Dashboard

1. Go to [Cloudflare Workers Dashboard](https://dash.cloudflare.com/)
2. Select your worker: `3d-card-generator`
3. Go to **Settings > Environment Variables**
4. Add these **Secret** variables:
   - `GOOGLE_CLIENT_ID`: Your OAuth 2.0 Client ID
   - `GOOGLE_CLIENT_SECRET`: Your OAuth 2.0 Client Secret  
   - `GOOGLE_REDIRECT_URI`: `https://3d-card-generator.oocard.workers.dev/api/google-auth?action=callback`

## 📁 Google Drive Folder Structure

### Required File Naming Convention

For batch processing to work correctly, your Google Drive folder must contain PNG files with this naming pattern:

```
CardName-F.png    (Front image)
CardName-R.png    (Back image)
```

### Example Folder Structure

```
📁 My Card Collection/
├── BusinessCard-F.png
├── BusinessCard-R.png
├── GiftCard-F.png
├── GiftCard-R.png
├── MembershipCard-F.png
└── MembershipCard-R.png
```

## 🎯 Features

### SSO Authentication
- Secure Google OAuth 2.0 integration
- Read-only access to Google Drive files
- Session management with automatic refresh

### Batch Processing
- Scan entire folders for valid card pairs
- Process multiple cards automatically
- Real-time progress tracking
- Download all generated 3D models

### File Management
- Automatic file pairing (front/back)
- Validation of file naming conventions  
- Error reporting for unpaired files
- Support for large folders (hundreds of files)

## 🔒 Security Features

- OAuth 2.0 with PKCE (Proof Key for Code Exchange)
- Read-only Google Drive permissions
- Secure token storage with automatic expiration
- CORS protection for all API endpoints

## 🚦 Usage Flow

1. **Connect**: User clicks "Sign in with Google Drive"
2. **Authorize**: Google OAuth popup for permission
3. **Browse**: List of user's Google Drive folders
4. **Scan**: Preview files in selected folder
5. **Process**: Batch convert all valid card pairs
6. **Download**: Access all generated 3D models

## 📊 Monitoring & Limits

### Google API Quotas
- **Drive API**: 1,000 requests per 100 seconds per user
- **OAuth API**: 10,000 requests per day

### Worker Limits
- **Session timeout**: 1 hour
- **Batch timeout**: 2 hours  
- **Max file size**: 10MB per image
- **Concurrent processing**: 1 card at a time

## 🛠 Troubleshooting

### Common Issues

**"Authentication failed"**
- Check OAuth credentials are correct
- Verify redirect URIs match exactly
- Ensure APIs are enabled

**"Failed to scan folder"**  
- Check Google Drive permissions
- Verify folder contains PNG files
- Check file naming convention

**"Processing failed"**
- Large files may exceed limits
- Check network connectivity
- Verify R2 bucket access

### Debug Mode

Add `?debug=true` to any URL to enable console logging for troubleshooting.

## 🔄 Updates & Maintenance

The integration will automatically:
- Refresh expired OAuth tokens
- Handle API rate limits
- Clean up expired sessions
- Validate file integrity

Regular maintenance:
- Monitor Google Cloud Console quotas
- Update OAuth consent screen if needed
- Review and rotate secrets periodically