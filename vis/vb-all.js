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
        this.props = this.removeVbPrefixesOnAttributes($div.data());

        // The shared state among charts. These properties are used
        // for the interaction between charts.
        this.state = {
            groups: [],
            date: "2016"
        };
    }

    // The data-* properties are specified in the HTML with the additional
    // prefix of vb, so they are data-vb-*. Let's remove that unnecessary vb.


    _createClass(VbChart, [{
        key: 'removeVbPrefixesOnAttributes',
        value: function removeVbPrefixesOnAttributes(props) {

            function firstCharToLower(string) {
                return string.charAt(0).toLowerCase() + string.slice(1).toLowerCase();
            }
            function removeVbPrefix(str) {
                return str.replace(/^vb/, '');
            }

            // We will clone the props here with new keys.
            var newProps = {};

            // Loop through each property and remove the vb- prefix from them.
            for (var key in props) {
                if (props.hasOwnProperty(key)) {
                    // Create a new key by removing the prefix of the old key
                    var newKey = removeVbPrefix(key);
                    newKey = firstCharToLower(newKey);

                    newProps[newKey] = props[key];
                }
            }

            return newProps;
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
            console.log('Drawing chart ' + this.props.hash + '.');
            this.$div.html('This is a chart');
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            // Remove everything in the chart.
            console.log('Destroying chart ' + this.props.hash + '.');
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

        // Normalize the data.
        data.dollarAmounts.forEach(function (d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        return _possibleConstructorReturn(this, (VbLineChart.__proto__ || Object.getPrototypeOf(VbLineChart)).call(this, $div, data));
    }

    _createClass(VbLineChart, [{
        key: 'redraw',
        value: function redraw() {
            console.log('Drawing chart ' + this.props.hash + ' (linechart).');
            this.$div.html('This is a linechart');
            this.drawChart();
        }
    }, {
        key: 'drawChart',
        value: function drawChart() {
            var data = this.data;

            var inDateRange = function inDateRange(range) {
                return function (d) {
                    return d.date >= range[0] && d.date <= range[1];
                };
            };

            // Set the dimensions of the canvas / graph
            var margin = { top: 30, right: 20, bottom: 30, left: 50 },
                width = this.$div.width() - margin.left - margin.right,
                height = this.$div.height() - margin.top - margin.bottom;

            // Parse the date / time
            var parseDate = d3.timeFormat("%d-%b-%y").parse;

            // Set the ranges
            var x = d3.scaleTime().range([0, width]);
            var y = d3.scaleLinear().range([height, 0]);

            // Define the axes
            // only show the year in the x-axis, not the month
            var xAxis = d3.axisBottom().scale(x).tickFormat(function (time, index) {
                return time.getUTCFullYear();
            });

            var yAxis = d3.axisLeft().scale(y).ticks(5);

            // Define the line
            var valueline = d3.line().x(function (d) {
                return x(d.date);
            }).y(function (d) {
                return y(d.dollarAmount);
            });

            // Adds the svg canvas
            var svg = d3.select('#' + this.$div.attr('id')).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Scale the range of the data
            x.domain(d3.extent(data.dollarAmounts.filter(inDateRange(this.getDateRange())), function (d) {
                return d.date;
            }));
            y.domain([0, d3.max(data.dollarAmounts.filter(inDateRange(this.getDateRange())), function (d) {
                return d.dollarAmount;
            })]);

            // Add the valueline path.
            svg.append("path").attr("class", "line").attr("d", valueline(data.dollarAmounts.filter(inDateRange(this.getDateRange()))));

            // Add the X Axis
            svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

            // Add the Y Axis
            svg.append("g").attr("class", "y axis").call(yAxis);
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

        // Normalize the data.
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
            console.log('Drawing chart ' + this.props.hash + ' (metric).');

            var metric = this.getMetric(this.props.metric, this.state);
            this.$div.html(metric);
        }
    }, {
        key: "getMetric",
        value: function getMetric(name, state) {
            var metric = null;

            switch (name) {
                case 'yeartotal':
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

                case 'metric':
                    newChart = new VbMetric($div, data);
                    break;

                default:
                    console.log('VB error: Unrecognized chart type.');
            }

            vb.charts.push(newChart);
            console.log('Added chart ' + $div.data('vbHash') + ' to queue.');
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

    /**
     * Search for a chart by its hash. Returns null if no matching chart is found.
     */
    vb.getChart = function (hash) {
        var match = null;

        for (i = 0; i < vb.charts.length; i++) {
            if (vb.charts[i].props.vbHash == hash) {
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
