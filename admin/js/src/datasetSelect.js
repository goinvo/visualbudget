/*
 * The "dataset-select" directive of the VB dashboard.
 */


let datasetSelectController = function($scope, $http) {
        $scope.ctrl = this;
    };


angular.module('vbAdmin.datasetSelect')
    .directive('datasetSelect', function() {
        return {
            require: '^pane',
            restrict: 'E',
            transclude: false,
            scope: {},
            controller: datasetSelectController,
            templateUrl: _vbPluginUrl + 'admin/js/src/datasetSelect.html',
            replace: true
        };
    })
