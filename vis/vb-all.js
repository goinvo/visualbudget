'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VbChart = function () {

    // Chart
    function VbChart($div, data) {
        _classCallCheck(this, VbChart);

        // The jQuery object for the chart div
        // and the chart's data.
        this.$div = $div;
        this.data = data;

        // Properties of the chart are specified as HTML data attributes.
        this.atts = this.removeVbPrefixesOnAttributes($div.data());

        // The shared state among charts. These properties are used
        // for the interaction between charts.
        this.state = {
            groups: [],
            date: "2016",
            dragging: false,
            mouseX: null
        };
    }

    // The data-* properties are specified in the HTML with the additional
    // prefix of vb, so they are data-vb-*. Let's remove that unnecessary vb.


    _createClass(VbChart, [{
        key: 'removeVbPrefixesOnAttributes',
        value: function removeVbPrefixesOnAttributes(atts) {

            function firstCharToLower(string) {
                return string.charAt(0).toLowerCase() + string.slice(1).toLowerCase();
            }
            function removeVbPrefix(str) {
                return str.replace(/^vb/, '');
            }

            // We will clone the atts here with new keys.
            var newAtts = {};

            // Loop through each property and remove the vb- prefix from them.
            for (var key in atts) {
                if (atts.hasOwnProperty(key)) {
                    // Create a new key by removing the prefix of the old key
                    var newKey = removeVbPrefix(key);
                    newKey = firstCharToLower(newKey);

                    newAtts[newKey] = atts[key];
                }
            }

            return newAtts;
        }
    }, {
        key: 'dollarAmountOfDate',
        value: function dollarAmountOfDate(date) {
            for (var i = 0; i < this.data.dollarAmounts.length; i++) {
                var obj = this.data.dollarAmounts[i];
                if (obj.date == date) {
                    return obj.dollarAmount;
                }
            }
            return null;
        }
    }, {
        key: 'setState',
        value: function setState(newState) {
            this.state = Object.assign({}, this.state, newState);
            this.redraw();
        }
    }, {
        key: 'redraw',
        value: function redraw() {
            // Redraw the chart.
            console.log('Drawing chart ' + this.atts.hash + '.');
            this.$div.html('This is a chart');
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            // Remove everything in the chart.
            console.log('Destroying chart ' + this.atts.hash + '.');
        }
    }, {
        key: 'getDateRange',
        value: function getDateRange() {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.data;

            // Get a list of all dates.
            var dates = [];
            data.dollarAmounts.forEach(function (obj) {
                dates.push(Date.parse(obj.date));
            });

            // Find the min and max.
            var minDate = dates.reduce(function (a, b) {
                return Math.min(a, b);
            });
            var maxDate = dates.reduce(function (a, b) {
                return Math.max(a, b);
            });

            return [new Date(minDate), new Date(maxDate)];
        }

        // Number formatter, based on code from
        // http://stackoverflow.com/a/9462382/1516307

    }, {
        key: 'nFormat',
        value: function nFormat(num) {
            var digits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var si = [{ value: 1E12, symbol: "T" }, { value: 1E9, symbol: "B" }, { value: 1E6, symbol: "M" }, { value: 1E3, symbol: "k" }],
                rx = /\.0+$|(\.[0-9]*[1-9])0+$/,
                i;
            for (i = 0; i < si.length; i++) {
                if (num >= si[i].value) {
                    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
                }
            }
            return num.toFixed(digits).replace(rx, "$1");
        }
    }, {
        key: 'getDateIndex',
        value: function getDateIndex(date) {
            var index = 0;
            for (var i = 0; i < this.data.dollarAmounts.length; i++) {
                if (this.data.dollarAmounts[i].date == date) {
                    index = i;
                }
            }
            return index;
        }
    }, {
        key: 'findHash',
        value: function findHash(hash, root) {
            var node = null;
            root.each(function (d) {
                if (d.data.hash == hash) {
                    node = d;
                }
            });
            return node;
        }
    }]);

    return VbChart;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VbLineChart = function (_VbChart) {
    _inherits(VbLineChart, _VbChart);

    function VbLineChart($div, data) {
        _classCallCheck(this, VbLineChart);

        // Cast the data.
        data.dollarAmounts.forEach(function (d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.

        // Set up the SVG.
        var _this = _possibleConstructorReturn(this, (VbLineChart.__proto__ || Object.getPrototypeOf(VbLineChart)).call(this, $div, data));

        _this.setupChartSvg();

        // Bind events.
        _this.addActions();
        return _this;
    }

    _createClass(VbLineChart, [{
        key: 'redraw',
        value: function redraw() {
            console.log('Drawing chart ' + this.atts.hash + ' (linechart).');
            d3.selectAll('#' + this.$div.attr('id') + ' svg g *').remove();
            this.drawChart();
        }
    }, {
        key: 'setState',
        value: function setState(newState) {
            this.state = Object.assign({}, this.state, newState);

            // Do not redraw everything here.
            this.moveHoverline();
        }
    }, {
        key: 'setupChartSvg',
        value: function setupChartSvg() {
            var $div = this.$div;

            this.chart = {};
            var margin = this.chart.margin = { top: 30, right: 20, bottom: 30, left: 50 };
            var width = this.chart.width = $div.width();
            var height = this.chart.height = $div.height();
            this.chart.xwidth = width - margin.right - margin.left;
            this.chart.yheight = height - margin.top - margin.bottom;

            // Adds the svg canvas
            this.svg = d3.select($div.get(0)).append("svg").attr("class", "svg-chart").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        }

        // FIXME: This function should be broken up into drawAxes(), drawLine(data), etc.

    }, {
        key: 'drawChart',
        value: function drawChart() {
            var that = this;
            var data = this.data;
            var chart = this.chart;
            var svg = this.svg;

            var inDateRange = function inDateRange(range) {
                return function (d) {
                    return true; // return d.date >= range[0] && d.date <= range[1];
                };
            };

            // Parse the date / time
            var parseDate = d3.timeFormat("%d-%b-%y").parse;

            // Set the ranges
            var x = d3.scaleTime().range([0, chart.xwidth]);
            var y = d3.scaleLinear().range([chart.yheight, 0]);

            // Define the axes
            // only show the year in the x-axis, not the month
            var xAxis = d3.axisBottom().scale(x);
            var yAxis = d3.axisLeft().scale(y).tickFormat(function (val) {
                return that.nFormat(val, 0);
            });

            // Define the line
            var valueline = d3.line().x(function (d) {
                return x(new Date(d.date));
            }).y(function (d) {
                return y(d.dollarAmount);
            }).curve(d3.curveCardinal.tension(0.5));

            // Scale the range of the data
            // x.domain(d3.extent(data.dollarAmounts.filter(inDateRange(null)), function(d) { return d.date; }));
            x.domain(this.getDateRange());
            y.domain([0, d3.max(data.dollarAmounts.filter(inDateRange(null)), function (d) {
                return d.dollarAmount;
            })]);

            // Add the valueline path.
            svg.append("path").attr("class", "line").attr("d", valueline(data.dollarAmounts.filter(inDateRange(null))));

            // Add the X Axis
            svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + chart.yheight + ")").call(xAxis);

            // Add the Y Axis
            svg.append("g").attr("class", "y axis").call(yAxis);

            // For global use
            chart.x = x;
            chart.y = y;

            svg.append('rect').attr('class', 'click-capture').style('visibility', 'hidden').attr('width', chart.width).attr('height', chart.height);

            // Hoverline
            var xpos = this.chart.x(new Date(this.state.date));
            this.hoverline = svg.append("line").attr("x1", xpos).attr("x2", xpos).attr("y1", 0).attr("y2", chart.yheight).attr("class", "hoverline");
            // .classed("hidden", true);
        }
    }, {
        key: 'moveHoverline',
        value: function moveHoverline() {
            // note that the year must be a string here, otherwise interpreted as unix time
            var xpos = this.chart.x(new Date(this.state.date));
            this.hoverline
            // .classed("hidden", false)
            .attr("x1", xpos).attr("x2", xpos);
        }

        // Add interaction actions.

    }, {
        key: 'addActions',
        value: function addActions() {
            var that = this;

            function getMouseX(e) {
                var x = void 0;
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
                var mouseX = getMouseX(e);
                var dateobj = that.chart.x.invert(mouseX); //.getUTCFullYear()
                var date = dateobj.getMonth() <= 6 ? dateobj.getUTCFullYear() : dateobj.getUTCFullYear() + 1;
                visualbudget.broadcastStateChange({
                    date: "" + date, // cast to string
                    dragging: true
                });
            }
            function mousemove_callback(e) {
                if (that.state.dragging) {
                    mousedown_callback(e);
                }
            }
            function mouseup_callback(e) {
                e = d3.event;
                e.preventDefault();
                visualbudget.broadcastStateChange({
                    dragging: false
                });
            }
            function mouseout_callback(e) {
                e = d3.event;
                e.preventDefault();
                visualbudget.broadcastStateChange({
                    dragging: false
                });
            }

            this.svg.on('mousedown', mousedown_callback);
            this.svg.on('mousemove', mousemove_callback);
            this.svg.on('mouseup', mouseup_callback);
            // this.svg.on('mouseout',  mouseout_callback); // doesn't work properly
        }
    }]);

    return VbLineChart;
}(VbChart);
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VbMetric = function (_VbChart) {
    _inherits(VbMetric, _VbChart);

    function VbMetric($div, data) {
        _classCallCheck(this, VbMetric);

        // Cast the data.
        data.dollarAmounts.forEach(function (d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.

        var _this = _possibleConstructorReturn(this, (VbMetric.__proto__ || Object.getPrototypeOf(VbMetric)).call(this, $div, data));

        $div.css({ "display": "inline" });
        return _this;
    }

    _createClass(VbMetric, [{
        key: "redraw",
        value: function redraw() {
            // Just a test.
            // console.log('Drawing chart ' + this.atts.hash + ' (metric).');

            var metric = this.getMetric(this.atts.metric, this.state);
            this.$div.html(metric);
        }
    }, {
        key: "getMetric",
        value: function getMetric(name, state) {
            var metric = null;

            switch (name) {
                case 'date':
                    metric = state.date;
                    break;

                case 'datetotal':
                    metric = this.getMetricYearTotal(state);
                    break;

                case 'average':
                    metric = this.getMetricAverage(state);
                    break;

                case '5yearaverage':
                    // Do what is necessary for 5 year average.
                    metric = '5-year-average coming soon.';
                    break;

                default:
                    metric = 'Unrecognized metric.';
            }

            return metric;
        }
    }, {
        key: "getMetricYearTotal",
        value: function getMetricYearTotal(state) {
            var metric = this.dollarAmountOfDate(state.date);
            if (metric === null) {
                return 'N/A';
            }
            metric = '$' + this.nFormat(metric, 1);
            return metric;
        }
    }, {
        key: "getMetricAverage",
        value: function getMetricAverage(state) {
            var metric = this.data.dollarAmounts.reduce(function (a, b) {
                return a + b.dollarAmount;
            }, 0) / this.data.dollarAmounts.length;
            metric = '$' + this.nFormat(metric, 1);
            return metric;
        }
    }]);

    return VbMetric;
}(VbChart);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VbTreeMap = function (_VbChart) {
    _inherits(VbTreeMap, _VbChart);

    function VbTreeMap($div, data) {
        _classCallCheck(this, VbTreeMap);

        // Cast the data.
        data.dollarAmounts.forEach(function (d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.

        // Set up the SVG.
        var _this = _possibleConstructorReturn(this, (VbTreeMap.__proto__ || Object.getPrototypeOf(VbTreeMap)).call(this, $div, data));

        _this.initialize($div, data);

        // Bind events.
        // this.addActions();
        return _this;
    }

    _createClass(VbTreeMap, [{
        key: 'redraw',
        value: function redraw() {
            console.log('Drawing chart ' + this.atts.hash + ' (treemap).');
            // d3.selectAll('#' + this.$div.attr('id') + ' svg g *').remove();
            // this.initialize();
        }
    }, {
        key: 'setState',
        value: function setState(newState) {
            var oldDate = this.state.date;
            var newDate = newState.date;

            this.state = Object.assign({}, this.state, newState);

            if (newDate && newDate != oldDate) {
                this.dateIndex = this.getDateIndex(this.state.date);
                this.calculateLayout();
                this.open();
            }
        }
    }, {
        key: 'initialize',
        value: function initialize($div, data) {
            var theDiv = d3.select($div.get(0)).classed('vb-treemap', true);

            var width = $div.width(),
                height = $div.height();

            var height = height,
                formatNumber = d3.format(",d"),
                transitioning;

            // create svg
            var nav = this.nav = d3.select($div.get(0)).append("svg")
            // .style('padding-top', '20px')
            .attr("width", width).attr("height", height).append("g").style("shape-rendering", "crispEdges");

            // initialize x and y scales
            nav.x = d3.scaleLinear().domain([0, width]).range([0, width]);

            nav.y = d3.scaleLinear().domain([0, height]).range([0, height]);

            nav.h = height;
            nav.w = width;

            // color scale
            nav.color = d3.schemeCategory20;

            // center zoom button vertically
            // $('#zoombutton').center();

            // initialize chart
            // avb.chart.initialize($('#chart'));

            var dateIndex = this.dateIndex = this.getDateIndex(this.state.date);

            // remove all old treemap elements
            nav.selectAll("g").remove();

            this.calculateLayout();

            nav.grandparent = nav.append("rect").attr("y", "-20px").attr("class", "grandparent");

            var p = document.createElement("p");
            p.setAttribute("id", "vb-zoom-button");
            $div.get(0).parentNode.insertBefore(p, $div.get(0));

            d3.select('#vb-zoom-button').text('Zoom out').on("click", function () {
                nav.grandparent.dispatch('click');
            });

            // display treemap
            // this.currentData = this.root;
            this.currentLevel = this.display(this.currentData);
        }
    }, {
        key: 'calculateLayout',
        value: function calculateLayout() {
            var _this2 = this;

            // We will count through, getting new colors.
            var i = 0;
            var setColor = function setColor(d) {
                if (!d3.schemeCategory20[i]) {
                    i = 0;
                }
                d.color = d3.schemeCategory20[i];
                i++;
            };

            this.root = d3.hierarchy(this.data, function (d) {
                return d.children;
            }).sum(function (d) {
                return d.children.length ? 0 : d.dollarAmounts[_this2.dateIndex].dollarAmount;
            })
            // .sum(d => d.dollarAmounts[dateIndex].dollarAmount)
            .sort(function (a, b) {
                return b.dollarAmount - a.dollarAmount;
            }).each(setColor);
            // .each(function(d) { d.color = '#d00'; });

            // make the treemap
            this.treemap = d3.treemap().size([this.$div.width(), this.$div.height()]).padding(0).round(false);

            this.treemap(this.root);
            this.currentData = this.currentData ? this.findHash(this.currentData.data.hash, this.root) : this.root;
            this.state.hash = this.currentData.data.hash;
        }

        /*
        *   Draws and displays a treemap layout from node data
        *
        *   @param {node} d - node where treemap begins (root)
        */

    }, {
        key: 'display',
        value: function display(d) {
            var that = this;
            var nav = this.nav;

            // remove all popovers
            // $('.no-value').popover('destroy');

            var formatNumber = d3.format(",d"),

            // flag will be used to avoid overlapping transitions
            transitioning;

            // return block name [unused]
            function name(d) {
                return d.parent ? name(d.parent) + "." + d.name : d.name;
            }

            // insert top-level blocks
            var g1 = nav.insert("g", ".grandparent-g").datum(d).attr("class", "depth").on("click", function (event) {
                that.zoneClick.call(this, d3.select(this).datum(), true, null, that);
            });

            // add in data
            var g = g1.selectAll("g").data(d.children.length === 0 ? [d] : d.children).enter().append("g");

            // create grandparent bar at top
            nav.grandparent.attr('width', '100%').attr('height', '20px').style('fill', '#eaa').datum(d.parent === undefined ? d : d.parent)
            // .attr("nodeid", (d.parent === undefined) ? d.hash : d.parent.hash)
            .on("click", function (event) {
                that.zoneClick.call(this, d3.select(this).datum(), true, null, that);
            });

            // refresh title
            // updateTitle(d);

            /* transition on child click */
            g.filter(function (d) {
                return d.children;
            }).classed("children", true)
            // expand when clicked
            .on("click", function (event) {
                that.zoneClick.call(this, d3.select(this).datum(), true, null, that);
            }).each(function () {
                var node = d3.select(this);
                // assign node hash attribute
                node.attr('nodeid', function () {
                    // return node.datum().hash;
                    return '1';
                });
            });

            // draw parent rectangle
            g.append("rect").attr("class", "parent").call(that.rect(that.nav))
            // .attr("fill", "none");
            .style("fill", function (d) {
                return d.color;
            });

            // recursively draw children rectangles
            function addChilds(d, g) {
                // add child rectangles
                g.selectAll(".child").data(function (d) {
                    return d.children || [d];
                }).enter().append("g").attr("class", "child")

                // propagate recursively to next depth
                .each(function () {
                    var group = d3.select(this);
                    if (d.children !== undefined) {
                        for (var i = 0; i < d.children.length; i++) {}
                        // addChilds(d.children[i], group);

                        // $.each(d.children, function () {
                        //     addChilds(this, group);
                        // })
                    }
                }).append("rect").call(that.rect(that.nav));
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
            var dateIndex = this.dateIndex;

            // assign label through foreign object
            // foreignobjects allows the use of divs and textwrapping
            g.each(function () {
                var label = d3.select(this).append("foreignObject").call(that.rect(that.nav))
                // .style("background", "#bca")
                .attr("class", "foreignobj").append("xhtml:div").html(function (d) {
                    var title = '<div class="titleLabel">' + d.data.name + '</div>',
                        values = '<div class="valueLabel">' + '$' + that.nFormat(d.value) + '</div>';
                    return title + values;
                }).attr("class", "textdiv");

                // textLabels.call(this); // FIXME
            });

            return g;
        }
    }, {
        key: 'open',
        value: function open(nodeId, transition) {
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

    }, {
        key: 'zoneClick',
        value: function zoneClick(d, click, transition, that) {
            //destroy popovers on transition (so they don't accidentally stay)
            // $(this).find('div').first().popover('destroy');

            var nav = that.nav;

            // stop event propagation
            var event = window.event || event;
            // stopPropagation( event );
            event.preventDefault();

            transition = transition || 750;

            // do not expand if another transition is happening
            // or data not defined
            if (nav.transitioning || !d) return;

            // go back if click happened on the same zone
            if (click && d.data.hash === that.currentData.data.hash) {
                // $('#zoombutton').trigger('click');
                nav.grandparent.dispatch('click');
                return;
            }

            // push url to browser history
            if (click) {}
            // pushUrl(avb.section, avb.thisYear, avb.mode, d.hash);


            // reset year
            // dateIndex = avb.thisYear - avb.firstYear;
            var dateIndex = that.dateIndex;

            //
            if (d.value === 0) {
                that.zoneClick.call(null, d.parent || that.root.data.hash, 0, that);
                return;
            }

            // remove old labels
            nav.selectAll('text').remove();

            // remember currently selected section and year
            that.currentData = d;
            that.state.hash = d.data.hash;
            visualbudget.broadcastStateChange(that.state);
            // that.currentNode.year = dateIndex; // that.currentNode doesn't exist though?

            // // update chart and cards
            // avb.chart.open(d, d.color);
            // avb.cards.open(d);

            // prevent further events from happening while transitioning
            nav.transitioning = true;

            // initialize transitions
            var g2 = that.display(d);
            var t1 = that.currentLevel.transition().duration(transition);
            var t2 = g2.transition().duration(transition);

            // Update the domain only after entering new elements.
            nav.x.domain([d.x0, d.x1]);
            nav.y.domain([d.y0, d.y1]);
            // nav.y.domain([d.y, d.y + d.dy]);

            // Enable anti-aliasing during the transition.
            nav.style("shape-rendering", null);

            // Draw child nodes on top of parent nodes.
            nav.selectAll(".depth").sort(function (a, b) {
                return a.depth - b.depth;
            });

            // Fade-in entering text.
            g2.selectAll(".foreignobj").style("fill-opacity", 0);

            // Transition to the new view
            t1.style('opacity', 0);
            t1.selectAll(".foreignobj").call(that.rect(nav));
            t2.selectAll(".foreignobj").call(that.rect(nav));
            t1.selectAll("rect").call(that.rect(nav));
            t2.selectAll("rect").call(that.rect(nav));

            // add labels to new elements
            /*
            t2.each(function () {
                if (ie()) return;
                textLabels.call(that);
            })
            t2.each("end", function () {
                if (ie()) {
                    ieLabels.call(that);
                } else {
                    textLabels.call(that);
                }
            })
            */

            // Remove the old node when the transition is finished.
            t1.remove().on("end", function () {
                nav.style("shape-rendering", "crispEdges");
                nav.transitioning = false;
            });

            // update current level
            that.currentLevel = g2;
        }

        /*
        *   Sets SVG rectangle properties based on treemap node values
        *
        *   @param {d3 selection} rect - SVG rectangle
        */

    }, {
        key: 'rect',
        value: function rect(nav) {
            return function (rect) {
                rect.attr("x", function (d) {
                    return nav.x(d.x0);
                }).attr("y", function (d) {
                    return nav.y(d.y0);
                }).attr("width", function (d) {
                    // return nav.x(d.x + d.dx) - nav.x(d.x);
                    return nav.x(d.x1) - nav.x(d.x0);
                }).attr("height", function (d) {
                    // return nav.y(d.y + d.dy) - nav.y(d.y);
                    return nav.y(d.y1) - nav.y(d.y0);
                });
            };
        }
    }]);

    return VbTreeMap;
}(VbChart);
'use strict';

/**
 * Define the visualbudget module.
 */
var visualbudget = function (vb, $, d3) {

    /**
     * Initialize each chart.
     */
    vb.initialize = function (callback) {

        // Set callback to an empty function if it's not set
        if (typeof callback === "undefined") {
            callback = function callback() {};
        }

        console.log('Initializing VB charts.');
        vb.charts = [];
        var $chartDivs = $('.vb-chart');
        $.when.apply($, $chartDivs.map(vb.tryToInitializeChart)).then(vb.drawAllCharts).then(callback);
    };

    /**
     * Try to initialize a chart. This function attempts to read the
     * data from the given url. Upon success, the setupChartObject
     * callback is invoked.
     */
    vb.tryToInitializeChart = function () {
        var $div = $(this);
        var url = $div.data('vbDatasetUrl');

        if (url) {
            var jqXHR = $.getJSON(url).done(vb.setupChartObject($div)).fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                console.log("Request Failed: " + err);
            });
            return jqXHR;
        }
    };

    /**
     * Returns a callback to set up a new chart, with the jquery
     * selector of the chart div element in scope.
     */
    vb.setupChartObject = function ($div) {
        return function (data) {

            var newChart;

            switch ($div.data('vbVis')) {
                case 'linechart':
                    newChart = new VbLineChart($div, data);
                    break;

                case 'treemap':
                    newChart = new VbTreeMap($div, data);
                    break;

                case 'metric':
                    newChart = new VbMetric($div, data);
                    break;

                default:
                    console.log('VB error: Unrecognized chart type.');
            }

            vb.charts.push(newChart);
            console.log('Added chart ' + newChart.atts.hash + ' to queue.');
        };
    };

    /**
     * Redraw all charts on the page.
     */
    vb.drawAllCharts = function () {
        vb.charts.forEach(function (chart, i, array) {
            chart.redraw();
        });
    };

    vb.broadcastStateChange = function (state) {
        for (var i = 0; i < vb.charts.length; i++) {
            vb.charts[i].setState(state);
        }
    };

    /**
     * Search for a chart by its hash. Returns null if no matching chart is found.
     */
    vb.getChart = function (hash) {
        var match = null;

        for (var i = 0; i < vb.charts.length; i++) {
            if (vb.charts[i].atts.hash == hash) {
                match = vb.charts[i];
                break;
            }
        }

        return match;
    };

    return vb;
}(visualbudget || {}, jQuery, d3);

/**
 * Kick it off.
 */
(function (vb, $) {
    $(document).ready(function () {
        'use strict';

        vb.initialize();
    });
})(visualbudget, jQuery);
