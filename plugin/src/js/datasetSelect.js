/*
 * The "dataset-select" directive of the VB dashboard.
 */


let datasetSelectController = function($scope, $http) {
        $scope.ctrl = this;

        // $scope.$parent.chartData = {};
        // $scope.$parent.chartData.dataset = $scope.$parent.datasets[0];

        $scope.setDataset = function() {
            $scope.$parent.atts.data = $scope.$parent.chartData.dataset.id;
            $scope.$parent.ctrl.redrawCharts();
        }

        $scope.setDataset();
    };

let datasetSelectLinkFunction = function(scope, element, attrs, paneController) {
        paneController.addDatasetSelect(scope);
    };


angular.module('vbAdmin.datasetSelect')
    .directive('datasetSelect', function() {
        return {
            require: '^pane',
            restrict: 'E',
            transclude: false,
            scope: false,
            link: datasetSelectLinkFunction,
            controller: datasetSelectController,
            templateUrl: _vbPluginUrl + 'admin/js/templates/datasetSelect.html',
            replace: true
        };
    });
