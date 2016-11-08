
class VbTreeMap extends VbChart {

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
        // this.addActions();
    }

    redraw() {
        console.log('Drawing chart ' + this.atts.hash + ' (treemap).');
        // d3.selectAll('#' + this.$div.attr('id') + ' svg g *').remove();
        this.drawChart();
    }

    setState(newState) {
        this.state = Object.assign({}, this.state, newState);
    }

    setupChartSvg() {
        this.transitioning = false;
        let $div = this.$div;

        let chart = this.chart = {};
        let margin = this.chart.margin = {top: 0, right: 0, bottom: 0, left: 0};
        let width  = this.chart.width  = $div.width();
        let height = this.chart.height = $div.height();
        this.chart.xwidth = width - margin.right - margin.left;
        this.chart.yheight = height - margin.top - margin.bottom;

        // Adds the svg canvas
        let svg = this.svg = d3.select($div.get(0))
            .append("svg")
                .attr("class", "svg-chart")
                .attr("width",  width)
                .attr("height", height)
            .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");

        // sanity check / background color
        this.svg.append("rect")
            .attr("width",  width)
            .attr("height", height)
            .attr("fill", "#abcdef");

        // grandparent
        let grandparent = chart.grandparent = svg.append("g")
            .attr("class", "grandparent");

        grandparent.append("rect")
            .attr("fill", "#789abc")
            .attr("y", -chart.margin.top)
            .attr("width", width)
            .attr("height", chart.margin.top);

        grandparent.append("text")
            .attr("x", 6)
            .attr("y", 6 - chart.margin.top)
            .attr("dy", ".75em");
    }

    // FIXME: This function should be broken up into drawAxes(), drawLine(data), etc.
    drawChart(d) {
        let that  = this;
        let data  = d || this.data;
        let chart = this.chart;
        let svg   = this.svg;

        console.log(d)

        // remove old elements
        d3.select(this.$div.get(0)).selectAll('.node').remove();

        // for the sake of choice
        let yearIndex = this.yearIndex = 10;


        // make the treemap
        let treemap = d3.treemap()
            .size([chart.xwidth, chart.yheight])
            .padding(1)
            .round(true);


        let root = d3.hierarchy(data, d => d.children)
            .sum(d => d.children.length ? 0 : d.dollarAmounts[yearIndex].dollarAmount)
            // .sum(d => d.dollarAmounts[yearIndex].dollarAmount)
            // .sort((a, b) => b.dollarAmount - a.dollarAmount);

        treemap(root);

        let node = d3.select(this.$div.get(0))
            .selectAll(".node")
            .data(root.children)
            .enter().append("div")
                .attr("class", "node")
                .on("click", d => d.data.children.length ? this.drawChart(d.data) : false)
                .style("left", d => d.x0 + "px")
                .style("top", d => d.y0 + "px")
                .style("width", d => d.x1 - d.x0 + "px")
                .style("height", d => d.y1 - d.y0 + "px");

        node.append("div")
            .attr("class", "node-label")
            .text(d => d.data.name);

        node.append("div")
            .attr("class", "node-value")
            .text(d => '$' + this.nFormat(d.value));
    }

}
