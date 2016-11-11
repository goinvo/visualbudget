/*
 * The "pane" directive of the VB dashboard.
 */

let paneController = function($scope) {
        $scope.ctrl = this;
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
            // controller: paneController
        };
    })
