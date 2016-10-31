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

        this.$div = $div;


        data.dollarAmounts.forEach(function(d) {
            d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        this.data = data;

        var props = $div.data();
        this.props = {};
        this.props.datasetUrl = props.vbDatasetUrl;
        this.props.datasetId = props.vbData;
        this.props.visType = props.vbVis;
        this.props.hash = props.vbHash;

        this.settings = {};
        this.settings.dateRange = this.getTotalDateRange();
    };

    Chart.prototype.getTotalDateRange = function() {

        var dates = [];
        this.data.dollarAmounts.forEach(function(obj) {
            dates.push(+obj.date);
        });

        var minDate = dates.reduce(function(a, b) {
                return Math.min(a, b);
            });

        var maxDate = dates.reduce(function(a, b) {
                return Math.max(a, b);
            });

        return [minDate, maxDate];
    }

    Chart.prototype.getDateRange = function() {
        return this.settings.dateRange;
    }

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


    Chart.prototype.redraw = function() {
        console.log('Drawing chart ' + this.props.hash + '.');

        switch(this.props.visType) {
            case 'linechart':
                this.$div.html('');
                console.log(this.getDateRange())
                this.doLineChart();
                break;

            default:
                this.$div.html('VisualBudget error: unrecognized chart type.');
        }
    }


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
