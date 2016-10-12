/**
 *  Visual Budget main routines.
 */

var vb = (function (v) {

    v.initialize = function() {
        console.log('VB initializing...');
        v.charts = $('.vb-chart');
        v.charts.each(v.initializeChart);
        console.log('VB initialized.');
    }

    v.initializeChart = function(i, div) {
        var divData = $(div).data();
        var jqXHR = $.getJSON(divData.vbDatasetUrl)
            .done(function(data) {
                var $pre = $("<pre></pre>");
                $pre.html(JSON.stringify(data,null,2));
                $(div).append($pre);
            })
             .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                console.log( "Request Failed: " + err );
            });
    }

    return v;

}(vb || {}));
