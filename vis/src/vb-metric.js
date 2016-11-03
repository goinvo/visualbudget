
class VbMetric extends VbChart {

    constructor($div, data) {

        // Normalize the data.
        data.dollarAmounts.forEach(function(d) {
            d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        super($div, data);
    }

    redraw() {
        // Just a test.
        this.$div.html(Date.now());
    }

}
