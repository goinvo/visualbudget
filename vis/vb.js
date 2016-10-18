/**
 *  Visual Budget main routines.
 */

(function($,d3) {

    /**
     * Define vb.
     */
    var vb = (function (v) {

        /**
         * Initialize each chart.
         */
        v.initialize = function() {
            console.log('VB initializing...');
            v.charts = [];
            var $chartDivs = $('.vb-chart');
            $.when.apply($, $chartDivs.map(v.tryToInitializeChart))
                .then(v.drawAllCharts);
            // $chartDivs.each(v.tryToInitializeChart)
            //     .promise()
            //     .done(v.drawAllCharts);
        }

        /**
         * Try to initialize a chart. This function attempts to read the
         * data from the given url. Upon success, the setupChartObject
         * callback is invoked.
         */
        v.tryToInitializeChart = function() {
            var $div = $(this);
            var url = $div.data('vbDatasetUrl');
            var jqXHR = $.getJSON(url)
                .done(v.setupChartObject($div))
                .fail(function( jqxhr, textStatus, error ) {
                    var err = textStatus + ", " + error;
                    console.log( "Request Failed: " + err );
                });
            return jqXHR;
        }

        /**
         * Returns a callback to set up a new chart, with the jquery
         * selector of the chart div element in scope.
         */
        v.setupChartObject = function($div) {
            return function(data) {

                var newChart = new v.Chart($div, data);
                v.charts.push(newChart);
                console.log('Added chart ' + $div.data('vbHash') + ' to queue.');
            }
        }

        v.drawAllCharts = function() {
            v.charts.forEach(function(chart, i, array) {
                chart.draw();
            });
        }

        return v;

    })(vb || {});


    /**
     * Augment for line chart.
     */
    var vb = (function (v) {

        v.Chart = function($div, data) {
            this.$div = $div;
            this.data = data;

            var props = $div.data();
            this.props = {};
            this.props.datasetUrl = props.vbDatasetUrl;
            this.props.datasetId = props.vbDatasetId;
            this.props.visType = props.vbVisType;
            this.props.hash = props.vbHash;
        };

        v.Chart.prototype.draw = function() {
            console.log('Drawing chart ' + this.props.hash + '.');

            switch(this.props.visType) {
                case 'linechart':
                    //
                    break;

                default:
                    this.$div.html('VisualBudget error: unrecognized chart type.');
            }
        }

        return v;

    })(vb || {});


    /**
     * Kick it off.
     */
    $(document).ready(function () {
        'use strict';
        vb.initialize();
    });

})( jQuery, d3 );
