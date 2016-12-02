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
                metric = this.getMetric5YearAverage(state);
                break;

            case 'numyearsaveraged':
                metric = this.getMetricNumYearsAveraged(state);
                break;

            case 'percentgrowth':
                metric = this.getMetricPercentGrowth(state);
                break;

            case 'absgrowth':
                metric = this.getMetricAbsGrowth(state);
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

    /* The average of the last 5 years (or less than five years for
     * the right boundary condition).
     */
    getMetric5YearAverage(state) {
        let firstDate = this.getFirstDate();
        let date = state.date;
        let diff = Math.min(5, date-firstDate+1);
        let metric = 0;
        for(let i = 0; i < diff; i++) {
            metric = metric + this.dollarAmountOfDate(date-i);
        }
        return '$' + this.nFormat(metric / diff);
    }

    /* Since the 5-year average is not actually always over five years
     * (because of the boundary condition), this metric gives the actual
     * number of years that have been averaged.
     */
    getMetricNumYearsAveraged(state) {
        let firstDate = this.getFirstDate();
        let date = state.date;
        let diff = Math.min(5, date-firstDate+1);
        return diff;
    }

    /* The percent growth from the previous year (can be negative).
     */
    getMetricPercentGrowth(state) {
        let date = state.date;
        let metric = "N/A";
        let sign = "+"; // The default minus sign is really a hyphen.

        // Check to see if the previous year existed.
        // If not, metric will be "N/A";
        if (this.getFirstDate() <= date-1) {
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
    getMetricAbsGrowth(state) {
        let date = state.date;
        let metric = "N/A";
        let sign = "+"; // The default minus sign is really a hyphen.

        // Check to see if the previous year existed.
        // If not, metric will be "N/A";
        if (this.getFirstDate() <= date-1) {
            let diff = (this.dollarAmountOfDate(date) - this.dollarAmountOfDate(date-1));
            if(diff < 0) {
                sign = '&minus;';
            }
            metric = sign + '$' + this.nFormat(Math.abs(diff), 1);
        }
        return metric;
    }

}
