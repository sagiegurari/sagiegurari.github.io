class ViewComponent {
    init() {
        const contentElement = document.querySelector('div.content');

        let currentView;
        const allPages = document.querySelectorAll('.page');
        const views = {};
        [
            'projects',
            'resume'
        ].forEach((view) => {
            const viewElement = document.querySelector(`.page.${view}`);

            views[view] = {
                view,
                viewElement
            };
        });

        const changeView = () => {
            if (currentView) {
                contentElement.classList.remove(currentView.view);
                contentElement.scrollTop = 0;

                allPages.forEach(page => {
                    page.classList.remove('show');
                    page.classList.remove('hidden');
                });
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
            setTimeout(() => {
                allPages.forEach(page => {
                    if (!page.classList.contains('show')) {
                        page.classList.add('hidden');
                    }
                });
            }, 500);
        };
        window.addEventListener('hashchange', changeView);
        changeView();
    }
}

export default ViewComponent;
