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

    $(function () {
        const app = new App();
        app.loadData(function onDataLoaded() {
            if (app.ownerInfo) {
                document.querySelector('.github-url').setAttribute('href', app.ownerInfo.html_url);
                document.querySelector('.avatar').setAttribute('src', app.ownerInfo.avatar_url);
            }
        });

        const $sideNav = $('.button-collapse');
        $sideNav.sideNav();

        $('.side-nav').on('click', 'a', function () {
            $sideNav.sideNav('hide');
        });

        const contentElement = document.querySelector('div.content');

        let currentView;
        const allPages = $('.page');
        const views = {};
        [
            'projects',
            'resume'
        ].forEach(function (view) {
            const viewElement = document.querySelector(`.page.${view}`);

            views[view] = {
                view,
                viewElement
            };
        });

        const changeView = function () {
            if (currentView) {
                contentElement.classList.remove(currentView.view);

                allPages.removeClass('show hidden');
            }

            switch (location.hash) {
            case '#/resume':
                currentView = views.resume;
                break;
            default:
                currentView = views.projects;
                break;
            }

            contentElement.classList.add(currentView.view);
            currentView.viewElement.classList.add('show');
            setTimeout(function () {
                allPages.filter(':not(.show)').addClass('hidden');
            }, 500);
        };
        window.addEventListener('hashchange', changeView);
        changeView();
    });
}());
