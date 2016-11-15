/*
 * The "pane" directive of the VB dashboard.
 */

let paneController = function($scope, $http, $timeout) {
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

        // This happens when a new dataset is broadcast down
        // from vbAdmin.
        let addDataset = function(event, metadata) {
            if (loading) {
                loading = false;
                $scope.datasets = [metadata];
                $scope.chartData.dataset = $scope.datasets[0];
                $scope.atts.data = metadata.id;

                if($scope.selected) {
                    $timeout(that.redrawCharts, 0);
                }
            } else {
                $scope.datasets.push(metadata);
            }
        }
        // Bind the event.
        $scope.$on('ajax.newDataset', addDataset);

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
                    $timeout(visualbudget.initialize, 0);
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
