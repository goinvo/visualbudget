/*
 * The "shortcode" directive of the VB dashboard.
 */



let shortcodeController = function($scope, $http) {
        $scope.ctrl = this;

        this.shortcode = function() {
            let atts = angular.copy($scope.$parent.$parent.atts);
            if ($scope.metric) {
                atts.metric = $scope.metric;
            }

            return '[visualbudget ' + this.serialize(atts) + ']';
        }

        // Turn a JS object into a query string of some form.
        // based on code from  http://stackoverflow.com/a/1714899
        this.serialize = function(obj) {
            let sep = ' ';
            let str = [];
            for(let p in obj)
                if (obj.hasOwnProperty(p)) {
                    let prop = encodeURIComponent(p);
                    let val = encodeURIComponent(obj[p]).replace(/%2C/g,","); // Commas abide.
                    str.push(prop + "=" + val);
                }
            return str.join(sep);
        }
    };


angular.module('vbAdmin.shortcode')
    .directive('shortcode', function() {
        return {
            restrict: 'E',
            transclude: false,
            scope: { metric: '@', explain: '@' },
            controller: shortcodeController,
            templateUrl: _vbPluginUrl + 'admin/js/templates/shortcode.html',
            replace: true
        };
    })
