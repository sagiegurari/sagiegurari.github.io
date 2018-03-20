(function init() {
    'use strict';

    /*global navigator, fetch, location, $*/

    const noop = function () {
        return undefined;
    };

    const throttle = function (func, time) {
        let last = 0;
        let timeoutID;

        return function () {
            const now = Date.now();

            if (now - last > time) {
                last = now;
                if (timeoutID) {
                    clearTimeout(timeoutID);
                    timeoutID = false;
                }

                func.apply(null, arguments);
            } else {
                const args = arguments;
                timeoutID = setTimeout(function () {
                    last = Date.now();
                    func.apply(null, args);
                }, now - last);
            }
        };
    };

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
                            caches.match(dataURL).then(function (response) {
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
        const repoGridTemplate = window.Handlebars.compile(`
            {{#each repositories}}
            <li class="card small repo-card">
                <div class="white-text-content small repo-card-content">
                    <header class="repo-header">
                        <span class="circle {{colorClass}}"></span>
                        <a href="{{url}}">{{name}} {{languageName}}</a>
                    </header>
                    <summary class="repo-info">{{description}}</summary>
                    <footer class="repo-footer">
                        <div class="repo-icon-wrapper">
                            <span class="repo-icon fas fa-star"></span>
                            <span class="repo-icon-text">{{starsCount}}</span>
                        </div>
                        <div class="repo-icon-wrapper">
                            <span class="repo-icon fas fa-code-branch"></span>
                            <span class="repo-icon-text">{{forksCount}}</span>
                        </div>
                    </footer>
                </div>
            </li>
            {{/each}}
        `);

        const setupRepositories = function (repositories) {
            const ulElement = document.querySelector('.page.projects .repo-grid');

            //remove old elements
            while (ulElement.firstChild) {
                ulElement.removeChild(ulElement.firstChild);
            }

            const visibleRepos = [];
            for (let index = 0; index < repositories.length; index++) {
                const repository = repositories[index];

                if (!repository.fork && repository.name.toLowerCase().indexOf('test') === -1) {
                    let colorClass;
                    let languageName = '';
                    if (repository.language) {
                        colorClass = 'github-color-' + repository.language.toLowerCase();

                        languageName = repository.language.toLowerCase();

                        if (languageName.length === 1) {
                            languageName = languageName.toUpperCase();
                        }

                        languageName = [
                            '(',
                            languageName,
                            ')'
                        ].join('');
                    }

                    visibleRepos.push({
                        url: repository.html_url,
                        name: repository.name,
                        description: repository.description,
                        starsCount: repository.stargazers_count || 0,
                        forksCount: repository.forks_count || 0,
                        colorClass,
                        languageName
                    });
                }
            }

            if (repositories && repositories.length) {
                //create HTML
                const repoGridHTML = repoGridTemplate({
                    repositories: visibleRepos
                });

                ulElement.innerHTML = repoGridHTML;
            }
        };

        const app = new App();
        app.loadData(function onDataLoaded() {
            console.log('[app] new data available, rendering...');

            if (app.ownerInfo) {
                document.querySelector('.github-url').setAttribute('href', app.ownerInfo.html_url);
                document.querySelector('.avatar').setAttribute('src', app.ownerInfo.avatar_url);
            }

            setupRepositories(app.repositories);
        });

        const $sideNav = $('.button-collapse');
        const mainElement = document.querySelector('.main');
        const sideNavElement = document.querySelector('nav.side-nav');
        const onEsc = function (event) {
            if (event && event.key && event.key.toLowerCase() === 'escape') {
                $sideNav.sideNav('hide');
            }
        };
        const setupSideNav = function () {
            $sideNav.sideNav('destroy');

            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            if ((viewportWidth > viewportHeight && viewportWidth >= 1000) || (screen.orientation && (screen.orientation.angle === 90 || screen.orientation.angle === -90) && viewportHeight >= 1000)) {
                sideNavElement.classList.add('fixed');
                mainElement.classList.add('desktop');
                $sideNav.addClass('hidden');
                window.removeEventListener('keydown', onEsc);
            } else {
                sideNavElement.classList.remove('fixed');
                mainElement.classList.remove('desktop');
                $sideNav.removeClass('hidden');
                window.addEventListener('keydown', onEsc);
            }

            $sideNav.sideNav();
        };
        setupSideNav();
        const throttledSetupSideNav = throttle(setupSideNav, 250);
        window.addEventListener('resize', throttledSetupSideNav);
        window.addEventListener('orientationchange', throttledSetupSideNav);

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
