/**
 * Define the visualbudget module.
 */
var visualbudget = (function (vb, $, d3) {

    /**
     * Initialize each chart.
     */
    vb.initialize = function() {
        console.log('VB initializing...');
        vb.charts = [];
        var $chartDivs = $('.vb-chart');
        $.when.apply($, $chartDivs.map(vb.tryToInitializeChart))
            .then(vb.drawAllCharts);
    }

    /**
     * Try to initialize a chart. This function attempts to read the
     * data from the given url. Upon success, the setupChartObject
     * callback is invoked.
     */
    vb.tryToInitializeChart = function() {
        var $div = $(this);
        var url = $div.data('vbDatasetUrl');
        var jqXHR = $.getJSON(url)
            .done(vb.setupChartObject($div))
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
            chart.draw();
        });
    }

    return vb;

})(visualbudget || {}, jQuery, d3);


/**
 * Augment for line chart.
 */
var visualbudget = (function (vb, $, d3) {

    /**
     * Define the Chart constructor.
     *
     * FIXME: Why does this not work?
     *      var Chart = vb.Chart = vb.Chart || function(){};
     *      Chart = function(x,y) { ... };
     */
    var Chart = vb.Chart = vb.Chart || function($div, data) {

        this.$div = $div;
        this.data = data;

        var props = $div.data();
        this.props = {};
        this.props.datasetUrl = props.vbDatasetUrl;
        this.props.datasetId = props.vbDatasetId;
        this.props.visType = props.vbVisType;
        this.props.hash = props.vbHash;
    };


    Chart.prototype.draw = function() {
        console.log('Drawing chart ' + this.props.hash + '.');

        switch(this.props.visType) {
            case 'linechart':
                this.doLineChart();
                break;

            default:
                this.$div.html('VisualBudget error: unrecognized chart type.');
        }
    }


    Chart.prototype.doLineChart = function() {

        var data = this.data;

        // Set the dimensions of the canvas / graph
        var margin = {top: 30, right: 20, bottom: 30, left: 50},
            width = 600 - margin.left - margin.right,
            height = 270 - margin.top - margin.bottom;

        // Parse the date / time
        var parseDate = d3.timeFormat("%d-%b-%y").parse;

        // Set the ranges
        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        // Define the axes
        // only show the year in the x-axis, not the month
        var xAxis = d3.axisBottom().scale(x)
                        .tickFormat(function(time, index) { return time.getUTCFullYear(); });

        var yAxis = d3.axisLeft().scale(y)
                        .ticks(5);

        // Define the line
        var valueline = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.dollarAmount); });

        // Adds the svg canvas
        var svg = d3.select('#' + this.$div.attr('id'))
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");

        data.dollarAmounts.forEach(function(d) {
            d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount/1000;
        });

        // Scale the range of the data
        x.domain(d3.extent(data.dollarAmounts, function(d) { return d.date; }));
        y.domain([0, d3.max(data.dollarAmounts, function(d) { return d.dollarAmount; })]);

        // Add the valueline path.
        svg.append("path")
            .attr("class", "line")
            .attr("d", valueline(data.dollarAmounts));

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

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
