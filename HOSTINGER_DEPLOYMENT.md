# Deploy TalentForge to Hostinger

This guide covers deploying the TalentForge React + Vite SPA to Hostinger shared hosting (hPanel/cPanel).

---

## Prerequisites

- Hostinger account with shared hosting or VPS
- Domain pointed to your Hostinger hosting
- Node.js installed locally (for building)

---

## Step 1: Build the Application

On your local machine, run:

```bash
cd /path/to/upwork-website
npm install
npm run build
```

This creates a `dist` folder with optimized static files (HTML, JS, CSS, assets).

---

## Step 2: Prepare the Build for Upload

**Option A – Using the deploy script (recommended):**

```bash
npm run deploy:zip
```

This builds the app and creates `talentforge-build.zip` in the project root with the correct structure.

**Option B – Manual:**

1. Go to the `dist` folder in your project
2. Select **all files and folders inside** `dist` (not the `dist` folder itself)
3. Compress them into a `.zip` file (e.g. `talentforge-build.zip`)

**Important:** The zip should contain `index.html` and `assets/` at the root. Do not zip the `dist` folder itself, or you'll end up with `dist/index.html` instead of `index.html` in `public_html`.

---

## Step 3: Access Hostinger hPanel

1. Log in to [Hostinger](https://www.hostinger.com)
2. Open **hPanel** (or cPanel if your plan uses it)
3. Go to **Files** → **File Manager**

---

## Step 4: Upload to public_html

1. In File Manager, navigate to **`public_html`** (or the folder for your domain/subdomain)
2. **Clear existing files** if this is a fresh deploy (optional: backup first)
3. Click **Upload**
4. Upload your `talentforge-build.zip`
5. After upload, select the zip file and click **Extract**
6. Extract to `public_html` so that `index.html` is directly inside `public_html`

---

## Step 5: Add .htaccess for React Router

TalentForge uses React Router. Without `.htaccess`, direct visits to routes like `/find-work` or `/login` will return 404.

1. In File Manager, inside `public_html`, click **+ File**
2. Name it `.htaccess`
3. Edit the file and add:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

4. Save the file

---

## Step 6: Verify Base Path (Optional)

If assets (JS/CSS) fail to load, add a base tag to `index.html` in `public_html`:

```html
<head>
  <base href="/">
  ...
</head>
```

Vite usually sets this correctly; only add it if you see broken assets.

---

## Step 7: Test Your Site

1. Visit your domain (e.g. `https://yourdomain.com`)
2. Test main routes: `/`, `/login`, `/signup`, `/find-work`, `/find-talent`
3. Confirm assets load and navigation works

---

## Quick Checklist

| Step | Action |
|------|--------|
| 1 | `npm run build` locally |
| 2 | Zip contents of `dist` folder |
| 3 | Upload zip to `public_html` via File Manager |
| 4 | Extract zip in `public_html` |
| 5 | Create `.htaccess` with rewrite rules |
| 6 | Test the site |

---

## Subdomain or Addon Domain

- **Subdomain:** Upload to `public_html/subdomain.yourdomain.com` or the folder Hostinger assigns
- **Addon domain:** Use the folder created for that domain (e.g. `public_html/addondomain.com`)

If using a subfolder (e.g. `yourdomain.com/talentforge`), you must set `base: '/talentforge/'` in `vite.config.ts` and rebuild.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on refresh / direct URL | Add or fix `.htaccess` rewrite rules |
| Blank page | Check browser console; ensure `index.html` and `assets/` are in `public_html` root |
| Assets not loading | Add `<base href="/">` to `index.html`; verify file paths |
| PWA not working | Ensure `manifest.webmanifest` and `sw.js` are in `public_html` (Vite includes them in build) |

---

## PHP API (Login & Register)

To store users on the server, deploy the `upwork-api` PHP API:

1. Upload the **`upwork-api`** folder to `public_html/upwork-api` (alongside your app files).
2. Ensure `upwork-api/data` is writable (chmod 755 or 777).
3. Create `.env` in your project root with:
   ```
   VITE_API_URL=https://yourdomain.com/upwork-api
   ```
4. Rebuild the frontend: `npm run build`
5. Users will be stored in `upwork-api/data/users.json`.

See `upwork-api/README.md` for API details.

---

## Notes

- **Static only:** Hostinger shared hosting serves static files only. No Node.js or server-side rendering.
- **localStorage:** TalentForge uses `localStorage` for data; no backend is required for the current demo.
- **HTTPS:** Hostinger provides free SSL; enable it in hPanel if not already on.
