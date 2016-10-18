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
                    this.doLineChart();
                    break;

                default:
                    this.$div.html('VisualBudget error: unrecognized chart type.');
            }
        }


        v.Chart.prototype.doLineChart = function() {

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


        return v;

    })(vb || {});


    /**
     * Kick it off.
     */
    $(document).ready(function () {

        String.prototype.format = function(placeholders) {
            var s = this;
            for(var propertyName in placeholders) {
                var re = new RegExp('{' + propertyName + '}', 'gm');
                s = s.replace(re, placeholders[propertyName]);
            }
            return s;
        };

        function setSelect() {
            // Remove the existing chart by setting innerHTML to ''
            var $chartDiv = $('#vb-chart');
            $chartDiv.html('');

            // Update the chart div data.
            var $selectDiv = $("#vb-select-dataset option:selected");
            $chartDiv.data($selectDiv.data());
        }

        function generateShortcode() {
            var $chartDiv = $('#vb-chart');
            var $pre = $('#vb-shortcode');
            var str = '[visualbudget data={dataset_id} vis={vistype}]';
            $pre.html(str.format({
                dataset_id: $chartDiv.data('vbDatasetId'),
                vistype: $chartDiv.data('vbVisType')
            }));
        }

        $('#vb-select-dataset').change(function() {
            console.log('Changing selected dataset.');
            setSelect();
            generateShortcode();
            vb.initialize();
        });

        'use strict';
        setSelect();
        generateShortcode();
        vb.initialize();

    });

})( jQuery, d3 );
