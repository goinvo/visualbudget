/*
 * The "pane" directive of the VB dashboard.
 */

let paneController = function($scope) {
        $scope.ctrl = this;

        // Hardcoded for the moment, to get the infrastructure working.
        $scope.datasets = [
            {
                id: '1477929661',
                filename: '1477929661.json',
                uploaded_filename: 'expenses.csv'
            },
            {
                id: '1477929681',
                filename: '1477929681.json',
                uploaded_filename: 'revenues.csv'
            },
            {
                id: '1477930003',
                filename: '1477930003.json',
                uploaded_filename: 'funds.csv'
            }
        ];

        let charts = $scope.charts = [];
        this.addChart = function(chart) {
            charts.push(chart);
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
