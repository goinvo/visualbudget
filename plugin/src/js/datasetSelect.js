/*
 * The "dataset-select" directive of the VB dashboard.
 */


let datasetSelectController = function($scope, $http, $attrs) {
        $scope.ctrl = this;
        $scope.multiple = ('multiple' in $attrs);
        if($scope.multiple) {
            $scope.$emit('addSecondDefaultSelectedDataset');
        }

        $scope.setDataset = function() {
            $scope.$parent.atts.data = $scope.multiple
                ? $scope.$parent.chartData.datasets.map(e => e.id).join(',')
                : $scope.$parent.chartData.dataset.id;

            // Redraw only if this pane is selected.
            if ($scope.$parent.selected) {
                $scope.$parent.ctrl.redrawCharts();
            }
        }
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
