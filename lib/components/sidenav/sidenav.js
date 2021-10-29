/*global $*/

import {
    throttle
} from '../../services/utils.js';
import $ from '../../../node_modules/jquery/dist/jquery.js';
import M from '../../../node_modules/materialize-css/dist/js/materialize.js';

class SideNavComponent {
    init() {
        const $sideNav = $('.button-collapse');
        const mainElement = document.querySelector('.main');
        const sideNavElement = document.querySelector('nav.side-nav');
        const sideNav = M.Sidenav.init(sideNavElement, {});
        const onEsc = function (event) {
            if (event && event.key && event.key.toLowerCase() === 'escape') {
                sideNav.close();
            }
        };
        const setupSideNav = function () {
            sideNav.destroy();

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

            sideNav.open();
        };
        setupSideNav();
        const throttledSetupSideNav = throttle(setupSideNav, 250);
        window.addEventListener('resize', throttledSetupSideNav);
        window.addEventListener('orientationchange', throttledSetupSideNav);

        $('.side-nav').on('click', 'a', function () {
            sideNav.close();
        });
    }

    onData(appController = {}) {
        if (appController.ownerInfo) {
            document.querySelector('.github-url').setAttribute('href', appController.ownerInfo.html_url);
            document.querySelector('.avatar').setAttribute('src', appController.ownerInfo.avatar_url);
        }
    }
}

export default SideNavComponent;
