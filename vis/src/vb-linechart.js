
class VbLineChart extends VbChart {

    constructor($div, data) {

        // Normalize the data.
        data.dollarAmounts.forEach(function(d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        super($div, data);

        // Set up the SVG.
        this.setupChartSvg();
    }

    redraw() {
        console.log('Drawing chart ' + this.props.hash + ' (linechart).');
        this.drawChart();
    }

    setupChartSvg() {
        let $div = this.$div;

        this.chart = {};
        let margin = this.chart.margin = {top: 30, right: 20, bottom: 30, left: 50};
        let width  = this.chart.width  = $div.width();
        let height = this.chart.height = $div.height();
        this.chart.xwidth = width - margin.right - margin.left;
        this.chart.yheight = height - margin.top - margin.bottom;

        // Adds the svg canvas
        this.svg = d3.select($div.get(0))
            .append("svg")
                .attr("width",  width)
                .attr("height", height)
            .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");
    }

    // Add interaction actions.
    addActions() {

    }

    // FIXME: This function should be broken up into drawAxes(), drawLine(data), etc.
    drawChart() {
        let that  = this;
        let data  = this.data;
        let chart = this.chart;
        let svg   = this.svg;

        var inDateRange = function(range) {
            return function(d) {
                return true; // return d.date >= range[0] && d.date <= range[1];
            }
        }

        // Parse the date / time
        var parseDate = d3.timeFormat("%d-%b-%y").parse;

        // Set the ranges
        var x = d3.scaleTime().range([0, chart.xwidth]);
        var y = d3.scaleLinear().range([chart.yheight, 0]);

        // Define the axes
        // only show the year in the x-axis, not the month
        var xAxis = d3.axisBottom().scale(x);
        var yAxis = d3.axisLeft().scale(y)
                        .tickFormat(val => that.nFormat(val, 0));

        // Define the line
        var valueline = d3.line()
            .x( d => x(new Date(d.date)) )
            .y( d => y(d.dollarAmount) );


        // Scale the range of the data
        // x.domain(d3.extent(data.dollarAmounts.filter(inDateRange(null)), function(d) { return d.date; }));
        x.domain(this.getDateRange())
        y.domain([0, d3.max(data.dollarAmounts.filter(inDateRange(null)), d => d.dollarAmount)]);

        // Add the valueline path.
        svg.append("path")
            .attr("class", "line")
            .attr("d", valueline(data.dollarAmounts.filter(inDateRange(null))));

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.yheight + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

    }

}
