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

    resize() {
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
                title: "Amount",
                cellClass: "value textright",
                value: function(node) {
                    return '$' + that.nFormatExact(that.dollarAmountOfCurrentDate(node));
                }
            },
            {
                title: "Portion",
                cellClass: "value textright",
                value: function(node) {
                    let val = that.dollarAmountOfCurrentDate(node);
                    let total = that.dollarAmountOfCurrentDate();
                    return that.formatPercentage(val/total);
                }
            },
            {
                title: "Growth",
                cellClass: "value textright",
                value: function(node) {
                    let date = that.state.date;
                    let percent = that.formatPercentage(100);

                    // Check to see if the previous year existed.
                    // If not, percent will be "N/A";
                    if (that.getFirstDate() <= date-1) {
                        let cur = that.dollarAmountOfDate(date, node);
                        let prev = that.dollarAmountOfDate(date-1, node);
                        let pct = (cur - prev) / prev * 100;
                        percent = that.formatPercentage(pct);
                    }

                    return percent;
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
}
