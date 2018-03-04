(function () {
    'use strict';

    const CACHE_VERSION = 3;
    const CURRENT_CACHES = {
        assets: 'assets-v' + CACHE_VERSION,
        data: 'data-v' + CACHE_VERSION
    };
    const CACHED_EXTENSIONS = [
        '.png',
        '.css',
        '.html',
        'app.js',
        '.woff',
        '.woff2',
        '.map',
        'manifest.json',
        '.githubusercontent.com/u/'
    ];

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
        const request = event.request;
        const url = request.url;
        let cacheSkipped = true;

        if (url.indexOf('api.github.com/users/sagiegurari') !== -1) {
            cacheSkipped = false;

            event.respondWith(caches.open(CURRENT_CACHES.data).then(function (cache) {
                return fetch(request).then(function (response) {
                    cache.put(url, response.clone());

                    console.log('[service worker] cached data.');

                    return response;
                });
            }));
        } else {
            for (let index = 0; index < CACHED_EXTENSIONS.length; index++) {
                const extension = CACHED_EXTENSIONS[index];
                if (url.indexOf(extension) !== -1) {
                    cacheSkipped = false;

                    let responded = false;
                    const fetchAndCache = function () {
                        if (!responded) {
                            responded = true;

                            event.respondWith(caches.open(CURRENT_CACHES.assets).then(function (cache) {
                                return fetch(request).then(function (response) {
                                    cache.put(url, response.clone());

                                    console.log('[service worker] cached asset: ', url);

                                    return response;
                                });
                            }));
                        }
                    };

                    caches.match(url).then(function (response) {
                        if (response) {
                            return response;
                        } else {
                            return fetchAndCache();
                        }
                    }).catch(fetchAndCache);

                    break;
                }
            }
        }

        if (cacheSkipped) {
            console.warn('[service worker] skipped cache for url: ', url);
        }
    });
}());
