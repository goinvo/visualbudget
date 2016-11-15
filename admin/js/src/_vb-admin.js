/**
 * This file controls the visualization editor. It works on top of vb.js inside
 * of the admin dashboard.
 */


// The _vbAdminGlobal is set by wp_localize_script() in the vb admin php file.
let _vbPluginUrl = _vbAdminGlobal.vbPluginUrl;

// Initialize all modules.
angular.module('vbAdmin.tabs', []);
angular.module('vbAdmin.chart', []);
angular.module('vbAdmin.datasetSelect', []);
angular.module('vbAdmin.shortcode', []);

/**
 * Kick it off.
 */
(function(vb,$,angular) {

    let _vbPluginUrl = _vbAdminGlobal.vbPluginUrl;

    let vbAdmin = angular.module('vbAdmin', [
        'vbAdmin.tabs',
        'vbAdmin.chart',
        'vbAdmin.datasetSelect',
        'vbAdmin.shortcode'
        ]);

    vbAdmin.controller('vbController', function($scope, $http, $rootScope, $timeout) {
        console.log('vbController running.');

        // We'll collect metadata of datasets here.
        let ids_url = _vbPluginUrl + 'vis/api.php?filter=id';

        // First load all dataset IDs.
        $http.get(ids_url).success( function(ids) {

            // Function to fetch metadata given a dataset ID.
            function fetchMetaFromId(id) {
                let next_meta_url = _vbPluginUrl + 'vis/api.php?filename=' + id + '_meta.json';
                let req = $http.get(next_meta_url).success( function(next_meta) {
                    $timeout(function() {
                        $rootScope.$broadcast('ajax.newDataset', next_meta);
                    });
                });
                return req;
            }
            // Then fetch metadata for all datasets.
            $.when.apply($, $.map(ids, fetchMetaFromId))
                .done(function() {
                    // $scope.datasets = datasets;
                    // console.log(datasets.length)
                });
        });

    });

})(visualbudget, jQuery, angular);