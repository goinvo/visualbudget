/*
 * Metrics: calculated sums, differences, and averages displayed
 * as text in a <span> element.
 */
class VbMetric extends VbChart {

    constructor($div, data) {

        // Cast the data.
        // data.dollarAmounts.forEach(function(d) {
        //     // d.date = Date.parse(d.date);
        //     d.dollarAmount = +d.dollarAmount;
        // });

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

            case 'mytaxcontribution':
                metric = this.getMetricMyTaxContribution(state, data);
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
            this.atts.text = "Download data";
        }
        if(!("title" in this.atts)) {
            this.atts.title = "Download data";
        }
        if(!("target" in this.atts)) {
            this.atts.target = "_blank";
        }

        // A simple function for replacing the .json extension with
        // an arbitrary extension, so the correct link is displayed.
        let setFiletype = (filename, ext) => filename
                .substr(0, filename.lastIndexOf(".")) + "." + ext;

        // The default file extension is CSV. If the query param
        // filetype=json is set, then JSON is instead linked.
        let filetype = 'csv';
        if(this.atts.filetype == 'json') {
            filetype = 'json';
        }

        // Initialize the html variable.
        let html = '';

        // Generate the links. Logic here forks depending on
        // how many URLs there are.
        if("datasetUrls" in this.atts) {
            // In this case, there are multiple datasets.
            let urls = this.atts.datasetUrls.split(',');
            let linkStrings = [];
            html = this.atts.text;
            for(let i = 0; i < urls.length; i++) {

                // The filetype will be CSV or JSON spending on query params.
                let theUrl = setFiletype(urls[i], filetype);

                linkStrings.push(jQuery('<a>', {
                        text:   (i+1) + '',         // convert to string
                        title:  this.atts.title,
                        href:   theUrl,
                        target: this.atts.target
                    }).prop('outerHTML'));
            }
            html += ' [' + linkStrings.join(', ') + ']';

        } else if("datasetUrl" in this.atts) {
            // In this case, there is only one dataset.

            // The filetype will be CSV or JSON spending on query params.
            let theUrl = setFiletype(this.atts.datasetUrl, filetype);

            html = jQuery('<a>', {
                text:   this.atts.text,
                title:  this.atts.title,
                href:   theUrl,
                target: this.atts.target
            }).prop('outerHTML');

        } else {
            // If no datasets were specified, only include an HTML comment.
            html = '<!-- No dataset URLs specified. -->';
        }

        return html;
    }


    /* Get the metric for "my tax contribution"
     */
    getMetricMyTaxContribution(state, data) {
        let metric = '';
        if(state.myTaxBill !== '') {
            let total = this.taxAdjustedDollarAmountOfDate(state.date);
            let subTotal = this.taxAdjustedDollarAmountOfDate(state.date, data);
            let myBill = state.myTaxBill;
            let myContribution = myBill * (subTotal / total);
            metric = "$" + myContribution.toFixed(2);
        }
        return metric;
    }

    /* Checks to see if input is numeric
     */
    isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
}
