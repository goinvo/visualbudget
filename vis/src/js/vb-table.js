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
        this.$table = $("<div class='vb-table-element'></div>");
        $div.append(this.$table);

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
        this.initialize(this.$table, this.data);        
    }

    // Override the super class's method.
    resize() {
        // Do nothing.
    }

    // Overrides the super class's method.
    setState(newState) {
        // Don't do a full redraw, just update.
        this.state = Object.assign({}, this.state, newState);
        this.update(this.$table, this.data, this.state.date);
    }

    // Update the table data without destroying it.
    // This is used when the year is changed.
    update($container, data, date) {
        let that = this;

        $container.find('.tablerow').not('.tableheader').each(function(i) {
            let node = $(this).data();
            let level = $(this).data('level');
            $(this).html($(that.renderNode(node, level)).html());
        });

        this.alignRows(0);
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
        $table.find('.tablerow').remove();
        $table.find('.group').remove();

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

        // Open the first group
        $table.children().eq(1).click();
    }


    /*
    *   Aligns columns when the indentation level changes
    */
    alignRows(duration=250) {
        let that = this;

        // Assign each row some CSS based on its depth.
        $('.tablerow').each(function () {
            let thisLevel = $(this).data('level') || 0;
            let theCSS = that.getAlignmentCSS(thisLevel);
            $(this).find('.name').animate(theCSS, duration);
        });
    }

    // How does a row's CSS change to align it, based on its depth?
    getAlignmentCSS(level) {
        return { 'padding-left': level * 25 };
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
                value: function(node) {

                    let bulletedName = function(hasChildren) {
                        return '<div class="bullet'
                            + (hasChildren ? "" : " hidden")
                            + '">&#9656;</div>' + node.name;
                    }

                    return bulletedName(node.children.length);
                },
                cssFunction: function(node, level) {
                    return that.getAlignmentCSS(level);
                }
            },
            {
                title: "Amount",
                cellClass: "value textright",
                value: function(node) {
                    return '$' + that.nFormatExact(that.dollarAmountOfCurrentDate(node));
                }
            },
            {
                title: "Impact",
                cellClass: "value textright",
                value: function(node) {
                    let val = that.dollarAmountOfCurrentDate(node);
                    let total = that.dollarAmountOfCurrentDate();
                    return that.formatPercentage(val/total*100, 0);
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
                        
                        // If we divided by zero, we'll say 100% growth.
                        if (!pct && pct !== 0) {
                            percent = '';
                        } else {
                            percent = that.formatPercentage(pct);
                        }
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
        let template = '<div class="tablerow tableheader" data-level=0>' +
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
        return  '<div class="tablerow datarow"></div>';
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
    renderNode(node, level, container=false) {
        // Grab the template
        let template = this.rowTemplate();

        // Render the template.
        let rendered = jQuery(template);
        // let rendered = jQuery(Mustache.render(template,
        //         {hidden: node.children.length ? '' : 'bullet-hidden'}));

        // Only append it to the container if the flag is passed.
        if (container) {
            container.append(rendered);
        }

        // Get the stats.
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

            // text (eg. row title)
            newcell.html(this.value(node));
            if (this.cssFunction) {
                newcell.css(this.cssFunction(node, level));
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

                let allChildren = [];
                let getAllChildren = function(node) {
                    let divs = $(node).data('childDivs');
                    if(divs) {
                        allChildren.push(...divs);
                        divs.forEach(d => getAllChildren(d));
                    }
                }
                getAllChildren(row);

                let count = 0;
                let total = allChildren.length;

                allChildren.forEach(d => d.fadeOut(300, function() {
                    $(this).remove();
                    count++;
                    if (count == total) {
                        that.alignRows();
                    }
                }));

                row.removeClass('expanded');

            } else {

                /*
                 *  Expand row if collapsed
                 */

                let childDivs = [];

                // render children rows
                for (let i = 0; i < node.children.length; i++) {
                    childDivs.push(that.renderNode(node.children[i], row.data('level') + 1));
                }
                childDivs.reverse();

                row.data('childDivs', childDivs);
                childDivs.forEach(d => row.after($(d).hide()));

                // show children rows
                that.alignRows();
                childDivs.forEach(d => d.fadeIn(300));

                row.addClass('expanded');
            }
        }
    }
}
