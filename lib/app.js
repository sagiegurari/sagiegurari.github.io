(function init() {
    'use strict';

    const noop = function () {
        return undefined;
    };

    class DataLoader {
        constructor() {
            this.callback = noop;

            this.data = {
                githubInfo: (window.githubInfo || [])
            };

            fetch('https://api.github.com/users/sagiegurari/repos?type=owner&per_page=100').then(function (response) {
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
            this.dataLoader.get((data) => {
                //clone data
                data = JSON.parse(JSON.stringify(data.githubInfo));

                this.repositories = data.sort(function (repo1, repo2) {
                    let output = repo2.stargazers_count - repo1.stargazers_count;

                    if (!output) {
                        output = repo2.forks_count - repo1.forks_count;
                    }

                    return output;
                });

                for (let index = 0; index < this.repositories.length; index++) {
                    if (!this.repositories[index].fork) {
                        this.ownerInfo = this.repositories[index].owner;
                        break;
                    }
                }

                callback();
            });
        }
    }

    let app;
    const startup = function () {
        if (!app) {
            app = new App();
            app.loadData(function onDataLoaded() {
                console.log({
                    ownerInfo: app.ownerInfo,
                    repositories: app.repositories
                });
            });
        }
    };

    document.addEventListener('DOMContentReady', startup);
    setTimeout(startup, 0);
}());
