# 🚀 Spectr Trading: Roadmap for May 1st

## 🎯 Main Goal: Terminal Perfection & Payment Automation
After stabilizing the infrastructure today, tomorrow we focus on the **User Experience** and **Monetization**.

---

### 1. 💎 App Overview Page (The "Wow" Factor)
*   **Grid Layout Fix:** Finalize the CSS Grid in `Overview.jsx` to ensure the Hero section looks premium on all devices (no text overlaps).
*   **Visual Polish:** Apply the "UI/UX Pro Max" style — deep gradients, glassmorphism for widgets, and smooth micro-animations.
*   **Market Intel Integration:** Ensure the Overview page correctly pulls the latest news/intel without mock-data fallbacks.
*   **Version Check:** Keep the `v8` tag visible for tracking deployment propagation.

### 2. 💳 NOWPayments Integration (The Money Flow)
*   **IPN Callback Validation:** Verify that the server correctly receives payment status updates from NOWPayments.
*   **Auto-Upgrade Logic:** Test the automated transition of users to the "Pro" role upon successful payment.
*   **Billing Dashboard:** Add a simple "Subscription Status" indicator in the user Settings or Overview.

### 3. 🧹 Infrastructure Cleanup (Sanity Check)
*   **Remove Stale Code:** Delete the unused `src/` and `dist/` folders in the root `/var/www/spectrtrading.com/` to avoid confusion.
*   **SSL Verification:** Re-check if we can fix the local Git SSL handshake permanently or keep using the `-c http.sslVerify=false` workaround.

---

### 🛠 Files to Focus On:
- `src/pages/Overview.jsx` (UI/UX)
- `server/controllers/paymentController.js` (NOWPayments)
- `server/services/authService.js` (Role management)
- `src/layouts/AppShell.jsx` (Navigation & Branding)

---
**Ready to transform Spectr into a high-end Neuro-Finance platform tomorrow!**
