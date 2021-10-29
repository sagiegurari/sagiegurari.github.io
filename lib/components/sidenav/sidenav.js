/*global $*/

import {
    throttle
} from '../../services/utils.js';
import M from '../../../node_modules/materialize-css/dist/js/materialize.js';

class SideNavComponent {
    init() {
        const mainElement = document.querySelector('.main');
        const sideNavElement = document.querySelector('.sidenav');
        let sideNav = M.Sidenav.init(sideNavElement, {});

        const isDesktopSize = () => {
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            return (viewportWidth > viewportHeight && viewportWidth >= 1000) || (screen.orientation && (screen.orientation.angle === 90 || screen.orientation.angle === -90) && viewportHeight >= 1000);
        };
        let desktopMode = isDesktopSize();

        const closeSideNav = () => {
            console.log('closeSideNav open:',sideNav.isOpen);//todo rmeo
            if (!sideNav.isOpen) {
                document.querySelector('.sidenav-overlay')?.click();
            }
            sideNav.close();
        };

        const onEsc = (event) => {
            if (event?.key?.toLowerCase() === 'escape') {
                closeSideNav();
            }
        };

        const setupSideNav = () => {
            desktopMode = isDesktopSize();

            if (desktopMode) {                
                sideNavElement.classList.add('sidenav-fixed');
                mainElement.classList.add('desktop');
                window.removeEventListener('keydown', onEsc);

                sideNav.open();
            } else {
                sideNavElement.classList.remove('sidenav-fixed');
                sideNavElement.classList.remove('hidden');
                mainElement.classList.remove('desktop');
                window.addEventListener('keydown', onEsc);

                closeSideNav();
            }
        };
        setupSideNav();

        const throttledSetupSideNav = throttle(setupSideNav, 250);
        window.addEventListener('resize', throttledSetupSideNav);
        window.addEventListener('orientationchange', throttledSetupSideNav);

        sideNavElement.addEventListener('click', (event) => {
            if (desktopMode) {
                return;
            }

            const target = event.target.closest('.side-link');

            if (target) {
                closeSideNav();
            }
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
