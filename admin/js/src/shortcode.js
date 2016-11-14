/*
 * The "shortcode" directive of the VB dashboard.
 */



let shortcodeController = function($scope, $http) {
        $scope.ctrl = this;

        this.shortcode = function() {
            return '[shortcode]';
        }
    };


angular.module('vbAdmin.shortcode')
    .directive('shortcode', function() {
        return {
            restrict: 'E',
            transclude: false,
            scope: {},
            controller: shortcodeController,
            templateUrl: _vbPluginUrl + 'admin/js/src/shortcode.html',
            replace: true
        };
    })
