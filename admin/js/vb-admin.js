'use strict';

/**
 * This file controls the visualization editor. It works on top of vb.js inside
 * of the admin dashboard.
 */

// The _vbAdminGlobal is set by wp_localize_script() in the vb admin php file.
var _vbPluginUrl = _vbAdminGlobal.vbPluginUrl;

angular.module('vbAdmin.tabs', []);
angular.module('vbAdmin.chart', []);
angular.module('vbAdmin.datasetSelect', []);
angular.module('vbAdmin.shortcode', []);

/**
 * Kick it off.
 */
(function (vb, $) {

    var _vbPluginUrl = _vbAdminGlobal.vbPluginUrl;

    var vbAdmin = angular.module('vbAdmin', ['vbAdmin.tabs', 'vbAdmin.chart', 'vbAdmin.datasetSelect', 'vbAdmin.shortcode']);

    vbAdmin.controller('vbController', function ($scope, $http) {
        console.log('vbController running.');

        // We'll collect metadata of datasets here.
        var datasets = [];
        var ids_url = _vbPluginUrl + 'vis/api.php?filter=id';

        $scope.chartData = {};

        $scope.datasets = [{
            id: '',
            filename: '#',
            uploaded_name: 'loading...'
        }];

        // First load all dataset IDs.
        $http.get(ids_url).success(function (ids) {
            $scope.datasets = [];

            // Function to fetch metadata given a dataset ID.
            function fetchMetaFromId(id) {
                var next_meta_url = _vbPluginUrl + 'vis/api.php?filename=' + id + '_meta.json';
                var req = $http.get(next_meta_url).success(function (next_meta) {
                    $scope.datasets.push(next_meta);
                    if ($scope.datasets.length == 1) {
                        $scope.chartData.dataset = $scope.datasets[0];
                    }
                });
                return req;
            }
            // Then fetch metadata for all datasets.
            $.when.apply($, $.map(ids, fetchMetaFromId)).done(function () {
                // $scope.datasets = datasets;
                // console.log(datasets.length)
            });
        });
    });
})(visualbudget, jQuery);
'use strict';

/*
 * The "chart" directive of the VB dashboard.
 */

var chartController = function chartController($scope, $http, $sce) {
    $scope.ctrl = this;
    var that = this;

    var chartUrl = _vbPluginUrl + 'vis/vis.php?';

    this.getUrl = function () {
        var atts = $scope.$parent.$parent.atts;
        atts.vis = $scope.vis;
        if ($scope.metric) {
            atts.metric = $scope.metric;
        }

        return chartUrl + that.serialize(atts);
        // return '[' + chartUrl + that.serialize(atts) + ']';
    };

    this.setHtml = function (html) {
        $scope.html = $sce.trustAsHtml(html);
    };

    // Turn a JS object into a query string of some form.
    // based on code from  http://stackoverflow.com/a/1714899
    this.serialize = function (obj) {
        var sep = '&';
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        }return str.join(sep);
    };
};

var chartLinkFunction = function chartLinkFunction(scope, element, attrs, paneController) {
    paneController.addChart(scope);
};

angular.module('vbAdmin.chart').directive('chart', function () {
    return {
        require: '^pane',
        restrict: 'E',
        transclude: false,
        scope: { vis: '@', metric: '@' },
        link: chartLinkFunction,
        controller: chartController,
        templateUrl: _vbPluginUrl + 'admin/js/src/chart.html',
        replace: true
    };
});
'use strict';

/*
 * The "dataset-select" directive of the VB dashboard.
 */

var datasetSelectController = function datasetSelectController($scope, $http) {
    $scope.ctrl = this;

    $scope.$parent.chartData = {};
    $scope.$parent.chartData.dataset = $scope.$parent.datasets[0];

    $scope.setDataset = function () {
        $scope.$parent.atts.data = $scope.$parent.chartData.dataset.id;
        $scope.$parent.ctrl.redrawCharts();
    };

    $scope.setDataset();
};

var datasetSelectLinkFunction = function datasetSelectLinkFunction(scope, element, attrs, paneController) {
    paneController.addDatasetSelect(scope);
};

angular.module('vbAdmin.datasetSelect').directive('datasetSelect', function () {
    return {
        require: '^pane',
        restrict: 'E',
        transclude: false,
        scope: false,
        link: datasetSelectLinkFunction,
        controller: datasetSelectController,
        templateUrl: _vbPluginUrl + 'admin/js/src/datasetSelect.html',
        replace: true
    };
});
'use strict';

/*
 * The "pane" directive of the VB dashboard.
 */

var paneController = function paneController($scope, $http) {
    $scope.ctrl = this;

    // Hardcoded for the moment, to get the infrastructure working.
    $scope.datasets = $scope.$parent.datasets;

    var atts = $scope.atts = {};

    var charts = $scope.charts = [];
    this.addChart = function (chart) {
        charts.push(chart);
    };

    var datasetSelect = $scope.datasetSelect = null;
    this.addDatasetSelect = function (select) {
        datasetSelect = select;
    };

    this.redrawCharts = function () {
        var _loop = function _loop(k) {
            $http.get($scope.charts[k].ctrl.getUrl()).success(function (response) {
                $scope.charts[k].ctrl.setHtml(response);
                setTimeout(visualbudget.initialize, 200);
            });
        };

        for (var k = 0; k < $scope.charts.length; k++) {
            _loop(k);
        }
    };
};

var paneLinkFunction = function paneLinkFunction(scope, element, attrs, tabsController) {
    tabsController.addPane(scope);
};

angular.module('vbAdmin.tabs').directive('pane', function () {
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
});
'use strict';

/*
 * The "shortcode" directive of the VB dashboard.
 */

var shortcodeController = function shortcodeController($scope, $http) {
    $scope.ctrl = this;

    this.shortcode = function () {
        return '[visualbudget ' + this.serialize($scope.$parent.atts) + ']';
    };

    // Turn a JS object into a query string of some form.
    // based on code from  http://stackoverflow.com/a/1714899
    this.serialize = function (obj) {
        var sep = ' ';
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        }return str.join(sep);
    };
};

angular.module('vbAdmin.shortcode').directive('shortcode', function () {
    return {
        restrict: 'E',
        transclude: false,
        scope: false,
        controller: shortcodeController,
        templateUrl: _vbPluginUrl + 'admin/js/src/shortcode.html',
        replace: true
    };
});
'use strict';

/*
 * The "tabs" directive of the VB dashboard.
 */

var tabsController = function tabsController($scope, $http) {
    var panes = $scope.panes = [];

    $scope.select = function (pane) {
        angular.forEach(panes, function (pane) {
            pane.selected = false;
        });
        pane.selected = true;
        pane.ctrl.redrawCharts();
    };

    this.addPane = function (pane) {
        if (panes.length == 0) $scope.select(pane);
        panes.push(pane);
    };
};

angular.module('vbAdmin.tabs').directive('tabs', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: false,
        controller: tabsController,
        templateUrl: _vbPluginUrl + 'admin/js/src/tabs.html',
        replace: true
    };
});
