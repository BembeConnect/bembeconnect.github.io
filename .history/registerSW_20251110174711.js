if ('serviceWorker' in navigator) {
	// Don't register the service worker during local development — it can cache
	// production assets and make the dev server appear stale.
	const isLocalhost = 
		location.hostname === 'localhost' ||
		location.hostname === '127.0.0.1' ||
		location.hostname === '';

	if (isLocalhost) {
		// Skip registration on localhost to avoid caching while developing.
		// If you need to test the SW locally, remove this guard temporarily.
		console.info('[registerSW] Skipping service-worker registration on localhost.');
	} else {
		window.addEventListener('load', () => {
			navigator.serviceWorker.register('/sw.js', { scope: '/' });
		});
	}
}