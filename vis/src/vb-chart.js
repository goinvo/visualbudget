
class VbChart {

    // Chart
    constructor($div, data) {

        // The jQuery object for the chart div
        // and the chart's data.
        this.$div = $div;
        this.data = data;

        // Properties of the chart are specified as HTML data attributes.
        this.props = this.removeVbPrefixesOnAttributes($div.data());

        // The shared state among charts. These properties are used
        // for the interaction between charts.
        this.state = {
            groups: [],
            date: "2016"
        }
    }


    // The data-* properties are specified in the HTML with the additional
    // prefix of vb, so they are data-vb-*. Let's remove that unnecessary vb.
    removeVbPrefixesOnAttributes(props) {

        function firstCharToLower(string) {
            return string.charAt(0).toLowerCase() + string.slice(1).toLowerCase();
        }
        function removeVbPrefix(str) {
            return str.replace(/^vb/, '');
        }

        // We will clone the props here with new keys.
        let newProps = {};

        // Loop through each property and remove the vb- prefix from them.
        for (let key in props) {
            if (props.hasOwnProperty(key)) {
                // Create a new key by removing the prefix of the old key
                let newKey = removeVbPrefix(key);
                newKey = firstCharToLower(newKey);

                newProps[newKey] = props[key];
            }
        }

        return newProps;
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
        console.log('Drawing chart ' + this.props.hash + '.');
        this.$div.html('This is a chart');
    }

    destroy() {
        // Remove everything in the chart.
        console.log('Destroying chart ' + this.props.hash + '.');
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

}