import repositoriesTemplate from './repositories.hbs';
import Handlebars from '../../../node_modules/handlebars/dist/handlebars.js';

const repoGridTemplate = Handlebars.compile(repositoriesTemplate);

class RepositoriesComponent {
    onData(appController = {}) {
        const repositories = appController.repositories || [];

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
    }
}

export default RepositoriesComponent;
