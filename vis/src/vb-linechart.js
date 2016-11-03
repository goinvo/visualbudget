
class VbLineChart extends VbChart {

    constructor($div, data) {

        // Normalize the data.
        data.dollarAmounts.forEach(function(d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        super($div, data);
    }

    redraw() {
        console.log('Drawing chart ' + this.props.hash + ' (linechart).');
        this.$div.html('This is a linechart');
        this.drawChart();
    }

    drawChart() {
        var data = this.data;

        var inDateRange = function(range) {
            return function(d) {
                return d.date >= range[0] && d.date <= range[1];
            }
        }

        // Set the dimensions of the canvas / graph
        var margin = {top: 30, right: 20, bottom: 30, left: 50},
            width = this.$div.width() - margin.left - margin.right,
            height = this.$div.height() - margin.top - margin.bottom;

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

}
