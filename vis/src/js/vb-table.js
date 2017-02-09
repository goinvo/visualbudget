/*
 * Tabular view.
 */
class VbTable extends VbChart {

    constructor($div, data) {

        // Cast the data.
        data.dollarAmounts.forEach(function(d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        super($div, data);

        // Configuration variables.
        let table = this.table = {};
        table.indent = 25; // indentation width
        table.tableStats = []; // columns to be shown
        // color scales
        table.growthScale = d3.scaleLinear().clamp(true)
            .domain([-10, 10])
            .range(["rgb(29,118,162)", 'rgb(167, 103, 108)']);
        table.amountScale = d3.scaleLinear().clamp(true)
            .range(["#aaa", "#333"]);
        table.impactScale = d3.scaleLinear().clamp(true)
            .domain([0, 100])
            .range(["#aaa", "#333"]);
    }

    redraw() {
        console.log('Drawing chart ' + this.atts.hash + ' (table).');
        this.initialize(this.$div, this.data);

        // Open the first group
        $(this.$div).children().eq(1).click();
    }

    /*
    * Initializes table
    *
    *   @param {jQuery obj} $container - table container
    *   @param {node} data - nodes to be displayed
    */
    initialize($container, data) {
        let $table = $container;
        let that = this;

        // remove old rows
        $('.tablerow').remove();

        // load row template
        let tableStats = this.tableStats();

        // display no results message should that be the case
        if (data.length === 0) {
            textRow('No results found.', $table);
            return;
        }

        // render table head
        $table.append(this.renderHeader(tableStats));

        // render all nodes (all search results)
        this.renderNode(data, 0, $table);
    }


    /*
    *   Aligns columns when the indentation level changes
    */
    alignRows() {
        // Could do this using a stack.
        let maxLevel = 0;

        // Find maximum depth level.
        $('.tablerow').each(function () {
            if ($(this).data('level') > maxLevel) {
                maxLevel = $(this).data('level');
            }
        });

        // Assign each first column a margin-right so that all the remaining
        // columns will be aligned.
        $('.tablerow').each(function () {
            let thisLevel = $(this).data('level') || 0;
            $(this).find('.name').animate({
                'margin-right': (maxLevel - thisLevel) * 25
            }, 250);
        });
    }

    /*
    * Defines the statistics to display in the table.
    * Each object of the array has properties "title", "cellClass",
    * and "value".
    */
    tableStats() {
        let that = this;
        return [
            {
                title: "Name",
                cellClass: "value name long textleft",
                value: function(node) { return node.name; }
            },
            {
                title: "Value",
                cellClass: "value textright",
                value: function(node) {
                    return '$' + that.nFormatExact(that.dollarAmountOfCurrentDate(node));
                }
            }
        ];
    }

    /*
    *  Renders the header based on node data
    */
    renderHeader(tableStats) {
        let template = '<div class="tablerow" id="vb-table-header" data-level=0>' +
                         '{{#.}}' +
                           '<div class="{{cellClass}} head">{{title}}</div>' +
                         '{{/.}}' +
                       '</div>';
        return Mustache.render(template, tableStats);
    }

    /*
    *  The template for a table row.
    */
    rowTemplate() {
        return  '<div class="tablerow">' +
                    '<div class="bullet {{hidden}}">&#9656;</div>' +
                '</div>';
    }

    /*
    *   Renders row containing just text (used to display 'No results found' msg)
    *
    *   @param {string} msg - message to be displayed
    *   @param {jQuery obj} table - container
    */
    textRow(msg, $table) {
        let template = this.rowTemplate();
        let rendered = $table.append(Mustache.render(template)).children().last();
        // align text to center
        rendered.css({
            'text-align': 'center'
        }).text(msg);
    }

    /*
    *   Renders row based on node data
    *
    *   @param {object} node - current node
    *   @param {int} level - current depth
    *   @param {jquery object} - container to which new row is appended
    *
    *   @return {jquery object} - new row
    */
    renderNode(node, level, container) {
        // append row to container
        let template = this.rowTemplate();
        let rendered = container.append(Mustache.render(template,
                {hidden: node.children.length ? '' : 'hidden'})).children().last();
        let tableStats = this.tableStats();

        // check whether node has children
        rendered.addClass((node.children.length === 0) ? 'atomic' : '');
        rendered.data(node);
        rendered.data('level', level);

        // recreate indentation style based on level
        rendered.css({
            'padding-left': level * 25
        });

        $.each(tableStats, function () {
            // append new cell to row
            let newcell = $('<div class="' + this.cellClass + '"> </div>').appendTo(rendered);
            if (this.cellFunction) {
                // function (eg. formatting numerical value)
                this.cellFunction(node, newcell.get(0));
            } else {
                // text (eg. row title)
                newcell.text(this.value(node));
            }
        });

        // attach click event 
        rendered.click(this.rowClick(this));

        return rendered;
    }

    /*
    *   Click event for rows
    */
    rowClick(that) {
        return function() {
            let row = $(this);
            let node = row.data();
            // atomic nodes don't need to expand or collapse
            if (row.hasClass('atomic')) return;

            if (row.hasClass('expanded')) {

                /*
                 *  Collapse row if expanded
                 */

                // retrieve children rows
                let child = row.data('childDiv');
                // slide up children rows
                child.slideUp(250, function () {
                    $(this).remove();
                    that.alignRows();
                })

                row.removeClass('expanded');

            } else {

                /*
                 *  Expand row if collapsed
                 */

                // container
                let childDiv = $('<div class="group"></div>').insertAfter(row);

                // render children rows
                for (let i = 0; i < node.children.length; i++) {
                    that.renderNode(node.children[i], row.data('level') + 1, childDiv);
                    row.data('childDiv', childDiv);
                }

                // show children rows
                that.alignRows();
                childDiv.slideDown(250);

                row.addClass('expanded');
            }
        }
    }

    /*
    * Draws D3 sparkline in cell
    *
    *   @param {object} data - current node
    *   @param {jquery object} - current cell
    */
    renderSparkline(node, cell) {

        // delete old sparklines
        d3.select(cell).select('svg').remove();

        // svg initialization
        var width = $(cell).width(),
            height = $(cell).parent().height();
        var sparkline = d3.select(cell).append('svg')
            .attr('width', width).attr('height', height);

        // scale initialization
        var xscale = d3.scale.linear().range([5, width-5])
            .domain([avb.firstYear, avb.lastYear]);
        var yscale = d3.scale.linear().range([height - 2, 2])
            .domain([0, d3.max(node.values, function (d) {
                return d.val
            })]);

        // line initialization
        var line = d3.svg.line().interpolate("monotone")
            .x(function (d) {
                return xscale(d.year);
            })
            .y(function (d) {
                return yscale(d.val);
            });

        // draw sparkline
        sparkline.append('g').append("svg:path").classed("line", true)
            .attr("d", line(node.values)).style("stroke", 'black');

        // draw point to indicate current year
        var pointer = sparkline.append('g').append("svg:circle").attr("r", 2)
            .datum({
                cx : xscale(node.values[yearIndex].year),
                cy : yscale(node.values[yearIndex].val)
            })
            .attr("cx", xscale(node.values[yearIndex].year))
            .attr("cy", yscale(node.values[yearIndex].val));

        // mouse moving in sparkline
        sparkline.on('mousemove', function(){
            // find year from x coordinate
            var year = Math.round(xscale.invert(d3.mouse(this)[0]));
            // move circle to another year
            pointer.attr("cx",  xscale(year))
            .attr("cy", yscale(node.values[year - avb.firstYear].val));

            // redraw popover
            $(pointer.node()).tooltip('destroy');
            $(pointer.node()).tooltip({
                // popover is appended to sparkline cell
                // this is done to avoid mouseleave events should the tooltip
                // be attached to 'body'. Obviously we cannot attach the tooltip
                // to the svg itself.
                container : sparkline.node().parentNode,
                title : year,
                animation : false
            })
            $(pointer.node()).tooltip('show');
        });

        // mouse leaving sparkline
        d3.select(sparkline.node().parentNode).on('mouseleave', function(){
            // return year pointer to its original location
            var pos = pointer.datum();
            pointer.attr("cx", pos.cx)
            .attr("cy", pos.cy);
            // remove tooltip
            $(pointer.node()).tooltip('destroy');
        });

    }

    /*
    *   Draws growth cell for current node
    *
    *   @param {object} data - current node
    *   @param {jquery object} - current cell
    */
    renderGrowth(data, cell) {
        // when year is first year report previous year value to be 0
        // growth will result to be 100%
        var previous = (data.values[yearIndex - 1]) ? data.values[yearIndex - 1].val : 0;
        // edge case
        if (data.values[yearIndex].val === 0) {
            if (previous === 0) {
                perc = 0;
            } else {
                perc = 100;
            }
        } else {
            // non-edge case
            // growth calculation
            perc = Math.round(100 * 100 * (data.values[yearIndex].val - previous)
                            / data.values[yearIndex].val) / 100;
        }

        // change color depending of growth magnitude and direction
        $(cell).css({
            "color": growthScale(perc)
        });
        $(cell).text(formatPercentage(perc));

    }
}
