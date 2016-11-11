'use strict';

/**
 * This file controls the visualization editor. It works on top of vb.js inside
 * of the admin dashboard.
 */

// The _vbAdminGlobal is set by wp_localize_script() in the vb admin php file.
var _vbPluginUrl = _vbAdminGlobal.vbPluginUrl;

angular.module('vbAdmin.tabs', []);

/**
 * Kick it off.
 */
(function (vb, $) {

    var vbAdmin = angular.module('vbAdmin', ['vbAdmin.tabs']);

    vbAdmin.controller('vbController', function ($scope, $http) {
        console.log('success');
    });
})(visualbudget, jQuery);
'use strict';

/*
 * The "pane" directive of the VB dashboard.
 */

var paneController = function paneController($scope) {
    $scope.ctrl = this;
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
