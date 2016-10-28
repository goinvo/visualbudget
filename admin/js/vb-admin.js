/**
 * This file controls the visualization editor. It works on top of vb.js inside
 * of the admin dashboard.
 */


/**
 * Kick it off.
 */
(function(vb, $) {

    var vbAdmin = angular.module('vbAdmin', ['components']);
    vbAdmin.controller('vbVisualizationsController', function($scope, $http) {

            var url_ids = _vbAdminGlobal.vbPluginUrl + 'vis/api.php?filter=id';

            $http.get(url_ids).success( function(ids) {

                var datasets = [];

                // Function to fetch metadata given a dataset ID.
                // The $http object is from Angular.
                function fetchMetaFromId(id) {
                    var url_next_meta = _vbAdminGlobal.vbPluginUrl + 'vis/api.php?filename=' + id + '_meta.json';
                    $http.get(url_next_meta).success( function(next_meta) {
                        datasets.push(next_meta);
                        $scope.vbDatasetSelect = datasets[0];
                    });
                }

                // Fetch metadata for all datasets.
                // .apply is native JS
                // .when, .then, and .map are jQuery
                // $scope is Angular
                $.when.apply($, $.map(ids, fetchMetaFromId))
                    .then(function() {
                        // Set the selected dataset to be the first one.
                        $scope.vbDatasetSelect = datasets[0];
                    });

                $scope.datasets = datasets;
            });

        });

    $(document).ready(function () {
        'use strict';

        // String.prototype.format = function(placeholders) {
        //     var s = this;
        //     for(var propertyName in placeholders) {
        //         var re = new RegExp('{' + propertyName + '}', 'gm');
        //         s = s.replace(re, placeholders[propertyName]);
        //     }
        //     return s;
        // };

        // function setSelect() {
        //     // Remove the existing chart by setting innerHTML to ''
        //     var $chartDiv = $('#vb-chart');
        //     $chartDiv.html('');

        //     // Update the chart div data.
        //     var $selectDiv = $("#vb-select-dataset option:selected");
        //     $chartDiv.data($selectDiv.data());
        // }

        // function generateShortcode() {
        //     var $chartDiv = $('#vb-chart');
        //     var $pre = $('#vb-shortcode');
        //     var str = '[visualbudget data={dataset_id} vis={vistype}]';
        //     $pre.html(str.format({
        //         dataset_id: $chartDiv.data('vbDatasetId'),
        //         vistype: $chartDiv.data('vbVisType')
        //     }));
        // }

        // $('#vb-select-dataset').change(function() {
        //     console.log('Changing selected dataset.');
        //     setSelect();
        //     generateShortcode();
        //     vb.initialize();
        // });

        // setSelect();
        // generateShortcode();

        vb.initialize();
        // vb.admin.initialize();

    });

})(visualbudget, jQuery);