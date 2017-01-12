/*
 * The "pane" directive of the VB dashboard.
 */

let paneController = function($scope, $http, $timeout, datasetsService) {
        $scope.ctrl = this;
        let that = this;

        // These are the chart attributes.
        let atts = $scope.atts = {};

        // While loading, we provide filler data.
        let loading = true;
        $scope.chartData = {};
        $scope.datasets = [{
                id: 'loading...',
                uploaded_name: '[loading...]'
            }];
        $scope.chartData.dataset = $scope.datasets[0];
        $scope.atts.data = $scope.datasets[0].id;

        // Watch function for when new datasets are loaded.
        $scope.$watch(datasetsService.getCount, function(count) {
            $scope.datasets = datasetsService.getDatasets();
            if (loading) {
                loading = false;
                $scope.chartData.dataset = $scope.datasets[0];
                $scope.atts.data = $scope.datasets[0].id;

                if($scope.selected) {
                    $timeout(that.redrawCharts, 0);
                }
            }
        });

        let charts = $scope.charts = [];
        this.addChart = function(chart) {
            charts.push(chart);
        }

        let datasetSelect = $scope.datasetSelect = null;
        this.addDatasetSelect = function(select) {
            datasetSelect = select;
        }

        this.redrawCharts = function() {
            // Don't redraw charts if no datasets have been loaded.
            if(loading) { return; }

            for (let k = 0; k < $scope.charts.length; k++) {
                $http.get($scope.charts[k].ctrl.getUrl()).success( function(response) {
                    $scope.charts[k].ctrl.setHtml(response);

                    // On last iteration, re-initialize VB.
                    if (k == $scope.charts.length - 1) {
                        $timeout(visualbudget.initialize, 0);
                    }
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
            templateUrl: _vbPluginUrl + 'admin/js/templates/pane.html',
            replace: true,
            controller: paneController
        };
    })
