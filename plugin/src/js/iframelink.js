/*
 * The "iframelink" directive of the VB dashboard.
 */


let iframelinkController = function($scope, $http) {
        $scope.ctrl = this;

        this.iframelink = function() {
            let atts = angular.copy($scope.$parent.$parent.atts);
            if ($scope.metric) {
                atts.metric = $scope.metric;
            }
            atts.iframe = 1;

            return _vbPluginUrl + 'vis/vis.php?' + this.serialize(atts);
        }

        // Turn a JS object into a query string of some form.
        // based on code from  http://stackoverflow.com/a/1714899
        this.serialize = function(obj) {
            let sep = '&';
            let str = [];
            for(var p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            return str.join(sep);
        }
    };


angular.module('vbAdmin.iframelink')
    .directive('iframelink', function() {
        return {
            restrict: 'E',
            transclude: false,
            scope: { metric: '@', explain: '@' },
            controller: iframelinkController,
            templateUrl: _vbPluginUrl + 'admin/js/templates/iframelink.html',
            replace: true
        };
    })
