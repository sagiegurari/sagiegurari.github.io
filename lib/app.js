/*global navigator, fetch, location, $*/
import '../node_modules/fetch-ie8/fetch.js';
import AppController from './services/controller.js';
import RepositoriesComponent from './components/repositories/repositories.js';
import SideNavComponent from './components/sidenav/sidenav.js';

(function init() {
    $(function () {
        const components = [
            new SideNavComponent(),
            new RepositoriesComponent()
        ];

        const app = new AppController();
        app.loadData(function onDataLoaded() {
            console.log('[app] new data available, rendering...');

            if (app.ownerInfo) {
                document.querySelector('.github-url').setAttribute('href', app.ownerInfo.html_url);
                document.querySelector('.avatar').setAttribute('src', app.ownerInfo.avatar_url);
            }

            for (let index = 0; index < components.length; index++) {
                const component = components[index];

                if (component.onData) {
                    component.onData(app);
                }
            }
        });

        for (let index = 0; index < components.length; index++) {
            const component = components[index];

            if (component.init) {
                component.init(app);
            }
        }

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
