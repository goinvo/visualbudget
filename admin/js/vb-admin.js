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

            $scope.vbChartData = {};

            // The _vbAdminGlobal is set by wp_localize_script() in the vb admin php file.
            var url_ids = _vbAdminGlobal.vbPluginUrl + 'vis/api.php?filter=id';

            // First load all dataset IDs.
            $http.get(url_ids).success( function(ids) {

                // We'll collect metadata of datasets here.
                var datasets = [];

                // Function to fetch metadata given a dataset ID.
                function fetchMetaFromId(id) {
                    var url_next_meta = _vbAdminGlobal.vbPluginUrl + 'vis/api.php?filename=' + id + '_meta.json';
                    $http.get(url_next_meta).success( function(next_meta) {
                        datasets.push(next_meta);
                        $scope.vbChartData.dataset = datasets[0]; // FIXME: this should be unnecessary
                    });
                }

                // Fetch metadata for all datasets.
                $.when.apply($, $.map(ids, fetchMetaFromId))
                    .then(function() {
                        // Set the selected dataset to be the first one.
                        $scope.vbChartData.dataset = datasets[0];
                        console.log('setting datasets to scope');
                        $scope.datasets = datasets;
                    });

                // Give $scope access to datasets.

            });


            // Assemble the shortcode from given values.
            $scope.getShortcode = function() {
                console.log('called');
                $scope.shortcode = '[visualbudget'
                                    + ' data=' + $scope.vbChartData.dataset.id
                                    // + ' vis=' + $scope.shortcodeProperties.vis
                                    + ']';

                return $scope.shortcode;
            }


            // On change of certain fields, reload the chart.
            $scope.redrawChart = function() {
                console.log($scope.vbChartData.dataset);
                $scope.shortcode = $scope.vbChartData.dataset.id;
                console.log('changed to ' + $scope.vbChartData.dataset.id);
            }

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

    });

})(visualbudget, jQuery);