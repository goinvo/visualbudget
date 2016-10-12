/**
 *  Visual Budget main routines.
 */

var vb = (function (v) {

    v.initialize = function() {
        v.charts = $('.visualbudget-chart');
        v.charts.each(v.initializeChart);
    }

    v.initializeChart = function() {
        data = $(this).data();
        $(this).html(JSON.stringify(data));
    }

    return v;

}(vb || {}));
