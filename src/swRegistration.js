export function initServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swUrl = `/sw-v5.js?v=${Date.now()}`;
      
      // Force unregister ALL existing workers to break the cache loop
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('[SW] Force Unregistered old worker');
        }
        
        // Register the NEW worker version
        navigator.serviceWorker.register(swUrl).then(reg => {
          console.log('[SW] Registered v5 successfully');
          setInterval(() => reg.update(), 1000 * 60 * 5); // Check every 5m
        }).catch(err => console.error('[SW] Registration failed:', err));
      });
    });
  } else {
    console.info("Service workers are not supported in this browser.");
  }
}