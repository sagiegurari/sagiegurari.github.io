/*global navigator, fetch, location, $*/
import '../node_modules/fetch-ie8/fetch.js';
import AppController from './controller.js';
import repositoriesTemplate from './repositories.hbs';
import {
    throttle
} from './utils.js';

(function init() {
    $(function () {
        const repoGridTemplate = window.Handlebars.compile(repositoriesTemplate);

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

                        if (languageName === 'javascript') {
                            languageName = 'js';
                        }

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

        const app = new AppController();
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
                contentElement.scrollTop = 0;

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
