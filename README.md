# The Editor — Asma Shehzadi | Portfolio & Admin CMS

Official portfolio of Asma Shehzadi (The Editor) — Video Editor & Graphic Designer.

## How to Deploy on Netlify (100% Blank Screen Fixed)

### Option 1: Drag & Drop via Netlify Drop (Easiest)
1. Download the ZIP file from Google AI Studio and extract it on your computer.
2. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)**.
3. Drag and drop either:
   - The **`dist`** folder (pre-built production output ready to serve), **OR**
   - The **entire extracted project folder** (our dual-mode loader automatically detects static hosting and runs the pre-compiled production bundle).
4. Your website will load instantly without any blank page.

### Option 2: Deploy with Git / GitHub (Continuous Deployment)
Connect your repository to Netlify with the pre-configured settings:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`
- **Node version:** 20 (set automatically in `.nvmrc` and `netlify.toml`)

### Client-Side Routing & Refreshing
The included `_redirects` and `netlify.toml` automatically route all page paths (`/admin`, etc.) to `/index.html` with HTTP 200, so refreshing pages never displays a 404 or blank screen.

### Media Uploads & Storage on Netlify
- Video links (YouTube, Vimeo, Google Drive, Direct MP4) work immediately with zero configuration.
- Custom thumbnails and media can be stored using **Netlify Blobs** (enabled by default on Netlify) or **Cloudinary** (free high-speed media CDN configured in Admin Panel -> Media Library -> Cloud Storage Settings).

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
