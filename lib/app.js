(function init() {
    'use strict';

    /*global fetch, location, $*/

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
        const setupRepositories = function (repositories) {
            const ulElement = document.querySelector('.page.projects .repo-grid');

            //remove old elements
            while (ulElement.firstChild) {
                ulElement.removeChild(ulElement.firstChild);
            }

            if (repositories && repositories.length) {
                const documentFragment = document.createDocumentFragment();

                for (let index = 0; index < repositories.length; index++) {
                    const repository = repositories[index];

                    if (!repository.fork && repository.name.toLowerCase().indexOf('test') === -1) {
                        const url = repository.html_url;
                        const name = repository.name;
                        const description = repository.description;
                        const starsCount = repository.stargazers_count || 0;
                        const forksCount = repository.forks_count || 0;

                        let colorClass;
                        let languageName = '';
                        if (repository.language) {
                            colorClass = 'github-color-' + repository.language.toLowerCase();

                            languageName = repository.language.toLowerCase();

                            if (languageName === 'js') {
                                languageName = 'javascript';
                            }

                            languageName = [
                                '(',
                                languageName,
                                ')'
                            ].join('');
                        }

                        const cardElement = document.createElement('div');
                        cardElement.classList.add('card');
                        cardElement.classList.add('small');
                        cardElement.classList.add('repo-card');
                        documentFragment.appendChild(cardElement);

                        const cardContent = document.createElement('div');
                        cardContent.classList.add('white-text-content');
                        cardContent.classList.add('small');
                        cardContent.classList.add('repo-card-content');
                        cardElement.appendChild(cardContent);

                        const cardHeader = document.createElement('header');
                        cardHeader.classList.add('repo-header');
                        cardContent.appendChild(cardHeader);

                        const languageIcon = document.createElement('span');
                        languageIcon.classList.add('circle');
                        if (colorClass) {
                            languageIcon.classList.add(colorClass);
                        }
                        cardHeader.appendChild(languageIcon);

                        const cardTitle = document.createElement('a');
                        cardTitle.setAttribute('href', url);
                        cardTitle.textContent = `${name} ${languageName}`;
                        cardHeader.appendChild(cardTitle);

                        const cardSummary = document.createElement('summary');
                        cardSummary.classList.add('repo-info');
                        cardSummary.textContent = description;
                        cardContent.appendChild(cardSummary);

                        const cardFooter = document.createElement('footer');
                        cardFooter.classList.add('repo-footer');
                        cardContent.appendChild(cardFooter);

                        [
                            {
                                classes: [
                                    'fas',
                                    'fa-star'
                                ],
                                count: starsCount
                            },
                            {
                                classes: [
                                    'fas',
                                    'fa-code-branch'
                                ],
                                count: forksCount
                            }
                        ].forEach(function (item) {
                            const wrapper = document.createElement('div');
                            wrapper.classList.add('repo-icon-wrapper');
                            cardFooter.appendChild(wrapper);

                            const iconElement = document.createElement('span');
                            iconElement.classList.add('repo-icon');
                            item.classes.forEach(function (className) {
                                iconElement.classList.add(className);
                            });
                            wrapper.appendChild(iconElement);

                            const counterElement = document.createElement('span');
                            counterElement.classList.add('repo-icon-text');
                            counterElement.textContent = item.count;
                            wrapper.appendChild(counterElement);
                        });
                    }
                }

                ulElement.appendChild(documentFragment);
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

            if ((viewportWidth > viewportHeight && viewportWidth >= 1000) || ((screen.orientation.angle === 90 || screen.orientation.angle === -90) && viewportHeight >= 1000)) {
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
