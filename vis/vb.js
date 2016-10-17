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
            v.charts = $('.vb-chart');
            v.charts.each(v.initializeChart);
            console.log('VB initialized.');
        }

        /**
         * Initialize a chart. This function attempts to read the
         * data from the given url. Upon success, the setupChart
         * callback is invoked.
         */
        v.initializeChart = function(i, divElement) {
            var $div = $(divElement);
            var url = $div.data('vbDatasetUrl');
            var jqXHR = $.getJSON(url)
                .done(setupChart($div))
                .fail(function( jqxhr, textStatus, error ) {
                    var err = textStatus + ", " + error;
                    console.log( "Request Failed: " + err );
                });
        }

        /**
         * Returns a callback to set up a new chart, with the jquery
         * selector of the chart div element in scope.
         */
        function setupChart($div) {
            return function(data) {

                // Get all the HTML attribute data stored in the div.
                divData = $div.data();

                // Store the data in the HTML element.
                $.data($div, "vbChartData", data);

                // Check which kind of chart we're making.
                switch(divData.vbVisType) {
                    case 'linechart':
                        // $div.html('A line chart!');







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
var svg = d3.select('#' + $div.attr('id'))
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");



    data.dollarAmounts.forEach(function(d) {
        d.date = Date.parse(d.date);
        d.dollarAmount = +d.dollarAmount;
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






                        break;

                    default:
                        $div.html('VisualBudget error: unrecognized chart type.');
                }
            }
        }

        return v;

    })(vb || {});


    /**
     * Augment for line chart.
     */
    var vb = (function (v) {

        // v.Chart.prototype

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
