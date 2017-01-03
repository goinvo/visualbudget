
class VbComparisonTime extends VbChart {

    constructor($div, data) {

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

        // To do: find overlapping years in data.

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

console.log(datapoints)

        x0.domain(datapoints.map( d => d.date ));
        x1.domain(datasetNames).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(datapoints, d => d.dollarAmount)]).nice();

        svg.append("g")
          .selectAll("g")
          .data(datapoints)
          .enter().append("g")
            .attr("transform", d => "translate(" + x0(d.date) + ",0)")
          .selectAll("rect")
          .data(d => datasetNames.map(datasetName => ({
                    datasetName: datasetName,
                    dollarAmount: d.dollarAmount
                }) ))
          .enter().append("rect")
            .attr("x", d => x1(d.datasetName) )
            .attr("y", d => y(d.dollarAmount) )
            .attr("width", x1.bandwidth())
            .attr("height", d => chart.yheight - y(d.dollarAmount) )
            .attr("fill", d => z(d.datasetName) );

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + chart.yheight + ")")
            .call(d3.axisBottom(x0));

        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"));
          // .append("text")
          //   .attr("x", 2)
          //   .attr("y", y(y.ticks().pop()) + 0.5)
          //   .attr("dy", "0.32em")
          //   .attr("fill", "#000")
          //   .attr("font-weight", "bold")
          //   .attr("text-anchor", "start")
          //   .text("Total $");

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














/*


        // Parse the date / time
        var parseDate = d3.timeFormat("%d-%b-%y").parse;

        // Set the ranges
        var x = d3.scaleTime().range([0, chart.xwidth]);
        var y = d3.scaleLinear().range([chart.yheight, 0]);

        // Define the axes
        // only show the year in the x-axis, not the month
        var xAxis = d3.axisBottom().scale(x);
        var yAxis = d3.axisLeft().scale(y)
                        .tickFormat(val => '$' + that.nFormat(val, 0));

        // Define the line
        var valueline = d3.line()
            .x( d => x(new Date(d.date)) )
            .y( d => y(d.dollarAmount) )
            // .curve(d3.curveCardinal.tension(0.5));

        // Scale the range of the data
        // x.domain(d3.extent(data.dollarAmounts.filter(inDateRange(null)),
        //     function(d) { return d.date; }));
        x.domain(this.getDateRange())
        y.domain([0, d3.max(data.dollarAmounts.filter(inDateRange(null)), d => d.dollarAmount)]);

        // Add the valueline path.
        svg.append("path")
            .attr("class", "line")
            .attr("d", valueline(data.dollarAmounts.filter(inDateRange(null))));



        // Plot points on the line.
        svg.selectAll("g.circles-line")
                .data([data.dollarAmounts])
                .enter()
            .append("g")
                .attr("class", "circles-line")
                .selectAll("circle")
                .data( d => d )
                .enter()
            .append("circle")
                .attr("r", 4)
                .attr("cx", (d,i) => x(new Date(d.date)) )
                .attr("cy", (d,i) => y(d.dollarAmount) );



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

        // This is an invisible div that ensures every click on the chart is captured.
        // Without it, clicks above the line may not trigger the click event.
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
            .attr("class", "hoverline");
*/
    }

}
