# 📅 Roadmap: Spectr Trading Production Launch (Final Phase)

## 🎯 Current Status (as of April 29, 03:55 AM)
*   **Header UI**: Redesigned to a robust Grid layout (v5.2.1). Should be stable on all screens once built.
*   **Auth Page**: Redesigned with inline styles for "fail-safe" premium look.
*   **Google Auth**: Currently hitting a 404 error (Nginx/SPA intercept issue) or "Invalid Request" (Google Console config).
*   **Known Runtime Error**: `Link is not defined` appearing on mobile devices due to aggressive caching of old JS bundles.

---

## 🛠 Step 1: Solving the 404 (Nginx & Routing)
The 404 on `app.spectrtrading.com/api/debug` proves that Nginx is not correctly handing off `/api` requests to the Node.js backend.

**Action Items:**
1.  Verify `/etc/nginx/sites-available/app.spectrtrading.com` has NO trailing slashes in `location /api` and `proxy_pass http://127.0.0.1:3000`.
2.  Ensure `sudo nginx -t` and `sudo systemctl reload nginx` were executed.
3.  Check if `pm2 status` shows `spectr-api` as online.

---

## 🔐 Step 2: Fixing Google "Invalid Request"
Once the 404 is gone, Google might show `redirect_uri_mismatch`.

**Action Items:**
1.  Check `/var/www/spectrum-app/.env` on the server.
2.  Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match the JSON provided today.
3.  Ensure `GOOGLE_CALLBACK_URL` is set to `https://app.spectrtrading.com/api/auth/google/callback`.

---

## 📱 Step 3: Killing "Link is not defined" (Cache Busting)
This error is caused by the browser loading a stale `index.js` while the server has new code.

**Action Items:**
1.  On the server: `rm -rf dist && npm run build`.
2.  Increment version in `package.json` to force a new bundle filename.
3.  Instruct users to clear browser cache for `app.spectrtrading.com`.

---

## 🚀 Step 4: Final Deployment Command Chain
Run this sequence on the production server to ensure a clean sync:
```bash
cd /var/www/spectrum-app
git reset --hard origin/main
git pull
rm -rf dist
npm install
npm run build
pm2 restart all
```

---

## 📝 Notes for next session:
*   The `Link` import error is definitely fixed in `AppShell.jsx` (Line 2).
*   Google redirect in `Login.jsx` is now using an absolute URL to force an Nginx hit.
*   Debug route `/api/debug` is available to test connectivity.

**Target: 100% stable login flow and neural terminal access.**
