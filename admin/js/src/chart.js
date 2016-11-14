/*
 * The "chart" directive of the VB dashboard.
 */

let chartController = function($scope, $http) {
        $scope.ctrl = this;

        let chartUrl = _vbPluginUrl + 'vis/vis.php?';

        this.chartHtml = function() {
            return '[' + chartUrl + ']';
        }
    };


let chartLinkFunction = function(scope, element, attrs, paneController) {
        paneController.addChart(scope);
    };



angular.module('vbAdmin.chart')
    .directive('chart', function() {
        return {
            require: '^pane',
            restrict: 'E',
            transclude: false,
            scope: {
                vis: '=vis'
            },
            link: chartLinkFunction,
            controller: chartController,
            templateUrl: _vbPluginUrl + 'admin/js/src/chart.html',
            replace: true
        };
    })
