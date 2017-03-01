/*
 * The abstract class VbChart contains methods and properties common
 * to all the different charts (treemap, linechart, metric, etc).
 */
class VbChart {

    // Chart
    constructor($div, data) {

        this.setColors(data);

        // The jQuery object for the chart div
        // and the chart's data.
        this.$div = $div;
        this.data = data;

        // Properties of the chart are specified as HTML data attributes.
        this.atts = this.removeVbPrefixesOnAttributes($div.data());

        // Set the name of the dataset.
        if (typeof this.atts.name !== 'undefined') {
            this.data.name = this.atts.name;
        } else {
            this.data.name = this.toTitleCase(this.atts.data.toString());
        }

        // Set the chart width & height if user set them.
        if(typeof this.atts.width !== 'undefined') {
            this.$div.width(this.atts.width);
        }
        if(typeof this.atts.height !== 'undefined') {
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

    setColors(data) {
        // We will count through, getting new colors.
        let i = 0;
        let pickAColor = function() {
            if (!d3.schemeCategory20[i]) {
                i = 0;
            }
            return d3.schemeCategory20[i++];
        }

        // Recurse through the hierarchy.
        let setColorsRecurse = function(array) {
            if (array.children.length > 0) {
                for(let j = 0; j < array.children.length; j++) {
                    array.children[j].color = pickAColor();
                }
                for(let j = 0; j < array.children.length; j++) {
                    setColorsRecurse(array.children[j]);
                }
            }
        }

        data.color = pickAColor();
        setColorsRecurse(data);
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

    dollarAmountOfDate(date, node=this.data) {
        for(let i = 0; i < node.dollarAmounts.length; i++) {
            let obj = node.dollarAmounts[i];
            if(obj.date == date) {
                return obj.dollarAmount;
            }
        }
        return null;
    }

    dollarAmountOfCurrentDate(node=this.data) {
        let date = this.state.date;
        for(let i = 0; i < node.dollarAmounts.length; i++) {
            let obj = node.dollarAmounts[i];
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

    // Format amount, exactly
    nFormatExact(value) {
        let commasFormatter = d3.format(",.0f");
        return commasFormatter(value);
    }

    // Format a percentage (with sign)
    formatPercentage(value, digits=2) {
        value = value.toFixed(digits);
        if (value > 0) {
            return "+ " + value.toString() + "%";
        } else if (value < 0) {
            return "– " + Math.abs(value).toString() + "%";
        } else {
            return Math.abs(value).toString() + "%";
        }
    }

    // Get the index of a certain date in the dollarAmounts array.
    getDateIndex(date) {
        let index = null;
        for(let i = 0; i < this.data.dollarAmounts.length; i++) {
            if(this.data.dollarAmounts[i].date == date) {
                index = i;
            }
        }
        return index;
    }

    // What is the earliest date in the dataset?
    getFirstDate() {
        let range = this.getDateRange();
        return range[0].getUTCFullYear();
    }

    // Return a node based on its hash.
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

    // To title case
    toTitleCase(str) {
        return str.replace(/(?:^|\s)\w/g, function(match) {
            return match.toUpperCase();
        });
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