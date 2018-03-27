import DataLoader from './data-loader.js';

class AppController {
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

export default AppController;
