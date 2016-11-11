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
(function(vb, $) {

    let vbAdmin = angular.module('vbAdmin', [
        'vbAdmin.tabs'
        ]);

    vbAdmin.controller('vbController', function($scope, $http) {
        console.log('success')
    });

})(visualbudget, jQuery);