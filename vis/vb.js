/**
 * Define the visualbudget module.
 */
var visualbudget = (function (vb, $, d3) {

    /**
     * Initialize each chart.
     */
    vb.initialize = function(callback) {

        // Make callback an empty function if it's not set
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
            var newChart = new vb.Chart($div, data);
            vb.charts.push(newChart);
            console.log('Added chart ' + $div.data('vbHash') + ' to queue.');
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

    /**
     * Search for a chart by its hash. Returns null if no matching chart is found.
     */
    vb.getChart = function(hash) {
        var match = null;

        for (i = 0; i < vb.charts.length; i ++) {
            if (vb.charts[i].props.vbHash == hash) {
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