
class VbMetric extends VbChart {

    constructor($div, data) {

        // Normalize the data.
        data.dollarAmounts.forEach(function(d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        super($div, data);

        $div.css({"display": "inline"});
    }

    redraw() {
        // Just a test.
        console.log('Drawing chart ' + this.atts.hash + ' (metric).');

        var metric = this.getMetric(this.atts.metric, this.state);
        this.$div.html(metric);
    }

    getMetric(name, state) {
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

    getMetricYearTotal(state) {
        let metric = this.dollarAmountOfDate(state.date);
        if (metric === null) {
            return 'N/A';
        }
        metric = '$' + this.nFormat(metric, 1);
        return metric;
    }

    getMetricAverage(state) {
        let metric = this.data.dollarAmounts.reduce((a,b) => a + b.dollarAmount, 0)
                    / this.data.dollarAmounts.length;
        metric = '$' + this.nFormat(metric, 1);
        return metric;
    }

}
