
class VbStackedArea extends VbChart {

    constructor($div, data) {

        // Cast the data.
        data.dollarAmounts.forEach(function(d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        super($div, data);

        // Smooth or stepwise graph?
        this.smooth = this.getAttribute('smooth', false);

        // Set up the SVG.
        this.setupChartSvg();

        // Bind events.
        this.addActions();
    }

    redraw() {
        console.log('Drawing chart ' + this.atts.hash + ' (stackedarea).');
        d3.selectAll('#' + this.$div.attr('id') + ' svg g *').remove();
        this.adjustSize();

        let data = this.getNodeByHash(this.state.hash);
        this.drawChart(data);
    }

    setState(newState) {
        let oldHash = this.state.hash;
        let newHash = newState.hash || oldHash;
        this.state = Object.assign({}, this.state, newState);

        // Do not redraw everything here.
        this.moveHoverline();

        // ...unless the hash is changed.
        if(oldHash != newHash) {
            this.redraw();
        }
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

        d3.select(this.$div.get(0)).select('svg')
            .attr('width', this.chart.width)
            .attr('height', this.chart.height)
    }

    drawChart(data) {
        let that  = this;
        let chart = this.chart;
        let svg   = this.svg;

        var inDateRange = function(range) {
            return function(d) {
                // Currently the chart shows all dates, always.
                return true; // return d.date >= range[0] && d.date <= range[1];
            }
        }

        this.svg.layers = svg.append('g');

        // Parse the date / time
        let parseDate = d3.timeFormat("%d-%b-%y").parse;

        // Set the ranges
        let x = d3.scaleTime().range([0, chart.xwidth]);
        let y = d3.scaleLinear().range([chart.yheight, 0]);

        // Define the axes
        // only show the year in the x-axis, not the month
        let ticks_count = chart.xwidth < 390 ? 2 : null;
        let xAxis = d3.axisBottom().scale(x).ticks(ticks_count);
        let yAxis = d3.axisLeft().scale(y)
                        .tickFormat(val => '$' + that.nFormat(val, 0));

        // Define the line
        let valueline = d3.line()
            .x( d => x(new Date(d.date)) )
            .y( d => y(d.dollarAmount) )
            // .curve(d3.curveCardinal.tension(0.5));

        // Scale the range of the data
        // x.domain(d3.extent(data.dollarAmounts.filter(inDateRange(null)),
        //     function(d) { return d.date; }));
        x.domain(this.getDateRange())
        y.domain([0, d3.max(data.dollarAmounts.filter(inDateRange(null)), d => d.dollarAmount)]);

        // If the chart is smooth, plot the line and points.
        if(this.isSmooth()) {

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
        }

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

        // Now draw the layers (either areas or stacked bars).
        this.drawLayers(data);

        // Finally, set the hoverline.
        this.moveHoverline();
    }


    /*
    * Draws stacked area layers or stacked bars, depending on if
    * the chart is "smooth".
    *
    * @param {node} data - node for which data has to be displayed
    */
    drawLayers(data) {

        let svg = this.svg;
        let chart = this.chart;
        let $div = this.$div;

        /*
        // puts a shadow at boundary between layered
        // and non-layered part of the chart
        function appendShadow(group) {

            if (ie() || jQuery.browser.mobile) return;

            // clips the shadow so that it doesn't take the full height of the chart
            chart.sideShadow.attr("clip-path", "url(#areaclip)");

            // the shadow is a foreignobject (div) to which
            // the css property 'box-shadow' is applied to.
            chart.layerLine = group.append("foreignObject")
                .attr('x', chart.layersWidth - 10)
                    .attr('width', 10)
                    .attr('y', 10)
                    .attr('height', chart.yscale.range()[0] - 10)
                .attr("class", "foreignobj")

            chart.layerLine.append("xhtml:div").style('width', (3).px())
                .style('height', (chart.yscale.range()[0] - 10).px())
                .classed('layerLine', true);
        }
        */

        // Layers are a whole new svg image, this is done so that
        // the width of this svg can be easily adjusted to whatever desired
        // value, giving the illusion of 'clipping' the layers
        let layers = svg.layers.append('svg')
            .attr("height", chart.yheight)
            .attr("width", chart.xwidth)
            .classed('layers', true);

        // Clip area used by boundary shadow
        layers.attr("clip-path", "url(#areaclip)");

        svg.layers.svg = layers;
        svg.layers.classed('layers', true);
        layers.width = chart.xwidth;
        layers.height = chart.yheight;

        // if there is only one entry being displayed:
        // format it so the subsequent code can still draw a layer for it
        let singleAreaColor = false;

        // this is kind of a hack
        // because areas with 1 sub get draw 2 layers deep
        // to be fixed soon
        if (data.children.length == 0 || data.children.length == 1) {
          singleAreaColor = data.color;
        }

        // If there are no children, we've got to fudge it a bit
        // so the data's in the right format.
        if (data.children.length == 0) {
            let newChildren = jQuery.extend({}, data);
            data.children.push(newChildren);
            data.children[0].children = [];
            data.depth = 0;
        }

        let yscale = chart.y
        let xscale = chart.x;

        layers.xscale = xscale;

        // We have to reorder the data for the stack.
        let newData = [];
        let keys = data.children.map( d => d.name );
        let colors = data.children.map( d => d.color );
        for (let i = 0; i < data.dollarAmounts.length; i++) {
            let date = data.dollarAmounts[i].date;
            let dataPoint = {};
            dataPoint.date = date;
            for(let j = 0; j < data.children.length; j++) {
                let child = data.children[j];
                dataPoint[child.name] = this.dollarAmountOfDate(date, child);
            }
            newData.push(dataPoint);
        }

        // Stack declaration
        let stack = d3.stack()
            .keys(keys)
            .order(d3.stackOrderAscending);
        let instance = stack(newData);

        // Calculate areas
        if(this.isSmooth()) {
            // It will be a line chart.

            // Line declaration.
            let area = d3.area()
                // .interpolate("monotone")
                .x(  d => xscale(new Date(d.data.date)) )
                .y0( d => yscale(d[0]) )
                .y1( d => yscale(d[1]) );

            // Create the regions
            let regions = layers.selectAll(".browser")
                .data(instance)
                .enter()
                    .append("g")
                    .attr("class", "browser");

            // Draw the areas
            layers.areas = regions.append("path")
                .attr("class", "multiarea")
                .attr("d", area )
                .style("fill", (d,i) => colors[i] );

        } else {
            // It will be a bar chart.

            // This is a dummy array needed for the scaleband, just so it
            // knows how many bands there are. The values doesn't matter for us.
            let dummyArray = Array(data.dollarAmounts.length).fill().map((x,i)=>i);

            let newx = d3.scaleBand()
                .rangeRound([0, chart.xwidth])
                .padding(0)
                .domain(dummyArray); // number of bars on graph

            let regions = layers.selectAll(".browser")
                .data(instance)
                .enter().append("g")
                    .attr('fill', (d,i) => colors[i])
                .selectAll("rect")
                .data( d => d )
                .enter().append("rect")
                    .attr('class', 'multibar')
                    .attr("x", d => xscale(new Date(d.data.date)) )
                    .attr("y", d => yscale(d[1]) )
                    .attr("height", d => yscale(d[0]) - yscale(d[1]) )
                    .attr("width", d => newx.bandwidth() );
        }

    };


    moveHoverline() {
        // Note that the year must be a string here;
        // otherwise it is interpreted as unix time.
        let xpos = this.chart.x(new Date(this.state.date));
        this.hoverline
            .attr("x1", xpos).attr("x2", xpos);

        this.svg.layers.svg.attr('width', xpos);
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
        // this.svg.on('mouseout',  mouseout_callback); // glitchy.
    }

    isSmooth() {
        return this.smooth;
    }

}
