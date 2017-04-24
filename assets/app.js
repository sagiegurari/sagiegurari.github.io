angular.module('siteApp', ['ngMaterial', 'ngRoute'], function ($interpolateProvider) {
    'use strict';

    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/#/resume", {}).otherwise({});
}]).service('dataLoader', function () {
    var callback;
    var data = {
        githubInfo: (window.githubInfo || window.testInfo || [])
    };

    $.getJSON('https://api.github.com/users/sagiegurari/repos', function (apiData) {
        if (apiData && Array.isArray(apiData) && apiData.length) {
            data.githubInfo = apiData;
            callback(data);
        }
    });

    return {
        get: function (listener) {
            callback = listener;

            callback(data);
        }
    };
}).controller('siteController', ['$scope', '$location', 'dataLoader', function ($scope, $location, dataLoader) {
    'use strict';

    dataLoader.get(function (data) {
        setTimeout(function () {
            $scope.appData = data;
            $scope.$digest();
        }, 0);
    });

    $scope.$watch('appData.githubInfo', function (value) {
        if (value && Array.isArray(value) && value.length) {
            //clone data
            value = JSON.parse(JSON.stringify(value));
            
            $scope.repositories = value.sort(function (repo1, repo2) {
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
        }
    }, true);

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

    $scope.isInState = function (name) {
        var inState = false;

        if (name && $scope.state) {
            inState = $scope.state.toLowerCase().indexOf(name.toLowerCase()) !== -1;
        } else if (!name) {
            inState = true;

            if ($scope.state) {
                inState = ($scope.state === '/');
            }
        }

        return inState;
    }
}]).directive('site', function () {
    return {
        restrict: 'C',
        link: function (scope, element) {
            setTimeout(function () {
                element.removeClass('hidden');
            }, 1500);
        },
        controller: 'siteController' 
    };
}).directive('mainContent', function () {
    return {
        restrict: 'C',
        link: function (scope, element) {
            var timeoutID;
            var $page;

            var cleanup = function () {
                if (timeoutID) {
                    clearTimeout(timeoutID);
                    timeoutID = null;
                }

                if ($page) {
                    $page.css('width', '');
                    $page = null;
                }
            };

            var setupForAnimation = function () {
                cleanup();

                $page = element.find('.page.persist-width:not(.hidden)');
                if ($page.length) {
                    $page = $page.first();
                    var width = $page.width();

                    if (width) {
                        $page.css('width', width + 'px');

                        timeoutID = setTimeout(cleanup, 310);
                    }
                } else {
                    $page = null;
                }
            };

            var expand = function ($nav) {
                setupForAnimation();
                $nav.removeClass('closed');
            };

            var collapse = function ($nav) {
                setupForAnimation();
                $nav.addClass('closed');
            };

            scope.toggleSideNav = function () {
                var $nav = element.find('.sidenav-container');

                if ($nav.hasClass('closed')) {
                    expand($nav);
                } else {
                    collapse($nav);
                }
            };

            var onOrientationChange = function (event) {
                var $nav = element.find('.sidenav-container');

                if (event.matches) {
                    collapse($nav);
                } else {
                    expand($nav);
                }
            };

            var portraitMQL = window.matchMedia("(orientation: portrait)");
            portraitMQL.addListener(onOrientationChange);
            onOrientationChange(portraitMQL);
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
                }, 0);
            }
        }
    };
}).directive('page', function () {
    return {
        restrict: 'C',
        link: function (scope, element) {
            var timeoutID;

            scope.$watch(function () {
                var stateName = element.attr('state-name');

                return scope.isInState(stateName);
            }, function (show) {
                clearTimeout(timeoutID);
                timeoutID = null;

                if (show) {
                    element.removeClass('hidden');

                    element.removeClass('hide-page');
                    element.addClass('show-page');
                } else {
                    element.removeClass('show-page');
                    element.addClass('hide-page');

                    timeoutID = setTimeout(function () {
                        element.addClass('hidden');
                    }, 500);
                }
            });
        }
    };
});
