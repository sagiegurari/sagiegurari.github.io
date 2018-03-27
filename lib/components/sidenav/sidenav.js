/*global $*/

import {
    throttle
} from '../../services/utils.js';

class SideNavComponent {
    init() {
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
    }
}

export default SideNavComponent;
