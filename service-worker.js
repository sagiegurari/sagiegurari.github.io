(function () {
    'use strict';

    const CACHE_VERSION = 1;
    const CURRENT_CACHES = {
        data: 'data-v' + CACHE_VERSION
    };

    const app = (function () {
        const appModule = {
            deleteOldCache() {
                const expectedCacheNames = Object.keys(CURRENT_CACHES).map(function (key) {
                    return CURRENT_CACHES[key];
                });

                const deleteOldCaches = function (cacheNames) {
                    return cacheNames.map(function (cacheName) {
                        if (expectedCacheNames.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName);
                        }

                        return undefined;
                    });
                };

                return caches.keys().then(function (cacheNames) {
                    return Promise.all(deleteOldCaches(cacheNames));
                });
            }
        };

        return appModule;
    }());

    self.addEventListener('activate', function (event) {
        console.log('[service worker] activated.');
        event.waitUntil(app.deleteOldCache);
    });

    self.addEventListener('fetch', function (event) {
        if (event.request.url.indexOf('api.github.com/users/sagiegurari') !== -1) {
            event.respondWith(caches.open(CURRENT_CACHES.data).then(function (cache) {
                return fetch(event.request).then(function (response) {
                    cache.put(event.request.url, response.clone());
                    return response;
                });
            }));
        }
    });
}());
