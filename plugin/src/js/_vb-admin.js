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
                        next_meta.type = 'Uploaded file name';
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

        // Also load the aliases.
        let alises_url = _vbPluginUrl + 'vis/aliases.json';
        $http.get(alises_url).success( function(aliases) {
            console.log(aliases);
            for(let alias in aliases) {
                let metadata = {
                    id: alias,
                    uploaded_name: alias,
                    type: 'Aliases'
                };
                $timeout(function() {
                    $rootScope.$broadcast('ajax.newDataset', metadata);
                });
            }
        });

    });

})(visualbudget, jQuery, angular);