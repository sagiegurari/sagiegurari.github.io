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

                        //const starsCount = repository.stargazers_count || 0;

                        //const forksCount = repository.forks_count || 0;

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
                    }
                }

                ulElement.appendChild(documentFragment);
            }
        };

        const app = new App();
        app.loadData(function onDataLoaded() {
            if (app.ownerInfo) {
                document.querySelector('.github-url').setAttribute('href', app.ownerInfo.html_url);
                document.querySelector('.avatar').setAttribute('src', app.ownerInfo.avatar_url);
            }

            setupRepositories(app.repositories);
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
