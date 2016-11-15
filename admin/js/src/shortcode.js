/*
 * The "shortcode" directive of the VB dashboard.
 */



let shortcodeController = function($scope, $http) {
        $scope.ctrl = this;

        this.shortcode = function() {
            let atts = $scope.$parent.$parent.atts;
            atts.metric = $scope.metric;
            return '[visualbudget ' + this.serialize(atts) + ']';
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
            scope: { metric: '@' },
            controller: shortcodeController,
            templateUrl: _vbPluginUrl + 'admin/js/src/shortcode.html',
            replace: true
        };
    })
