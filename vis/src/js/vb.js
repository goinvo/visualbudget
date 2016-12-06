/**
 * Define the visualbudget module.
 */
var visualbudget = (function (vb, $, d3) {

    /**
     * Initialize each chart.
     */
    vb.initialize = function(callback) {

        // Set callback to an empty function if it's not set
        if (typeof callback === "undefined") {
            callback = function() {};
        }

        console.log('Initializing VB charts.');
        vb.charts = [];
        var $chartDivs = $('.vb-chart');
        $.when.apply($, $chartDivs.map(vb.tryToInitializeChart))
            .then(vb.drawAllCharts)
            .then(callback);
    }

    /**
     * Try to initialize a chart. This function attempts to read the
     * data from the given url. Upon success, the setupChartObject
     * callback is invoked.
     */
    vb.tryToInitializeChart = function() {
        var $div = $(this);
        var url = $div.data('vbDatasetUrl');

        if(url) {
            var jqXHR = $.getJSON(url)
                .done(vb.setupChartObject($div))
                .fail(function( jqxhr, textStatus, error ) {
                    var err = textStatus + ", " + error;
                    console.log( "Request Failed: " + err );
                });
            return jqXHR;
        }
    }

    /**
     * Returns a callback to set up a new chart, with the jquery
     * selector of the chart div element in scope.
     */
    vb.setupChartObject = function($div) {
        return function(data) {

            var newChart;

            switch($div.data('vbVis')) {
                case 'linechart':
                    newChart = new VbLineChart($div, data);
                    break;

                case 'treemap':
                    newChart = new VbTreeMap($div, data);
                    break;

                case 'metric':
                    newChart = new VbMetric($div, data);
                    break;

                case 'mytaxbill':
                    newChart = new VbMyTaxBill($div, data);
                    break;

                default:
                    console.log('VB error: Unrecognized chart type.');
                    return;
            }

            vb.charts.push(newChart);
            console.log('Added chart ' + newChart.atts.hash + ' to queue.');
        }
    }

    /**
     * Redraw all charts on the page.
     */
    vb.drawAllCharts = function() {
        vb.charts.forEach(function(chart, i, array) {
            chart.redraw();
        });
    }

    vb.broadcastStateChange = function(state) {
        for (let i = 0; i < vb.charts.length; i++) {
            vb.charts[i].setState(state);
        }
    }

    /**
     * Search for a chart by its hash. Returns null if no matching chart is found.
     */
    vb.getChart = function(hash) {
        var match = null;

        for (let i = 0; i < vb.charts.length; i++) {
            if (vb.charts[i].atts.hash == hash) {
                match = vb.charts[i];
                break;
            }
        }

        return match;
    }

    return vb;

})(visualbudget || {}, jQuery, d3);


/**
 * Kick it off.
 */
(function(vb, $) {
    $(document).ready(function () {
        'use strict';
        vb.initialize();
    });
})(visualbudget, jQuery);
