# SETU Deployment & Permanent QR Code Guide

This guide details how to deploy SETU on **Render** and how to use the **permanent non-expiring QR code** for evaluation, demonstrations, and presentations.

---

## 1. Quick Deploy on Render

SETU is pre-configured with a Render Blueprint specification (`render.yaml`) that configures the frontend and backend services with zero guesswork.

### Method A: 1-Click Blueprint (Recommended)
1. Sign in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** at the top right and select **Blueprint**.
3. Select your GitHub repository: `suryanshKhare-git/Ai_Powered_Criminal_Network_Analysis_System`.
4. Render will detect `render.yaml` and display the blueprint configuration:
   - **`setu-crime-analysis`** (Static Site Frontend, 24/7 global CDN, no sleep/spin-down).
   - **`setu-crime-api`** (FastAPI Backend, Python 3.11).
5. Click **Apply**. Render will automatically build and deploy both services!

---

### Method B: Manual Static Site (Instant & 100% Free 24/7)
If you only need the interactive investigation interface with built-in client intelligence and mock graph resolution:
1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `setu-crime-analysis` (or your preferred name)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Advanced** -> **Redirects / Rewrites**, add a rewrite:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
5. Click **Create Static Site**.
6. Your permanent URL will be live at:
   ```
   https://setu-crime-analysis.onrender.com
   ```

---

## 2. Permanent Non-Expiring QR Code

### Why this QR Code Never Expires
Many free online QR code generators generate "dynamic" tracking redirects (e.g. `qr.io/xyz`, `qrco.de/abc`) that deliberately expire after 14 or 30 days to force a subscription. 

SETU's QR code is a **direct static matrix code (ISO/IEC 18004)**:
- **Zero Third-Party Redirects**: The raw URL is encoded directly into the 2D matrix modules.
- **Level H Error Correction**: Employs maximum Reed-Solomon error correction (allowing up to **30% recovery** if the printed QR code is smudged, creased, or scanned under difficult presentation lighting).
- **Offline Decoding**: Any modern smartphone camera decodes it instantly without contacting an intermediary routing server.

### Included QR Code Assets

| File | Resolution / Type | Best For |
| :--- | :--- | :--- |
| [`SETU_RENDER_QR.png`](./SETU_RENDER_QR.png) | 900x900px Crisp PNG | Digital presentation slides, Word, PDF dossier exports |
| [`SETU_RENDER_QR.svg`](./SETU_RENDER_QR.svg) | Scalable Vector Graphic | Flex banners, standees, printed poster boards |
| [`public/setu_render_qr.png`](./public/setu_render_qr.png) | High-res PNG | In-app mobile modal and live downloads |

### Generating a QR Code for a Custom Domain
If you configure a custom domain on Render (e.g. `https://setu.police.gov.in` or `https://my-custom-name.onrender.com`), regenerate the permanent QR code with a single command:

```bash
python scripts/generate_qr.py https://YOUR-DOMAIN.onrender.com
```

### In-App QR Code Modal
While presenting SETU on a laptop:
1. Look at the top navigation bar.
2. Click the **`QR`** button next to `PRESENT`.
3. An on-screen modal will display the permanent QR code for judges or evaluators to scan directly off the screen with their mobile phones.
