/**
 * This file controls the visualization editor. It works on top of vb.js inside
 * of the admin dashboard.
 */


var visualbudget = (function(vb) {

    var admin = vb.admin = vb.admin || {};

    admin.initialize = function() {
        console.log('vbAdmin initialized.');
        // console.log(vb);
    }

    return vb;

})(visualbudget || {});


/**
 * Kick it off.
 */
(function(vb, $) {

    $(document).ready(function () {
        'use strict';
        // vb.initialize();

        String.prototype.format = function(placeholders) {
            var s = this;
            for(var propertyName in placeholders) {
                var re = new RegExp('{' + propertyName + '}', 'gm');
                s = s.replace(re, placeholders[propertyName]);
            }
            return s;
        };

        function setSelect() {
            // Remove the existing chart by setting innerHTML to ''
            var $chartDiv = $('#vb-chart');
            $chartDiv.html('');

            // Update the chart div data.
            var $selectDiv = $("#vb-select-dataset option:selected");
            $chartDiv.data($selectDiv.data());
        }

        function generateShortcode() {
            var $chartDiv = $('#vb-chart');
            var $pre = $('#vb-shortcode');
            var str = '[visualbudget data={dataset_id} vis={vistype}]';
            $pre.html(str.format({
                dataset_id: $chartDiv.data('vbDatasetId'),
                vistype: $chartDiv.data('vbVisType')
            }));
        }

        $('#vb-select-dataset').change(function() {
            console.log('Changing selected dataset.');
            setSelect();
            generateShortcode();
            vb.initialize();
        });

        setSelect();
        generateShortcode();

        vb.initialize();
        vb.admin.initialize();

    });

})(visualbudget, jQuery);