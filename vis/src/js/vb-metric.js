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
        console.log('Drawing chart ' + this.atts.hash + ' (metric).');

        let data = this.getNodeByHash(this.state.hash);
        let metric = this.getMetric(this.atts.metric, this.state, data);

        this.$div.html(metric);
    }

    getMetric(name, state, data) {
        var metric = null;

        switch (name) {
            case 'date':
                metric = state.date;
                break;

            case 'datetotal':
                metric = this.getMetricDateTotal(state, data);
                break;

            case 'average':
                metric = this.getMetricAverage(state, data);
                break;

            case '5yearaverage':
                metric = this.getMetric5YearAverage(state, data);
                break;

            case 'numyearsaveraged':
                metric = this.getMetricNumYearsAveraged(state);
                break;

            case 'percentgrowth':
                metric = this.getMetricPercentGrowth(state, data);
                break;

            case 'absgrowth':
                metric = this.getMetricAbsGrowth(state, data);
                break;

            case 'name':
                metric = this.getMetricName(state, data);
                break;

            case 'download':
                metric = this.getMetricDownloadLink();
                break;

            default:
                metric = '?'; // Don't be too disruptive to the viewer.
        }

        return metric;
    }

    /* The total for a certain date.
     */
    getMetricDateTotal(state, data) {
        let metric = this.dollarAmountOfDate(state.date, data);
        if (metric === null) {
            return 'N/A';
        }
        metric = '$' + this.nFormat(metric, 1);
        return metric;
    }

    /* The average over all dates.
     */
    getMetricAverage(state, data) {
        let metric = data.dollarAmounts.reduce((a,b) => a + b.dollarAmount, 0)
                    / data.dollarAmounts.length;
        metric = '$' + this.nFormat(metric, 1);
        return metric;
    }

    /* The average of the last 5 years (or less than five years for
     * the right boundary condition).
     */
    getMetric5YearAverage(state, data) {
        let firstDate = this.getFirstDate();
        let date = state.date;
        let diff = Math.min(5, date-firstDate+1);
        let metric = 0;
        for(let i = 0; i < diff; i++) {
            metric = metric + this.dollarAmountOfDate(date-i, data);
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
    getMetricPercentGrowth(state, data) {
        let date = state.date;
        let metric = "N/A";
        let sign = "+"; // The default minus sign is really a hyphen.

        // Check to see if the previous year existed.
        // If not, metric will be "N/A";
        if (this.getFirstDate() <= date-1) {
            let cur = this.dollarAmountOfDate(date, data);
            let prev = this.dollarAmountOfDate(date-1, data);
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
    getMetricAbsGrowth(state, data) {
        let date = state.date;
        let metric = "N/A";
        let sign = "+"; // The default minus sign is really a hyphen.

        // Check to see if the previous year existed.
        // If not, metric will be "N/A";
        if (this.getFirstDate() <= date-1) {
            let diff = (this.dollarAmountOfDate(date, data) - this.dollarAmountOfDate(date-1, data));
            if(diff < 0) {
                sign = '&minus;';
            }
            metric = sign + '$' + this.nFormat(Math.abs(diff), 1);
        }
        return metric;
    }

    /* Get the name of the node
     */
    getMetricName(state, data) {
        if(this.isNumeric(data.name)) {
            if(typeof this.atts.name !== undefined) {
                return this.atts.name;
            } else {
                return '';
            }
        }

        return data.name;
    }

    /* Get the download link. Multiple links if multiple datasets.
     */
    getMetricDownloadLink() {
        // Set defaults for attributes.
        if(!("text" in this.atts)) {
            this.atts.text = "Download";
        }
        if(!("title" in this.atts)) {
            this.atts.title = "Download this dataset";
        }
        if(!("target" in this.atts)) {
            this.atts.target = "_blank";
        }

        // Initialize the link variable.
        let link = '';

        if("datasetUrls" in this.atts) {
            // to do.
        } else if("datasetUrl" in this.atts) {
            link = jQuery('<a>', {
                text:   this.atts.text,
                title:  this.atts.title,
                href:   this.atts.datasetUrl,
                target: this.atts.target
            });
        } else {
            link = '<!-- No dataset URLs specified. -->';
        }
        return link;
    }

    /* Checks to see if input is numeric
     */
    isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
}
