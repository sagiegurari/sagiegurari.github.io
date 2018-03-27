/*global $*/

import '../node_modules/fetch-ie8/fetch.js';
import AppController from './services/controller.js';
import RepositoriesComponent from './components/repositories/repositories.js';
import SideNavComponent from './components/sidenav/sidenav.js';
import ViewComponent from './components/view/view.js';

(function init() {
    $(function () {
        const components = [
            new SideNavComponent(),
            new ViewComponent(),
            new RepositoriesComponent()
        ];

        const app = new AppController();
        app.loadData(function onDataLoaded() {
            console.log('[app] new data available, rendering...');

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
    });
}());
