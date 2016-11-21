
class VbLineChart extends VbChart {

    constructor($div, data) {

        // Cast the data.
        data.dollarAmounts.forEach(function(d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        super($div, data);

        // Set up the SVG.
        this.setupChartSvg();

        // Bind events.
        this.addActions();
    }

    redraw() {
        console.log('Drawing chart ' + this.atts.hash + ' (linechart).');
        d3.selectAll('#' + this.$div.attr('id') + ' svg g *').remove();
        this.adjustSize();
        this.drawChart();
    }

    setState(newState) {
        this.state = Object.assign({}, this.state, newState);

        // Do not redraw everything here.
        this.moveHoverline();
    }

    setupChartSvg() {
        // Set the chart width and height and margin variables.
        this.setChartVars();

        let $div = this.$div;
        let chart = this.chart;

        // Adds the svg canvas
        this.svg = d3.select($div.get(0))
            .append("svg")
                .attr("class", "svg-chart")
                .attr("width",  chart.width)
                .attr("height", chart.height)
            .append("g")
                .attr("transform",
                      "translate(" + chart.margin.left + "," + chart.margin.top + ")");
    }

    setChartVars() {
        this.chart = {};
        let margin = this.chart.margin = {top: 30, right: 20, bottom: 30, left: 50};
        let width  = this.chart.width  = this.$div.width();
        let height = this.chart.height = this.$div.height();
        console.log(width);
        this.chart.xwidth = width - margin.right - margin.left;
        this.chart.yheight = height - margin.top - margin.bottom;
    }

    adjustSize() {
        this.setChartVars();
        let chart = this.chart;

        d3.select(this.$div.get(0)).select('svg')
            .attr('width', chart.width)
            .attr('height', chart.height)
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
            .y( d => y(d.dollarAmount) )
            // .curve(d3.curveCardinal.tension(0.5));

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

        // For global use
        chart.x = x;
        chart.y = y;


        svg.append('rect')
            .attr('class', 'click-capture')
            .style('visibility', 'hidden')
            .attr('width', chart.width)
            .attr('height', chart.height);


        // Hoverline
        let xpos = this.chart.x(new Date(this.state.date));
        this.hoverline = svg.append("line")
            .attr("x1", xpos).attr("x2", xpos)
            .attr("y1", 0).attr("y2", chart.yheight)
            .attr("class", "hoverline")
            // .classed("hidden", true);
    }

    moveHoverline() {
        // note that the year must be a string here, otherwise interpreted as unix time
        let xpos = this.chart.x(new Date(this.state.date));
        this.hoverline
            // .classed("hidden", false)
            .attr("x1", xpos).attr("x2", xpos);
    }

    // Add interaction actions.
    addActions() {
        let that = this;

        function getMouseX(e) {
            let x;
            // Makes event valid for both touch and mouse devices
            if (e.type === 'touchstart') {
                x = e.touches[0].pageX;
            } else {
                // Solves some IE compatibility issues
                x = e.offsetX || d3.mouse(this)[0];
            }
            return x - that.chart.margin.left;
        }
        function getMouseY(e) {
            // Makes event valid for both touch and mouse devices
            if (e.type === 'touchstart') {
                return e.touches[0].pageY;
            } else {
                // Solves some IE compatibility issues
                return e.offsetY || d3.mouse(this)[1];
            }
        }

        function mousedown_callback(e) {
            e = d3.event;
            e.preventDefault();
            let mouseX = getMouseX(e);
            let dateobj = that.chart.x.invert(mouseX); //.getUTCFullYear()
            let date = (dateobj.getMonth() <= 6) ?
                        dateobj.getUTCFullYear() : dateobj.getUTCFullYear() + 1;
            visualbudget.broadcastStateChange({
                date: "" + date, // cast to string
                dragging: true,
            })
        }
        function mousemove_callback(e) {
            if(that.state.dragging) {
                mousedown_callback(e);
            }
        }
        function mouseup_callback(e) {
            e = d3.event;
            e.preventDefault();
            visualbudget.broadcastStateChange({
                dragging: false
            })
        }
        function mouseout_callback(e) {
            e = d3.event;
            e.preventDefault();
            visualbudget.broadcastStateChange({
                dragging: false
            })
        }

        this.svg.on('mousedown', mousedown_callback);
        this.svg.on('mousemove', mousemove_callback);
        this.svg.on('mouseup',   mouseup_callback);
        // this.svg.on('mouseout',  mouseout_callback); // doesn't work properly
    }

}
