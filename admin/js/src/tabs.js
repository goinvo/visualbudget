/*
 * The "tabs" directive of the VB dashboard.
 */

let tabsController = function($scope, $http) {
        var panes = $scope.panes = [];

        $scope.select = function(pane) {
            angular.forEach(panes, function(pane) {
                pane.selected = false;
            });
            pane.selected = true;
            pane.ctrl.redrawCharts();
        }

        this.addPane = function(pane) {
            if (panes.length == 0) $scope.select(pane);
            panes.push(pane);
        }
    };


angular.module('vbAdmin.tabs')
    .directive('tabs', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: false,
            controller: tabsController,
            templateUrl: _vbPluginUrl + 'admin/js/src/tabs.html',
            replace: true
        };
    })
