angular.module('siteApp', ['ngMaterial', 'ngRoute'], function ($interpolateProvider) {
    'use strict';

    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/#/cv", {}).otherwise({});
}]).controller('siteController', ['$scope', '$location', function ($scope, $location) {
    'use strict';

    $scope.repositories = (window.githubInfo || window.testInfo || []).sort(function (repo1, repo2) {
        var output = repo2.stargazers_count - repo1.stargazers_count;

        if (!output) {
            output = repo2.forks_count - repo1.forks_count;
        }

        return output;
    });

    var index;
    for (index = 0; index < $scope.repositories.length; index++) {
        if (!$scope.repositories[index].fork) {
            $scope.ownerInfo = $scope.repositories[index].owner;
            break;
        }
    }

    $scope.getLanguageColor = function (repository) {
        if (repository && repository.language) {
            return 'github-color-' + repository.language.toLowerCase();
        }

        return '';
    };

    $scope.$watch(function () {
        return $location.path();
    }, function (state) {
        $scope.state = state;
    });
}]).directive('mainContent', function () {
    return {
        restrict: 'C',
        link: function (scope, element) {
            scope.toggleSideNav = function () {
                var $nav = element.find('.sidenav-container');
                console.debug($nav.length )//TODO RMOVE

                if ($nav.hasClass('closed')) {
                    $nav.removeClass('closed');
                } else {
                    $nav.addClass('closed');
                }
            };
        }
    };
}).directive('navLink', function () {
    return {
        restrict: 'C',
        scope: true,
        link: function (scope, element) {
            scope.openLink = function () {
                setTimeout(function () {
                    element.find('.nav-link')[0].click();
                });
            }
        }
    };
});
