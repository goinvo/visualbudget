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

        // First get the config settings.
        var configURL = $('.vb-chart:first').data('vbConfigUrl');
        $.when( $.getJSON(configURL)
            .done(vb.setConfig)
            .fail(function(_,txt,err) {
                console.log("Request Failed: " + txt + ", " + err);
            })
        )
        .done(function() {
            // Now initialize all charts.
            vb.charts = [];
            var $chartDivs = $('.vb-chart');
            $.when.apply($, $chartDivs.map(vb.tryToInitializeChart))
                .then(vb.drawAllCharts)
                .then(callback);
        });
    }

    /**
     * Configuration callback.
     */
    vb.setConfig = function(data) {
        vb.config = data;
    }

    /**
     * Try to initialize a chart. This function attempts to read the
     * data from the given url. Upon success, the setupChartObject
     * callback is invoked.
     */
    vb.tryToInitializeChart = function() {
        var $div = $(this);
        var url = $div.data('vbDatasetUrl');
        var urls = $div.data('vbDatasetUrls');

        // Every chart requires a URL except for the 'mytaxbill' component.
        // Comparison charts require two.
        if(url) {
            var jqXHR = $.getJSON(url)
                .done(vb.setupChartObject($div))
                .fail(function( jqxhr, textStatus, error ) {
                    var err = textStatus + ", " + error;
                    console.log( "Request Failed: " + err );
                });
            return jqXHR;

        } else if(urls) {
            // If it is a comparison chart and requires multiple datasets.
            urls = urls.split(',');
            let requests = urls.map( url => $.getJSON(url) );
            $.when.apply(this, requests).then(function(...responses) {
                // Each response is an array: [ data, statusText, jqXHR ]
                let dataArray = [];
                for(let i = 0; i < responses.length; i++) {
                    dataArray.push(responses[i][0]);
                }
                vb.setupChartObject($div)(dataArray);
            });
            return requests;

        } else {
            // So catch that case, and don't try to load any data for it.
            // FIXME: This is hacky. Is there a better way?
            if ($div.data('vbVis') == 'mytaxbill') {
                vb.setupChartObject($div)([]);
            }
        }
    }

    /**
     * Returns a callback to set up a new chart, with the jquery
     * selector of the chart div element in scope.
     */
    vb.setupChartObject = function($div) {
        return function(data) {

            var newChart;
            var config = vb.config;

            switch($div.data('vbVis')) {
                case 'linechart':
                    newChart = new VbLineChart($div, data, config);
                    break;

                case 'stackedarea':
                    newChart = new VbStackedArea($div, data, config);
                    break;

                case 'comparisontime':
                    newChart = new VbComparisonTime($div, data, config);
                    break;

                case 'treemap':
                    newChart = new VbTreeMap($div, data, config);
                    break;

                case 'legend':
                    newChart = new VbLegend($div, data, config);
                    break;

                case 'table':
                    newChart = new VbTable($div, data, config);
                    break;

                case 'metric':
                    newChart = new VbMetric($div, data, config);
                    break;

                case 'mytaxbill':
                    newChart = new VbMyTaxBill($div, config);
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
let $ = jQuery;
(function(vb, $) {
    $(document).ready(function () {
        'use strict';
        vb.initialize();
    });
})(visualbudget, jQuery);
