/*
 * The "pane" directive of the VB dashboard.
 */

let paneController = function($scope, $http) {
        $scope.ctrl = this;

        // Hardcoded for the moment, to get the infrastructure working.
        $scope.datasets = $scope.$parent.datasets;

        let atts = $scope.atts = {};

        let charts = $scope.charts = [];
        this.addChart = function(chart) {
            charts.push(chart);
        }

        let datasetSelect = $scope.datasetSelect = null;
        this.addDatasetSelect = function(select) {
            datasetSelect = select;
        }

        this.redrawCharts = function() {
            for (let k = 0; k < $scope.charts.length; k++) {
                $http.get($scope.charts[k].ctrl.getUrl()).success( function(response) {
                    $scope.charts[k].ctrl.setHtml(response);
                    setTimeout(visualbudget.initialize, 0);
                });
            }
        }

    };


let paneLinkFunction = function(scope, element, attrs, tabsController) {
        tabsController.addPane(scope);
    };


angular.module('vbAdmin.tabs')
    .directive('pane', function() {
        return {
            require: '^tabs',
            restrict: 'E',
            transclude: true,
            scope: { title: '@' },
            link: paneLinkFunction,
            templateUrl: _vbPluginUrl + 'admin/js/src/pane.html',
            replace: true,
            controller: paneController
        };
    })
