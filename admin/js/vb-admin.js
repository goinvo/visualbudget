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
        var datasets = $scope.datasets = [];
        var ids_url = _vbPluginUrl + 'vis/api.php?filter=id';

        /*
        // First load all dataset IDs.
        $http.get(ids_url).success( function(ids) {
            // Function to fetch metadata given a dataset ID.
            function fetchMetaFromId(id) {
                let next_meta_url = _vbPluginUrl + 'vis/api.php?filename=' + id + '_meta.json';
                let req = $http.get(next_meta_url).success( function(next_meta) {
                    datasets.push(next_meta);
                });
                return req;
            }
            // Then fetch metadata for all datasets.
            $.when.apply($, $.map(ids, fetchMetaFromId))
                .done(function() {
                    $scope.datasets = datasets;
                    // console.log(datasets.length)
                });
        });
        */

        $scope.datasets = [{
            id: '1477929661',
            filename: '1477929661.json',
            uploaded_filename: 'expenses.csv'
        }, {
            id: '1477929681',
            filename: '1477929681.json',
            uploaded_filename: 'revenues.csv'
        }, {
            id: '1477930003',
            filename: '1477930003.json',
            uploaded_filename: 'funds.csv'
        }];
    });
})(visualbudget, jQuery);
'use strict';

/*
 * The "chart" directive of the VB dashboard.
 */

var chartController = function chartController($scope, $http) {
    $scope.ctrl = this;

    var chartUrl = _vbPluginUrl + 'vis/vis.php?';

    this.chartHtml = function () {
        return '[' + chartUrl + ']';
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
        scope: {
            vis: '=vis'
        },
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
};

angular.module('vbAdmin.datasetSelect').directive('datasetSelect', function () {
    return {
        require: '^pane',
        restrict: 'E',
        transclude: false,
        scope: {},
        controller: datasetSelectController,
        templateUrl: _vbPluginUrl + 'admin/js/src/datasetSelect.html',
        replace: true
    };
});
'use strict';

/*
 * The "pane" directive of the VB dashboard.
 */

var paneController = function paneController($scope) {
    $scope.ctrl = this;

    // Hardcoded for the moment, to get the infrastructure working.
    $scope.datasets = [{
        id: '1477929661',
        filename: '1477929661.json',
        uploaded_filename: 'expenses.csv'
    }, {
        id: '1477929681',
        filename: '1477929681.json',
        uploaded_filename: 'revenues.csv'
    }, {
        id: '1477930003',
        filename: '1477930003.json',
        uploaded_filename: 'funds.csv'
    }];

    var charts = $scope.charts = [];
    this.addChart = function (chart) {
        charts.push(chart);
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
        return '[shortcode]';
    };
};

angular.module('vbAdmin.shortcode').directive('shortcode', function () {
    return {
        restrict: 'E',
        transclude: false,
        scope: {},
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
        scope: {},
        controller: tabsController,
        templateUrl: _vbPluginUrl + 'admin/js/src/tabs.html',
        replace: true
    };
});
