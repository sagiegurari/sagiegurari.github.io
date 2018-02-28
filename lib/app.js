(function init() {
    'use strict';

    const noop = function() {
        return undefined;
    }

    class DataLoader {
        constructor() {
            this.callback = noop;

            this.data = {
                githubInfo: (window.githubInfo || [])
            };

            fetch('https://api.github.com/users/sagiegurari/repos?type=owner&per_page=100').then(function(response) {
                return response.json();
            }).then((apiData) => {
                if (apiData && Array.isArray(apiData) && apiData.length) {
                    this.data.githubInfo = apiData;
                    this.callback(this.data);
                }
            });
        }

        get(listener) {
            this.callback = listener;

            this.callback(this.data);
        }
    }

    class App {
        constructor() {
            this.dataLoader = new DataLoader();
        }

        loadData(callback) {
            this.dataLoader.get(callback);
        }
    }

    let app;
    const startup = function() {
        if (!app) {
            app = new App();
            app.loadData(function onDataLoaded(data) {
                console.log(data);
            });
        }
    };

    document.addEventListener('DOMContentReady', startup);
    setTimeout(startup, 0);
})();
