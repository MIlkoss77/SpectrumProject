export function initServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // Add a timestamp to bypass browser-level caching of the SW file itself
      const swUrl = `/sw.js?v=${Date.now()}`;
      navigator.serviceWorker.register(swUrl).then(reg => {
        // Force update check on every load
        reg.update();
      }).catch(console.error);
    });
  } else {
    console.info("Service workers are not supported in this browser.");
  }
}