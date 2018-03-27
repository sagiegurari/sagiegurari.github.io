/*global navigator, fetch*/

import {
    noop
} from './utils.js';

class DataLoader {
    constructor() {
        this.callback = noop;

        this.data = {
            githubInfo: (window.githubInfo || [])
        };

        const dataURL = 'https://api.github.com/users/sagiegurari/repos?type=owner&per_page=100';

        let dataLoaded = false;
        const onData = (apiData) => {
            if (apiData && Array.isArray(apiData) && apiData.length) {
                console.log('[App] loaded data: ', apiData);

                if (this.data.githubInfo) {
                    const newData = JSON.stringify(apiData);
                    const existingData = JSON.stringify(this.data.githubInfo);

                    if (newData !== existingData) {
                        this.data.githubInfo = apiData;
                        this.callback(this.data); //only call callback in case new data is different
                    }
                }

                return true;
            }
        };

        const fetchFromGithub = () => {
            console.log('[App] fetching data from github.');

            fetch(dataURL).then(function (response) {
                return response.json();
            }).then((apiData) => {
                if (onData(apiData)) {
                    dataLoaded = true;
                }
            });
        };

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js').then(function () {
                console.log('[App] service worker registered, fetch from cache: ', !dataLoaded);
                if (!dataLoaded) {
                    if ('caches' in window) {
                        window.caches.match(dataURL).then(function (response) {
                            if (response) {
                                response.json().then(onData);
                            }
                        });
                    }
                }

                fetchFromGithub();
            }).catch(fetchFromGithub);
        } else {
            fetchFromGithub();
        }

        //if site/app remains open, refresh data daily
        setInterval(fetchFromGithub, 1000 * 60 * 60 * 24);
    }

    get(listener) {
        if (listener && typeof listener === 'function') {
            this.callback = listener;

            this.callback(this.data);
        }
    }
}

export default DataLoader;
