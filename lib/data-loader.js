/*global navigator, fetch*/

import initialData from './data.json';
import {
    noop
} from './utils.js';

class DataLoader {
    constructor() {
        this.callback = noop;

        this.data = {
            githubInfo: (window.githubInfo || initialData || [])
        };

        const dataURL = 'https://api.github.com/users/sagiegurari/repos?type=owner&per_page=100';

        const filterData = (apiData) => {
            if (apiData && Array.isArray(apiData) && apiData.length) {
                const repositoryFields = [
                    'owner',
                    'html_url',
                    'name',
                    'description',
                    'stargazers_count',
                    'forks_count',
                    'language',
                    'fork'
                ];
                let ownerFound = false;
                for (let index = apiData.length - 1; index >= 0; index--) {
                    const repository = apiData[index];

                    if (repository && !repository.fork) {
                        Object.keys(repository).forEach((repoKey) => {
                            if (repositoryFields.indexOf(repoKey) === -1) {
                                delete repository[repoKey];
                            }
                        });

                        if (repository.owner) {
                            if (ownerFound) {
                                delete repository.owner;
                            } else {
                                ownerFound = true;

                                const ownerFields = [
                                    'html_url',
                                    'avatar_url'
                                ];

                                Object.keys(repository.owner).forEach((ownerKey) => {
                                    if (ownerFields.indexOf(ownerKey) === -1) {
                                        delete repository.owner[ownerKey];
                                    }
                                });
                            }
                        }
                    } else {
                        apiData.splice(index, 1);
                    }
                }

                console.log('[App] filtered data: ', JSON.stringify(apiData, undefined, 2));
            }

            return apiData;
        };

        let dataLoaded = false;
        const onData = (apiData, force) => {
            if (apiData && Array.isArray(apiData) && apiData.length) {
                apiData = filterData(apiData);
                if (!force) {
                    console.log('[App] loaded data: ', JSON.stringify(apiData, undefined, 2));
                }

                if (this.data.githubInfo) {
                    if (!force) {
                        const newData = JSON.stringify(apiData);
                        const existingData = JSON.stringify(this.data.githubInfo);

                        force = (newData !== existingData);
                    }

                    if (force) {
                        this.data.githubInfo = apiData;
                        this.callback(this.data); //only call callback in case new data is different
                    }
                }

                return true;
            }
        };

        onData(this.data.githubInfo, true);

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
            });
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
