
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
        this.initialize($div, data);
    }

    redraw() {
        console.log('Drawing chart ' + this.atts.hash + ' (treemap).');
        d3.selectAll('#' + this.$div.attr('id') + ' svg g *').remove();
        this.adjustSize();
        this.calculateLayout();
        this.open();
    }

    // Resize the chart in accordance with the size of its container div.
    // This is called on initialization and upon window resizing.
    adjustSize() {
        let width = this.$div.width();
        let height = this.$div.height();

        // Resize the svg.
        d3.select(this.$div.get(0)).select('svg')
            .attr('width', width)
            .attr('height', height);

        // Reset the ranges to fit the new div size.
        this.nav.x.range([0, width]);
        this.nav.y.range([0, height]);
    }

    // When a new state is broadcast by a chart this one is interacting with,
    // this function updates the chart accordingly.
    setState(newState) {
        let oldDate = this.state.date;
        let newDate = newState.date;

        this.state = Object.assign({}, this.state, newState);

        if(newDate && newDate != oldDate) {
            this.dateIndex = this.getDateIndex(this.state.date);
            this.calculateLayout();
            this.open()
        }
    }

    // Initialize the treemap.
    initialize($div, data) {
        let theDiv = d3.select($div.get(0));

        var width = $div.width(),
            height = $div.height();

        var formatNumber = d3.format(",d"),
            transitioning;

        // Create svg
        let nav = this.nav = d3.select($div.get(0)).append("svg")
            .append("g").style("shape-rendering", "crispEdges");

        // Initialize x and y scales
        nav.x = d3.scaleLinear()
            .domain([0, width])

        nav.y = d3.scaleLinear()
            .domain([0, height])

        this.adjustSize();

        let dateIndex = this.dateIndex = this.getDateIndex(this.state.date);

        // Remove all old treemap elements
        nav.selectAll("g").remove();
        
        this.calculateLayout();

        nav.grandparent = nav.append("rect")
                .attr("y", "-20px")
                .attr("class", "grandparent");

        // Create the "zoom out" button
        let p = document.createElement("p");
        p.setAttribute("id", "vb-zoom-button");
        if(typeof this.atts.width !== undefined) {
            p.style.width = this.atts.width;
            p.style.marginRight = 'auto';
            p.style.marginLeft = 'auto';
        }
        $div.get(0).parentNode.insertBefore(p, $div.get(0));

        d3.select('#vb-zoom-button')
            .text('Zoom out')
            .on("click", function() {
                nav.grandparent.dispatch('click');
            })

        // Initialize the tooltips.
        let tooltipContent = function(that) {
            return function(d) {
                let html = "<div class='name'>" + d.data.name + "</div>";
                let showMyContribution = that.getAttribute('showmycontribution');
                
                if(that.state.myTaxBill !== '' && showMyContribution) {

                    // Calculate the user's contribution as well as the
                    // portion of this treemap item paid for by (property) taxes.
                    let total = that.taxAdjustedDollarAmountOfDate(that.state.date);
                    let subTotal = that.taxAdjustedDollarAmountOfDate(that.state.date, d.data);
                    let myBill = that.state.myTaxBill;
                    let myContribution = myBill * (subTotal / total);
                    let pctFundedByTaxes = subTotal / that.dollarAmountOfDate(that.state.date, d.data);
                    pctFundedByTaxes = Math.round(100*pctFundedByTaxes);

                    // The parenthetical is added only if the query param "taxtype=property" is set
                    // AND (if (the param "showfundedbytaxes" is either set to "all")
                    // or (is set to "fractions" and % funded by taxes is less than one)).

                    // Make sure showFundedByTaxes is set properly; the default is "fractions".
                    let showFundedByTaxes = that.getAttribute('showfundedbytaxes',
                            'fractions', ['all', 'fractions']);

                    // Now add the note, if.
                    let taxesNote = "";
                    let taxType = that.getAttribute('taxtype');
                    if (taxType && (showFundedByTaxes == "all" || pctFundedByTaxes < 100)) {
                        let taxesType = that.atts.taxtype;
                        taxesNote = "<br/>(" + pctFundedByTaxes + "% is paid for by "
                            + taxesType + " taxes.)";
                    }

                    // Put the HTML all together.
                    html = html + "<div class='description'>Your contribution is "
                                + "$" + myContribution.toFixed(2) + "."
                                + taxesNote + "</div>";
                }
                return html;
            }
        }
        this.tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(tooltipContent(this));
        nav.call(this.tip);

        // Display the treemap.
        this.currentLevel = this.display(this.currentData);
    }

    calculateLayout() {
        this.root = d3
            .hierarchy(this.data,
                d => d.children.filter(a => a.dollarAmounts[this.dateIndex].dollarAmount))
            .sum(d => d.children.length ? 0 : d.dollarAmounts[this.dateIndex].dollarAmount)
            .sort((a, b) => b.dollarAmount - a.dollarAmount);

        // make the treemap
        this.treemap = d3.treemap()
            .tile(d3.treemapBinary) // FIXME: This is causing errors even though it works.
            .size([this.$div.width(), this.$div.height()])
            .padding(0)
            .round(1);

        this.treemap(this.root);
        this.currentData = this.currentData ?
                this.findHash(this.currentData.data.hash, this.root)
                : this.root;
        this.state.hash = this.currentData.data.hash;
    }

    /*
    *   Draws and displays a treemap layout from node data
    *
    *   @param {node} d - node where treemap begins (root)
    */
    display(d) {

        let that = this;
        let nav = this.nav;

        var formatNumber = d3.format(",d"),
            // Flag will be used to avoid overlapping transitions
            transitioning;

        // return block name [function is unused]
        function name(d) {
            return d.parent ? name(d.parent) + "." + d.name : d.name;
        }

        // insert top-level blocks
        var g1 = nav.insert("g", ".grandparent-g")
            .datum(d)
            .attr("class", "depth")
            .on("click", function (event) {
                that.zoneClick.call(this, d3.select(this).datum(), true, null, that);
            })

        // add in data
        var g = g1.selectAll("g")
            .data((d.children.length === 0) ? [d] : d.children)
            .enter().append("g");

        // create grandparent zoom-out bar at top
        nav.grandparent
            .attr('width', '100%')
            .attr('height', '20px')
            .style('fill', '#eaa')
            .datum((d.parent === undefined) ? d : d.parent)
            // .attr("nodeid", (d.parent === undefined) ? d.hash : d.parent.hash)
            .on("click", function (event) {
                that.zoneClick.call(this, d3.select(this).datum(), true, null, that);
            })

        /* transition on child click */
        g
            .filter(d => d.children)
            .classed("children", true)
            // expand when clicked
            .on("click", function (event) {
                that.zoneClick.call(this, d3.select(this).datum(), true, null, that);
            })
            .each(function () {
                var node = d3.select(this);
                // assign node hash attribute
                node.attr('nodeid', function () {
                    // return node.datum().hash;
                    return '1'
                });
            });

        // draw parent rectangle
        g.append("rect")
            .attr("class", "parent")
            .call(that.rect(that.nav))
            .style("fill", d => d.data.color)
            .on('mouseenter', this.tip.show)
            .on('mouseleave', this.tip.hide);

        // recursively draw children rectangles
        function addChilds(d, g) {
            // add child rectangles
            g
                .selectAll(".child")
                .data(function (d) {
                    return d.children || [d];
                })
                .enter().append("g")
                .attr("class", "child")
                .append("rect")
                .call(that.rect(that.nav));
        }

        addChilds(d, g);

        // IE popover action
        // if (ie()) {
        //     nav.on('mouseout', function () {
        //         d3.select('#ie-popover').style('display', 'none')
        //     });
        //     return g;
        // }

        // the dateIndex.
        let dateIndex = this.dateIndex;

        // assign label through foreign object
        // foreignobjects allows the use of divs and textwrapping
        g.each(function () {
            let label = d3.select(this).append("foreignObject")
                .call(that.rect(that.nav))
                // .style("background", "#bca")
                .attr("class", "foreignobj")
                .append("xhtml:div")
                .html(function (d) {
                    let title = '<div class="titleLabel">' + d.data.name + '</div>',
                        values = '<div class="valueLabel">'
                            + '$' + that.nFormat(d.value)
                            + '</div>';
                    return title + values;
                })
                .attr("class", "textdiv")
                .classed("no-label", true);

            // textLabels.call(this); // FIXME
        });

        return g;
    }

    // Open a node.
    open(nodeId, transition) {
        // find node with given hash or open root node
        this.zoneClick.call(null, this.currentData, false, transition || 1, this);
    }

    /*
    *   Event triggered on click event in treemap areas
    *
    *   @param {node} d - clicked node data
    *   @param {boolean} click - whether click was triggered
    *   @param {integer} transition - transition duration
    *   @param {obj} that - "this" context for the VbTreeMap object
    */
    zoneClick(d, click, transition, that) {
        //destroy popovers on transition (so they don't accidentally stay)
        // $(this).find('div').first().popover('destroy');

        let nav = that.nav;

        // stop event propagation
        var event = window.event || event
        // stopPropagation( event );
        event.preventDefault();

        transition = transition || 750;

        // do not expand if another transition is happening
        // or data not defined
        if (nav.transitioning || !d) return;

        // Go back if click happened on the same zone
        if (click && d.data.hash === that.currentData.data.hash) {
            nav.grandparent.dispatch('click');
            return;
        }

        // Reset year
        let dateIndex = that.dateIndex;

        if(d.value === 0) {
            that.zoneClick.call(null, d.parent || that.root.data.hash, 0, that);
            return;
        }

        // Remove old labels
        nav.selectAll('text').remove();

        // Remember currently selected section and year
        that.currentData = d;
        that.state.hash = d.data.hash;
        // visualbudget.broadcastStateChange(that.state);
        // FIXME: the above is causing errors when it occurs before line charts are drawn.

        // Prevent further events from happening while transitioning
        nav.transitioning = true;

        // Initialize transitions
        let g2 = that.display(d);
        let t1 = that.currentLevel.transition().duration(transition);
        let t2 = g2.transition().duration(transition);

        // Update the domain only after entering new elements.
        nav.x.domain([d.x0, d.x1]);
        nav.y.domain([d.y0, d.y1]);

        // Enable anti-aliasing during the transition.
        nav.style("shape-rendering", null);

        // Draw child nodes on top of parent nodes.
        nav.selectAll(".depth").sort(function (a, b) {
            return a.depth - b.depth;
        });

        // Fade-in entering text.
        g2.selectAll(".foreignobj")
            .style("fill-opacity", 0)
            .each(function(d,i) {
                // Determine whether to show the label.
                // The magic number 0.067 was found by testing:
                // on a chart which is 600x300px, the label is shown
                // if the cell size is at least 40x20px.
                let xDomain = nav.x.domain();
                let yDomain = nav.y.domain();
                let xSizeFraction = (d.x1 - d.x0) / (xDomain[1] - xDomain[0]);
                let ySizeFraction = (d.y1 - d.y0) / (yDomain[1] - yDomain[0]);
                if ( xSizeFraction > 0.067 && ySizeFraction > 0.067 ) {
                    d3.select(this).selectAll('.textdiv').classed('no-label', false);
                }
            });

        // Transition to the new view
        t1.style('opacity', 0);
        t1.selectAll(".foreignobj").call(that.rect(nav));
        t2.selectAll(".foreignobj").call(that.rect(nav));
        t1.selectAll("rect").call(that.rect(nav));
        t2.selectAll("rect").call(that.rect(nav));

        // Remove the old node when the transition is finished.
        t1.remove().on("end", function () {
            nav.style("shape-rendering", "crispEdges");
            nav.transitioning = false;
        });

        // update current level
        that.currentLevel = g2;

        // Broadcast the state change so other charts can "dive down" into the data.
        setTimeout(function() {
            visualbudget.broadcastStateChange({
                hash: d.data.hash
            });
        }, 0);
    }

    /*
    *   Sets SVG rectangle properties based on treemap node values
    *
    *   @param {d3 selection} rect - SVG rectangle
    */
    rect(nav) {
        return function(rect) {
            rect.attr("x",      d => nav.x(d.x0))
                .attr("y",      d => nav.y(d.y0))
                .attr("width",  d => nav.x(d.x1) - nav.x(d.x0))
                .attr("height", d => nav.y(d.y1) - nav.y(d.y0));
        }
    }

}
