/*
 * The "chart" directive of the VB dashboard.
 */

let chartController = function($scope, $http, $sce) {
        $scope.ctrl = this;
        let that = this;

        let chartUrl = _vbPluginUrl + 'vis/vis.php?';

        this.getUrl = function() {
            $scope.$parent.$parent.atts.vis = $scope.vis;
            let atts = angular.copy($scope.$parent.$parent.atts);
            if ($scope.metric) {
                atts.metric = $scope.metric;
            }

            return chartUrl + that.serialize(atts);
            // return '[' + chartUrl + that.serialize(atts) + ']';
        }

        this.setHtml = function(html) {
            $scope.html = $sce.trustAsHtml(html);
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


let chartLinkFunction = function(scope, element, attrs, paneController) {
        paneController.addChart(scope);
    };


angular.module('vbAdmin.chart')
    .directive('chart', function() {
        return {
            require: '^pane',
            restrict: 'E',
            transclude: false,
            scope: { vis: '@', metric: '@' },
            link: chartLinkFunction,
            controller: chartController,
            templateUrl: _vbPluginUrl + 'admin/js/templates/chart.html',
            replace: true
        };
    })
