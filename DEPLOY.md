# Deployment Guide

This project uses a **Static Site Architecture** for the web demo and landing page. This ensures high performance, zero cost, and maximum privacy (Client-Side Zero-Knowledge).

## Architecture Overview

- **Extension (`extension/`)**: The core product.
- **Web (`web/`)**: The landing page and demo. It runs entirely in the browser.
- **Shared Logic**: The core logic (crypto, password strength) lives in `extension/src` and is synced to `web/src` during build/dev.

## Development

To work on the website with live synchronization from the extension code:

```bash
python3 scripts/dev.py
```

This will:

1.  Sync the latest code from `extension/src` to `web/src`.
2.  Start a local web server at `http://localhost:8000`.
3.  Watch for changes in `extension/src` and auto-sync them.

## Deployment (Production)

### 1. GitHub Pages (Recommended)

This repository is configured to deploy the `web/` folder automatically using GitHub Actions.

1.  Go to your repository **Settings** > **Pages**.
2.  Under **Build and deployment**, select **GitHub Actions**.
3.  The workflow defined in `.github/workflows/deploy.yml` will handle the rest.

### 2. Vercel / Netlify

If you prefer Vercel or Netlify:

1.  Connect your GitHub repository.
2.  **Build Command**: `python3 scripts/sync_shared.py`
3.  **Output Directory**: `web`
4.  **Environment Variables**: None required.

## Backend (Optional)

The `app/` directory contains a Python backend (FastAPI + Redis) that acts as a proxy for HIBP.
**It is currently NOT used by the static site** to keep costs at zero and simplify privacy claims.

If you wish to deploy it in the future (e.g., for enterprise features):

1.  Use the provided `Dockerfile`.
2.  Deploy to a container service (Railway, Render, DigitalOcean).
3.  Update `web/src/hibp.js` to point to your backend URL.
