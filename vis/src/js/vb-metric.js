/*
 * Metrics: calculated sums, differences, and averages displayed
 * as text in a <span> element.
 */
class VbMetric extends VbChart {

    constructor($div, data) {

        // Cast the data.
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
        // console.log('Drawing chart ' + this.atts.hash + ' (metric).');

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
                metric = this.getMetricDateTotal(state);
                break;

            case 'average':
                metric = this.getMetricAverage(state);
                break;

            case '5yearaverage':
                // Do what is necessary for 5 year average.
                metric = '5-year-average coming soon.';
                break;

            case 'percentgrowth':
                metric = this.getPercentGrowth(state);
                break;

            case 'absgrowth':
                metric = this.getAbsGrowth(state);
                break;

            default:
                metric = 'Unrecognized metric.';
        }

        return metric;
    }

    /* The total for a certain date.
     */
    getMetricDateTotal(state) {
        let metric = this.dollarAmountOfDate(state.date);
        if (metric === null) {
            return 'N/A';
        }
        metric = '$' + this.nFormat(metric, 1);
        return metric;
    }

    /* The average over all dates.
     */
    getMetricAverage(state) {
        let metric = this.data.dollarAmounts.reduce((a,b) => a + b.dollarAmount, 0)
                    / this.data.dollarAmounts.length;
        metric = '$' + this.nFormat(metric, 1);
        return metric;
    }

    /* The percent growth from the previous year (can be negative).
     */
    getPercentGrowth(state) {
        let date = state.date;
        let metric = "N/A";
        let sign = "+"; // The default minus sign is really a hyphen.

        // Check to see if the previous year existed.
        // If not, metric will be "N/A";
        if (this.getDateIndex(date-1) !== null) {
            let cur = this.dollarAmountOfDate(date);
            let prev = this.dollarAmountOfDate(date-1);
            let pct = (cur - prev) / prev * 100;
            if(pct < 0) {
                sign = '&minus;';
            }
            metric = sign + Math.abs(pct).toFixed(2) + "%";
        }
        return metric;
    }

    /* The absolute (dollar-amount) growth from the previous year (can be negative).
     */
    getAbsGrowth(state) {
        let date = state.date;
        let metric = "N/A";
        let sign = "+"; // The default minus sign is really a hyphen.

        // Check to see if the previous year existed.
        // If not, metric will be "N/A";
        if (this.getDateIndex(date-1) !== null) {
            let diff = (this.dollarAmountOfDate(date) - this.dollarAmountOfDate(date-1));
            if(diff < 0) {
                sign = '&minus;';
            }
            metric = sign + '$' + this.nFormat(Math.abs(diff), 1);
        }
        return metric;
    }

}
