/**
 * This file controls the visualization editor. It works on top of vb.js inside
 * of the admin dashboard.
 */


// The _vbAdminGlobal is set by wp_localize_script() in the vb admin php file.
let _vbPluginUrl = _vbAdminGlobal.vbPluginUrl;

angular.module('vbAdmin.tabs', []);
angular.module('vbAdmin.chart', []);
angular.module('vbAdmin.datasetSelect', []);
angular.module('vbAdmin.shortcode', []);


/**
 * Kick it off.
 */
(function(vb, $) {

    let _vbPluginUrl = _vbAdminGlobal.vbPluginUrl;

    let vbAdmin = angular.module('vbAdmin', [
        'vbAdmin.tabs',
        'vbAdmin.chart',
        'vbAdmin.datasetSelect',
        'vbAdmin.shortcode'
        ]);

    vbAdmin.controller('vbController', function($scope, $http) {
        console.log('vbController running.');

        // We'll collect metadata of datasets here.
        let datasets = [];
        let ids_url = _vbPluginUrl + 'vis/api.php?filter=id';

        $scope.chartData = {};
        $scope.datasets = [
            {
                id: '',
                uploaded_name: 'loading...'
            }
        ];
        $scope.chartData.dataset = $scope.datasets[0];


        // First load all dataset IDs.
        $http.get(ids_url).success( function(ids) {

            // Function to fetch metadata given a dataset ID.
            function fetchMetaFromId(id) {
                let next_meta_url = _vbPluginUrl + 'vis/api.php?filename=' + id + '_meta.json';
                let req = $http.get(next_meta_url).success( function(next_meta) {
                    if($scope.datasets.length == 0) {
                        $scope.datasets = [];
                    }
                    // $scope.datasets.push(next_meta);
                    if($scope.datasets.length == 1) {
                        $scope.chartData.dataset = $scope.datasets[0];
                    }
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

})(visualbudget, jQuery);