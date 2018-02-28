(function () {
    'use strict';

    const CACHE_VERSION = 1;
    const CURRENT_CACHES = {
        resources: 'resources-v' + CACHE_VERSION,
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
        event.waitUntil(app.deleteOldCache);
    });
}());
