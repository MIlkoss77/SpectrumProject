export function initServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // Use a unique version parameter to bypass browser-level script caching
      const swUrl = `/sw-v5.js?v=5.2.4-STABLE-${Date.now()}`;
      
      navigator.serviceWorker.register(swUrl).then(reg => {
        console.log('[SW] Registered v5.2.4');

        // Force update if we see a waiting worker
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New content available, reloading...');
              window.location.reload();
            }
          });
        });

        // Periodic check
        setInterval(() => reg.update(), 1000 * 60 * 60); // Every hour
      }).catch(err => console.error('[SW] Registration failed:', err));
    });
  }
}