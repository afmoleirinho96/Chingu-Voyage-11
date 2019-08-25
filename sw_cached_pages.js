const cacheName = 'v4';

const cacheAssets = [
    'index.html',
    'css/main.css',
    'javascript/features.js'
];

//Call Install Event
self.addEventListener('install', event => {
    // console.log('Service Worker: installed');

    event.waitUntil(
        caches
        .open(cacheName)
        .then(cache => {
            // console.log('Service Worker: Caching Files');
            cache.addAll(cacheAssets);
        })
        .then(() => self.skipWaiting())
    );

});

self.addEventListener('activate', event => {
    // console.log('Service Worker: Activated');
    //Remove unwanted caches
    event.waitUntil(
        // if the chache isn't the actual chache, delete it
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    /**
                     *If it isn't different than the last cache
                      and mapbox-tiles cache (MapBoxAPI cache)
                     */

                    if (cache !== cacheName && cache !== "mapbox-tiles") {
                        // console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            )
        })
    )
});

// Call Fetch Event
self.addEventListener('fetch', e => {
    // console.log('Service Worker: Fetching');
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  });