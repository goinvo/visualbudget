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

        var that = this;

        $scope.vbChartData = {};

        // The _vbAdminGlobal is set by wp_localize_script() in the vb admin php file.
        var ids_url = _vbAdminGlobal.vbPluginUrl + 'vis/api.php?filter=id';

        // First load all dataset IDs.
        $http.get(ids_url).success( function(ids) {

            // We'll collect metadata of datasets here.
            var datasets = [];

            // Function to fetch metadata given a dataset ID.
            function fetchMetaFromId(id) {
                var next_meta_url = _vbAdminGlobal.vbPluginUrl + 'vis/api.php?filename=' + id + '_meta.json';
                $http.get(next_meta_url).success( function(next_meta) {
                    datasets.push(next_meta);

                    // FIXME: These two commands should go in the .then() below, right?
                    //        But they don't execute properly there.
                    if (datasets.length == 1) {
                        $scope.vbChartData.dataset = datasets[0];
                        that.redrawChart();
                    }
                });
            }

            // Fetch metadata for all datasets.
            $.when.apply($, $.map(ids, fetchMetaFromId))
                .then(function() {
                    $scope.datasets = datasets;
                });

        });


        // Assemble the shortcode from given values.
        // If the 'query_string' argument is set, the shortcode is
        // returned in the form of a query string.
        this.getShortcode = function(query_string) {
            var shortcode_atts = {
                'data': $scope.vbChartData.dataset.id,
                'vis': 'linechart',
                'time': 'all',
                'iframe': 0
            }

            var shortcode = null;

            if (typeof query_string === "undefined") {
                shortcode = '[visualbudget '
                                + this.serialize(shortcode_atts, ' ')
                                + ']';
            } else {
                shortcode = "?vb_shortcode&" + this.serialize(shortcode_atts, '&');
            }

            return shortcode;
        }


        // On change of certain fields, reload the chart.
        this.redrawChart = function() {
            console.log('Redrawing chart #' + $scope.vbChartData.dataset.id);
            var shortcode_url = _vbAdminGlobal.vbAdminUrl + this.getShortcode(true);
            $http.get(shortcode_url).success( function(response) {
                that.selectInActivePane('.chart-wrapper').html(response);
                vb.initialize(that.setSlider);
            });
        }

        // Set the UI slider range.
        this.setSlider = function() {

            // Get the chart hash and use it to select the Chart object.
            var hash = that.selectInActivePane('.vb-chart').data('vbHash');
            var chart = vb.getChart(hash);

            // Sort out the date range for the slider.
            var rangeObject = chart.getDateRangeObject();

            // Create the slider.
            var slider_element = that.selectInActivePane('.vb-time-slider')[0];
            noUiSlider.create(slider_element, {
                    start: [rangeObject['min'], rangeObject['max']],
                    connect: true,
                    tooltips: true,
                    snap: true,
                    range: rangeObject,
                    format: {
                        to: function (val) { return Math.round(val); },
                        from: function (val) { return val; }
                    }
                })
                .on('set', function() {
                    chart.setDateRange(slider_element.noUiSlider.get());
                    chart.redraw();
                });

        }

        // Get elements of a certain class on the active tab pane.
        this.selectInActivePane = function(selector) {
            return $('.tab-pane.active ' + selector);
        }

        // Turn a JS object into a query string.
        // based on code from  http://stackoverflow.com/a/1714899
        this.serialize = function(obj, sep) {
            // The separator between key=val pairs.
            if (typeof sep === "undefined") {
                sep = '&';
            }

            var str = [];
            for(var p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            return str.join(sep);
        }

    });

})(visualbudget, jQuery);