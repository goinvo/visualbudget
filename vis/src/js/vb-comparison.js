
class VbComparisonTime extends VbChart {

    constructor($div, data) {

        // Make sure the data is an array. If only one dataset was
        // passed, we can still make a chart -- but we need it to
        // be an array with one object in it.
        if(data.constructor !== Array) {
            data = [data];
        }

        // Cast the data.
        data.forEach(function(dataset) {
            dataset.dollarAmounts.forEach(function(d) {
                d.dollarAmount = +d.dollarAmount;
            });
        })

        // Call super method.
        super($div, data);

        // Set up the SVG.
        this.setupChartSvg();
    }

    redraw() {
        console.log('Drawing chart ' + this.atts.hash + ' (time comparison).');
        d3.selectAll('#' + this.$div.attr('id') + ' svg g *').remove();
        this.adjustSize();
        this.drawChart();
    }

    setState(newState) {
        this.state = Object.assign({}, this.state, newState);

        // Redraw
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

    /* Draw the actual chart.
     * This code is modified from
     * https://bl.ocks.org/mbostock/3887051
     */
    drawChart() {
        let that  = this;
        let data  = this.data;
        let chart = this.chart;
        let svg   = this.svg;
 
        // Set up the dimensions
        let x0 = d3.scaleBand()
            .rangeRound([0, chart.xwidth])
            .paddingInner(0.1);

        let x1 = d3.scaleBand()
            .padding(0.05);

        let y = d3.scaleLinear()
            .rangeRound([chart.yheight, 0]);

        let z = d3.scaleOrdinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b",
                    "#a05d56", "#d0743c", "#ff8c00"]);


        // Find the years common between all datasets.
        let dates = data[0].dollarAmounts.map(d => d.date);
        data.slice(1).forEach(dataset => {
            let nextDates = dataset.dollarAmounts.map(d => d.date);
            dates = dates.filter(d => nextDates.indexOf(d) >= 0 ? 1 : 0);
        });


        // Create a flat data array of all the datapoints we wish to plot.
        // Right now the datapoints are distributed between multiple
        // hierarchial JSON objects.
        let datapoints = [];
        let datasetNames = [];
        data.forEach(dataset => {
            datasetNames.push(dataset.name);
            dataset.dollarAmounts.forEach(d => {
                // Check that we actually want to plot this year.
                if(dates.indexOf(d.date)) {
                    datapoints.push({
                        datasetName: dataset.name,
                        dollarAmount: d.dollarAmount,
                        date: d.date
                    });
                }
            });
        });

        // These are the data formatted as required by the D3 code below.
        let nestedDatapoints = d3.nest()
            .key(d => d.date)
            .entries(datapoints);

        // The domains
        x0.domain(datapoints.map( d => d.date ));
        x1.domain(datasetNames).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(datapoints, d => d.dollarAmount)]).nice();

        // Add the bars of the chart
        svg.append("g")
          .selectAll("g")
          .data(nestedDatapoints)
          .enter().append("g")
            .attr("transform", d => "translate(" + x0(d.key) + ",0)")
          .selectAll("rect")
          .data(d => d.values)
          .enter().append("rect")
            .attr("x", d => x1(d.datasetName) )
            .attr("y", d => y(d.dollarAmount) )
            .attr("width", x1.bandwidth())
            .attr("height", d => chart.yheight - y(d.dollarAmount) )
            .attr("fill", d => z(d.datasetName) );

        // X axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + chart.yheight + ")")
            .call(d3.axisBottom(x0));

        // Y axis
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"));

/*
        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
          .selectAll("g")
          .data(keys.slice().reverse())
          .enter().append("g")
            .attr("transform", (d,i) => "translate(0," + i * 20 + ")" );

        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d);
*/

    }

}
