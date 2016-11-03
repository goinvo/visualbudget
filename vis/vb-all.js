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
        this.props = $div.data();

        // The shared state among charts. These properties are used
        // for the interaction between charts.
        this.state = {
            groups: [],
            date: "2016"
        };
    }

    _createClass(VbChart, [{
        key: 'setState',
        value: function setState(newState) {
            this.state = Object.assign({}, this.state, newState);
            // Do stuff with new state.
        }
    }, {
        key: 'redraw',
        value: function redraw() {
            // Redraw the chart.
            console.log('Drawing chart ' + this.props.vbHash + '.');
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            // Remove everything in the chart.
            console.log('Destroying chart ' + this.props.vbHash + '.');
        }
    }]);

    return VbChart;
}();
"use strict";

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
            d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        return _possibleConstructorReturn(this, (VbLineChart.__proto__ || Object.getPrototypeOf(VbLineChart)).call(this, $div, data));
    }

    _createClass(VbLineChart, [{
        key: "logState",
        value: function logState() {
            console.log("Logging state.");
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
            d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        return _possibleConstructorReturn(this, (VbMetric.__proto__ || Object.getPrototypeOf(VbMetric)).call(this, $div, data));
    }

    _createClass(VbMetric, [{
        key: "redraw",
        value: function redraw() {
            // Just a test.
            this.$div.html(Date.now());
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
