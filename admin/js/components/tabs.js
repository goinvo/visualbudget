/*
 * The "tabs" directive of the VB dashboard.
 */

tabsController = function($scope, $http) {
        var panes = $scope.panes = [];

        $scope.select = function(pane) {
            angular.forEach(panes, function(pane) {
                pane.selected = false;
            });
            pane.selected = true;
        }

        this.addPane = function(pane) {
            if (panes.length == 0) $scope.select(pane);
            panes.push(pane);
        }
    };


angular.module('components', [])
    .directive('tabs', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            controller: tabsController,
            template: 'tabs.html',
            replace: true
        };
    })
