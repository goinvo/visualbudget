/*
 * The abstract class VbChart contains methods and properties common
 * to all the different charts (treemap, linechart, metric, etc).
 */
class VbChart {

    // Chart
    constructor($div, data) {

        // The jQuery object for the chart div
        // and the chart's data.
        this.$div = $div;
        this.data = data;

        // Properties of the chart are specified as HTML data attributes.
        this.atts = this.removeVbPrefixesOnAttributes($div.data());

        // Set the chart width & height if user set them.
        if(typeof this.atts.width !== undefined) {
            this.$div.width(this.atts.width);
        }
        if(typeof this.atts.height !== undefined) {
            this.$div.height(this.atts.height);
        }

        // The shared state among charts. These properties are used
        // for the interaction between charts.
        this.state = {
            hash: this.data.hash,
            myTaxBill: 7500, // Default. Q: How to set this?.
            groups: [],
            date: "2016",
            dragging: false,
            mouseX: null
        }

        // Bind the window resize event to the redraw function.
        window.addEventListener("resize", () => {
            this.redraw();
        });
    }


    // The data-* properties are specified in the HTML with the additional
    // prefix of vb, so they are data-vb-*. Let's remove that unnecessary vb.
    removeVbPrefixesOnAttributes(atts) {

        function firstCharToLower(string) {
            return string.charAt(0).toLowerCase() + string.slice(1).toLowerCase();
        }
        function removeVbPrefix(str) {
            return str.replace(/^vb/, '');
        }

        // We will clone the atts here with new keys.
        let newAtts = {};

        // Loop through each property and remove the vb- prefix from them.
        for (let key in atts) {
            if (atts.hasOwnProperty(key)) {
                // Create a new key by removing the prefix of the old key
                let newKey = removeVbPrefix(key);
                newKey = firstCharToLower(newKey);

                newAtts[newKey] = atts[key];
            }
        }

        return newAtts;
    }

    dollarAmountOfDate(date) {
        for(let i = 0; i < this.data.dollarAmounts.length; i++) {
            let obj = this.data.dollarAmounts[i];
            if(obj.date == date) {
                return obj.dollarAmount;
            }
        }
        return null;
    }

    setState(newState) {
        this.state = Object.assign({}, this.state, newState);
        this.redraw();
    }

    redraw() {
        // Redraw the chart.
        console.log('Drawing chart ' + this.atts.hash + '.');
        this.$div.html('[vb-chart]');
    }

    destroy() {
        // Remove everything in the chart.
        console.log('Destroying chart ' + this.atts.hash + '.');
    }

    getDateRange(data=this.data) {
        // Get a list of all dates.
        var dates = [];
        data.dollarAmounts.forEach(function(obj) {
            dates.push(Date.parse(obj.date));
        });

        // Find the min and max.
        var minDate = dates.reduce((a, b) => Math.min(a, b));
        var maxDate = dates.reduce((a, b) => Math.max(a, b));

        return [new Date(minDate), new Date(maxDate)];
    }

    // Number formatter, based on code from
    // http://stackoverflow.com/a/9462382/1516307
    nFormat(num, digits=0) {
        var si = [
                { value: 1E12, symbol: "T" },
                { value: 1E9,  symbol: "B" },
                { value: 1E6,  symbol: "M" },
                { value: 1E3,  symbol: "k" }
            ], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
        for (i = 0; i < si.length; i++) {
            if (num >= si[i].value) {
                return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
            }
        }
        return num.toFixed(digits).replace(rx, "$1");
    }

    getDateIndex(date) {
        let index = null;
        for(let i = 0; i < this.data.dollarAmounts.length; i++) {
            if(this.data.dollarAmounts[i].date == date) {
                index = i;
            }
        }
        return index;
    }

    getFirstDate() {
        let range = this.getDateRange();
        return range[0].getUTCFullYear();
    }

    // FIXME: this function is used only by the treemap
    // and is specific to the d3.hierarchy object type.
    findHash(hash, root) {
        let node = null;
        root.each(function(d) {
            if(d.data.hash == hash) {
                node = d;
            }
        });
        return node;
    }

    // FIXME: this function is basically same as above,
    // only it works on the VB chart data object type.
    getNodeByHash(hash, data) {

        if (!data) {
            data = this.data;
        }

        if (data.hash == hash) {
            return data;
        }

        let node = null;
        for(let i = 0; i < data.children.length; i++) {
            node = this.getNodeByHash(hash, data.children[i]);
            if(node) {
                break;
            }
        }

        return node;
    }

}