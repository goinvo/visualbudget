/**
 * Line chart submodule.
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

        // Keep the jQuery object onhand.
        this.$div = $div;

        // Parse the data.
        data.dollarAmounts.forEach(function(d) {
            d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });
        this.data = data;

        // Properties of the chart are specified as HTML data attributes.
        this.props = $div.data();

        // Deal with other settings, such as the date range to display.
        this.settings = {};
        this.settings.dateRange = this.getTotalDateRange();
        if (this.props.vbTime0) {
            if (this.props.vbTime0 != 'min') {
                this.settings.dateRange[0] = Date.parse(this.props.vbTime0);
            }
        }
        if (this.props.vbTime1) {
            if (this.props.vbTime1 == 'present') {
                this.settings.dateRange[1] = Date.now();
            } else if (this.props.vbTime1 != 'max') {
                this.settings.dateRange[1] = Date.parse(this.props.vbTime1);
            }
        }
    };

    // The min and max of all dates.
    Chart.prototype.getTotalDateRange = function() {

        // Get a list of all dates.
        var dates = [];
        this.data.dollarAmounts.forEach(function(obj) {
            dates.push(+obj.date);
        });

        // Find the min and max.
        var minDate = dates.reduce(function(a, b) { return Math.min(a, b); });
        var maxDate = dates.reduce(function(a, b) { return Math.max(a, b); });

        return [minDate, maxDate];
    }

    // Get the current displayed dateRange.
    Chart.prototype.getDateRange = function() {
        return this.settings.dateRange;
    }

    // Set a new displayed dateRange.
    Chart.prototype.setDateRange = function(range) {
        range[0] = Date.parse(range[0]);
        range[1] = Date.parse(range[1]);
        this.settings.dateRange = range;
    }


    // This object is necessary to construct for the noUiSlider to
    // display dates correctly.
    Chart.prototype.getDateRangeObject = function() {

        var dateRange = this.getDateRange();

        var yearOne = new Date(dateRange[0]).getUTCFullYear();
        var yearTwo = new Date(dateRange[1]).getUTCFullYear();

        var obj = {
            'min': yearOne,
            'max': yearTwo
        };

        var intervals = yearTwo - yearOne - 1;

        for(i = 1; i <= intervals; i++) {
            var pct = Math.round(100/(intervals+1)*i);
            obj[pct + '%'] = yearOne + i;
        }

        return obj;
    }

    // Redraw the chart.
    Chart.prototype.redraw = function() {
        console.log('Drawing chart ' + this.props.vbHash + '.');

        switch(this.props.vbVis) {
            case 'linechart':
                this.$div.html('');
                this.doLineChart();
                break;

            default:
                this.$div.html('VisualBudget error: unrecognized chart type.');
        }
    }

    // Do the line chart thing.
    Chart.prototype.doLineChart = function() {

        var data = this.data;

        var inDateRange = function(range) {
            return function(d) {
                return d.date >= range[0] && d.date <= range[1];
            }
        }

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

        // Scale the range of the data
        x.domain(d3.extent(data.dollarAmounts.filter(inDateRange(this.getDateRange())),
            function(d) { return d.date; }));
        y.domain([0, d3.max(data.dollarAmounts.filter(inDateRange(this.getDateRange())),
            function(d) { return d.dollarAmount; })]);

        // Add the valueline path.
        svg.append("path")
            .attr("class", "line")
            .attr("d", valueline(data.dollarAmounts.filter(inDateRange(this.getDateRange()))));

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
