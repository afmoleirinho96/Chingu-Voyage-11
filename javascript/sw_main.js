
// Initializing serviceWorker and point out to the file that will deal with cache
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('../sw_cached_pages.js')
            .catch(err => console.log(`Service Worker: Error ${err}`))
    });
}