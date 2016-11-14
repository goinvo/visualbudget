/*
 * The "shortcode" directive of the VB dashboard.
 */



let shortcodeController = function($scope, $http) {
        $scope.ctrl = this;

        this.shortcode = function() {
            return '[visualbudget ' + this.serialize($scope.$parent.atts) + ']';
        }

        // Turn a JS object into a query string of some form.
        // based on code from  http://stackoverflow.com/a/1714899
        this.serialize = function(obj) {
            let sep = ' ';
            let str = [];
            for(var p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            return str.join(sep);
        }
    };


angular.module('vbAdmin.shortcode')
    .directive('shortcode', function() {
        return {
            restrict: 'E',
            transclude: false,
            scope: false,
            controller: shortcodeController,
            templateUrl: _vbPluginUrl + 'admin/js/src/shortcode.html',
            replace: true
        };
    })
