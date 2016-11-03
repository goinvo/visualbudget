
class VbLineChart extends VbChart {

    constructor($div, data) {

        // Normalize the data.
        data.dollarAmounts.forEach(function(d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        super($div, data);
    }

    redraw() {
        console.log('Drawing chart ' + this.props.hash + ' (linechart).');
        this.$div.html('This is a linechart');
    }

}
