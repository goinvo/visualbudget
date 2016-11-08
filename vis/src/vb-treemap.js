
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
        let margin = this.chart.margin = {top: 20, right: 0, bottom: 0, left: 0};
        let width  = this.chart.width  = $div.width();
        let height = this.chart.height = $div.height();
        let xwidth = this.chart.xwidth = width - margin.right - margin.left;
        let yheight = this.chart.yheight = height - margin.top - margin.bottom;

        // Adds the svg canvas
        let container = d3.select($div.get(0))
                .classed("vb-treemap", true);

        container.append("div")
                .attr("class", "treemap-grandparent")
                .style("width", xwidth)
                .style("height", margin.top + "px")
                .text('zoom out')

        container.append("div")
                .attr("class", "treemap-main")
                .style("width",  xwidth)
                .style("height", yheight)
                // .style("top", margin.top + "px")

    }

    // FIXME: This function should be broken up into drawAxes(), drawLine(data), etc.
    drawChart(input_node) {
        let that  = this;
        let data  = input_node || this.data;
        let chart = this.chart;
        let svg   = this.svg;

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

        // zoom out button
        d3.select(this.$div.get(0)).select(".treemap-grandparent")
            .datum(data)
            .on('click', function(d) { console.log(d)})
            // .on('click', d => d.parent ? this.drawChart(d.parent.data) : false)

        let node = d3.select(this.$div.get(0)).select(".treemap-main")
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
