/**
 * This file controls the visualization editor. It works on top of vb.js inside
 * of the admin dashboard.
 */


// The _vbAdminGlobal is set by wp_localize_script() in the vb admin php file.
let _vbPluginUrl = _vbAdminGlobal.vbPluginUrl;
let _vbUploadDir = _vbAdminGlobal.vbUploadDir;
let _vbAliasesFileUrl = _vbAdminGlobal.vbAliasesFileUrl;
let _vbConfigFileUrl = _vbAdminGlobal.vbConfigFileUrl;
let $ = jQuery;

// Initialize all modules.
angular.module('vbAdmin.tabs', []);
angular.module('vbAdmin.chart', []);
angular.module('vbAdmin.datasetSelect', []);
angular.module('vbAdmin.shortcode', []);
angular.module('vbAdmin.iframelink', []);

/**
 * Kick it off.
 */
(function(vb,$,angular) {

    let _vbPluginUrl = _vbAdminGlobal.vbPluginUrl;
    let _vbUploadDir = _vbAdminGlobal.vbUploadDir;
    let _vbAliasesFileUrl = _vbAdminGlobal.vbAliasesFileUrl;
    let _vbConfigFileUrl = _vbAdminGlobal.vbConfigFileUrl;

    let vbAdmin = angular.module('vbAdmin', [
        'vbAdmin.tabs',
        'vbAdmin.chart',
        'vbAdmin.datasetSelect',
        'vbAdmin.shortcode',
        'vbAdmin.iframelink'
        ]);

    vbAdmin.factory("datasetsService", function($http, $timeout) {
        let count = 0;
        let datasets = [];

        // Function to load all datasets via Ajax calls.
        function loadDatasets() {

            // Load the aliases.
            let aliases_url = _vbAliasesFileUrl;
            $http.get(aliases_url).success( function(aliases) {
                for(let alias in aliases) {
                    let metadata = {
                        id: alias,
                        uploaded_name: alias,
                        type: 'Aliases'
                    };

                    addDataset(metadata);
                }
            });

            // And load all dataset IDs.
            let ids_url = _vbPluginUrl + 'vis/api.php?filter=id';
            $http.get(ids_url).success( function(ids) {

                // Function to fetch metadata given a dataset ID.
                function fetchMetaFromId(id) {
                    let next_meta_url = _vbPluginUrl + 'vis/api.php?filename=' + id + '_meta.json';
                    let req = $http.get(next_meta_url).success( function(next_meta) {
                        next_meta.type = 'Uploaded file names';
                        addDataset(next_meta);
                    });
                    return req;
                }

                // Then fetch metadata for all datasets.
                $.apply($, $.map(ids, fetchMetaFromId));
            });

        }

        function addDataset(meta) {
            datasets.push(meta);
            count = count + 1;
        }

        function getCount() {
            return count;
        }

        function getDatasets() {
            return datasets;
        }

        return {
            getCount: getCount,
            getDatasets: getDatasets,
            loadDatasets: loadDatasets
        }
    });

    vbAdmin.controller('vbController', function($scope, datasetsService) {
        console.log('vbController running.');
        datasetsService.loadDatasets();
    });

})(visualbudget, jQuery, angular);