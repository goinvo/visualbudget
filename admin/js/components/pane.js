/*
 * The "pane" directive of the VB dashboard.
 */

paneController = function($scope) {
        $scope.ctrl = this;
    };


paneLinkFunction = function(scope, element, attrs, tabsController) {
        tabsController.addPane(scope);
    };


angular.module('components', [])
    .directive('pane', function() {
        return {
            require: '^tabs',
            restrict: 'E',
            transclude: true,
            scope: { title: '@' },
            link: paneLinkFunction,
            template: 'pane.html',
            replace: true,
            controller: paneController
        };
    })
