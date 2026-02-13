if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(res => console.log('Service Worker registered'))
      .catch(err => console.log('SW registration failed'));
  });
}

// Offline detection
window.addEventListener('offline', () => {
  console.log('Application is offline');
  // Show offline notification
  const offlineAlert = document.createElement('div');
  offlineAlert.className = 'fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center z-50';
  offlineAlert.textContent = '⚠️ You are offline. Some features may not be available.';
  document.body.appendChild(offlineAlert);
});

window.addEventListener('online', () => {
  console.log('Application is back online');
  const offlineAlerts = document.querySelectorAll('div');
  offlineAlerts.forEach(alert => {
    if (alert.textContent.includes('offline')) alert.remove();
  });
});
