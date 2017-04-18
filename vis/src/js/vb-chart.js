/*
 * The abstract class VbChart contains methods and properties common
 * to all the different charts (treemap, linechart, metric, etc).
 */
class VbChart {

    // Chart
    constructor($div, data, config) {

        // Properties of the chart are specified as HTML data attributes.
        this.atts = this.removeVbPrefixesOnAttributes($div.data());

        // Set the name of the dataset.
        if (typeof this.atts.name !== 'undefined') {
            data.name = this.atts.name;
        } else {
            data.name = this.toTitleCase(this.atts.data.toString());
        }

        // If this is a comparison chart, then data is an array.
        if(data.constructor !== Array) {
            // Not a comparison chart.
            if(typeof this.atts.node !== 'undefined') {
                data = this.getNodeByLevels(this.atts.node, data);
            }
        } else {
            // Comparison chart.
            if(typeof this.atts.node !== 'undefined') {
                let nodeNames = this.atts.node.split(",");
                let count = Math.min(nodeNames.length, data.length);
                for(let i = 0; i < count; i++) {
                    data[i] = this.getNodeByLevels(nodeNames[i], data[i]);
                }
            }
        }

        // Color schemes, which can be invoked by the parameter
        // colorscheme=N, where N is an index. Default is N=0.
        this.colors = [
            d3.schemeCategory20,
            ["#34B3E4","#B79EC7","#F38A78","#EC9F48","#57BFC1","#F0C23B","#F289B7","#92C749","#9D9FA1","#046293","#66418C","#AF1923","#A8480C","#14717B","#9E7C21","#AC2258","#4C792D","#4D4F51"]
        ];

        // If this is a comparison chart, then data is an array.
        if(data.constructor !== Array) {
            if(typeof this.atts.colorscheme === 'undefined' ||
                typeof this.colors[this.atts.colorscheme] === 'undefined') {
                this.atts.colorscheme = 0;
            }
            this.setColors(data);
        }

        // The configuration, from the config.json file.
        this.avg_tax_bill = config['avg_tax_bill'];
        this.default_tax_year = config['default_tax_year'];
        this.fiscal_year_start = config['fiscal_year_start'];

        // The jQuery object for the chart div
        // and the chart's data.
        this.$div = $div;
        this.data = data;

        // Set the chart width & height if user set them.
        if(typeof this.atts.width !== 'undefined') {
            this.$div.width(this.atts.width);
        }
        if(typeof this.atts.height !== 'undefined') {
            this.$div.height(this.atts.height);
        }

        // Set the class if the user set such a parameter.
        if(typeof this.atts.class !== 'undefined') {
            this.$div.addClass(this.atts.class);
        }

        // Determine the initial date.
        // The shared state among charts. These properties are used
        // for the interaction between charts.
        this.state = {
            hash: this.data.hash,
            myTaxBill: this.determineMyTaxBill(this.avg_tax_bill),
            groups: [],
            date: this.getDefaultDate() + "",
            dragging: false,
            mouseX: null
        }

        // Bind the window resize event to the redraw function.
        window.addEventListener("resize", () => {
            this.resize();
        });
    }

    redraw() {
        // Redraw the chart.
        console.log('Drawing chart ' + this.atts.hash + '.');
        this.$div.html('[vb-chart]');
    }

    // Triggered by window resize.
    resize() {
        this.redraw();
    }

    destroy() {
        // Remove everything in the chart.
        console.log('Destroying chart ' + this.atts.hash + '.');
        // To do.
    }

    setState(newState) {
        this.state = Object.assign({}, this.state, newState);
        this.redraw();
    }

    setColors(data) {
        // We will count through, getting new colors.
        let colorscheme = this.colors[this.atts.colorscheme];
        let i = 0;
        let pickAColor = function() {
            if (!colorscheme[i]) {
                i = 0;
            }
            return colorscheme[i++];
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
            return string.charAt(0).toLowerCase() + string.slice(1);
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

    // Determines the "mytaxbill" value. Can come from (in order of priority) either
    // local persistent storage, the VB state, a chart attribute, or hardcoded default.
    determineMyTaxBill(defaultBill) {

        // Check to see if a value for mytaxbill is already locally stored for this session.
        let myTaxBill = this.getLocalStorageVar("myTaxBill")
        if (myTaxBill !== null) {
            return myTaxBill;
        }

        // If not, return the current state's myTaxBill.
        if (typeof this.state !== 'undefined') {
            return this.state.myTaxBill;
        }

        // If still not, return the attribute "mytaxbill".
        return this.getAttribute('mytaxbill', defaultBill);
    }

    // Returns the value of a locally stored variable, if it exists.
    // If storage is unavailable or the variable isn't stored, returns null.
    getLocalStorageVar(name, defaultVal=null) {
        if (typeof(Storage) !== "undefined") {
            if(sessionStorage[name]) {
                return sessionStorage[name];
            }
        }
        return defaultVal;
    }

    // What is the dollarAmount corresponding to a given date for
    // a given node in the dataset?
    dollarAmountOfDate(date, node=this.data) {
        // Find the right dollar amount for our date.
        let dollarAmountObjs = [...node.dollarAmounts];
        let obj = this.filterTakeFirst(dollarAmountObjs, e => e.date == date);
        return obj.dollarAmount;
    }

    // Returns the dollarAmount of the date multiplied by the tax ratio
    // (i.e. the meta property "FUNDED_BY_TAXES") for the item.
    // This function is recursive, calculating dollarAmount*taxRatio for each
    // leaf before summing them.
    taxAdjustedDollarAmountOfDate(date, node=this.data) {
        if(node.children.length == 0) {
            // Find the right dollar amount for our date.
            let dollarAmountObjs = [...node.dollarAmounts];
            let obj = this.filterTakeFirst(dollarAmountObjs, e => e.date == date);

            // Get the "FUNDED_BY_TAXES" fraction. Constrain it to [0,1].
            let fundedByTaxes = this.getMetaProperty("FUNDED_BY_TAXES", 1, node);
            fundedByTaxes = Math.min(Math.max(fundedByTaxes, 0), 1);

            // Simply multiply
            return obj.dollarAmount * fundedByTaxes;
        } else {
            // There are children. Recurse over them.
            let childDollarAmounts = node.children.map(
                            e => this.taxAdjustedDollarAmountOfDate(date, e)
                        );
            return childDollarAmounts.reduce((a,b) => a+b, 0);
        }
    }

    // Get a meta property (of the dataset) by name.
    getMetaProperty(propName, defaultValue='', node=this.data) {
        let meta = this.filterTakeFirst(node.meta, e => e.name == propName);
        return meta ? meta.value : defaultValue;
    }

    // Get an attribute (i.e. query parameter) by name,
    // accounting for default value and acceptable values.
    //      name             : string
    //      defaultvalue     : string
    //      acceptableValues : array of strings
    getAttribute(name, defaultValue='', acceptableValues=[]) {
        // If the attribute isn't set, return the default.
        if (!this.atts.hasOwnProperty(name)) {
            return defaultValue;
        }

        // If the attribute is set and it isn't an acceptable value,
        // return the default as well.
        let value = this.atts[name];
        if (acceptableValues.length > 0 &&
            acceptableValues.indexOf(value) == -1) {
            return defaultValue;
        } else {
            // Otherwise, return the set value.
            return value;
        }
    }

    dollarAmountOfCurrentDate(node=this.data) {
        return this.dollarAmountOfDate(this.state.date, node);
    }

    // Apply a filter function to an array and return the first match.
    // Return null if nothing in the array passes the filter.
    filterTakeFirst(array, filterFunc) {
        let filtered = array.filter(filterFunc);

        if (filtered.length == 0) {
            // There were no elements matching the filter function.
            return null;
        } else {
            // Choose the first one, like the function name says.
            return filtered[0];
        }
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

    // To title case
    toTitleCase(str) {
        return str.replace(/(?:^|\s)\w/g, function(match) {
            return match.toUpperCase();
        });
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

    // Get a child node by its name.
    // Note: only searches in IMMEDIATE children of the data argument.
    getChildNodeByName(str, data) {

        // Normalize our strings.
        let normalize = function(s) {
            return s.replace(/ /g, "_").toLowerCase();
        }

        // Loop through, return the first match.
        for(let i = 0; i < data.children.length; i++) {
            let child = data.children[i];
            if(normalize(child.name) == normalize(str)) {
                return child
            }
        }

        return null;
    }

    // Get a node by a name ID.
    // e.g. Schools:Admin:Salaries
    // If not found, return the original data object.
    getNodeByLevels(str, data) {
        let parts = str.split(":");
        let node = data;

        // Dive down into each part. At any point, if the right
        // child isn't found, return null.
        for(let i = 0; i < parts.length; i++) {
            node = this.getChildNodeByName(parts[i], node);
            if (!node) {
                return data;
            }
        }

        return node;
    }


    // According to configuration settings.
    getDefaultDate() {
        // Current calendar year.
        let theYear = new Date().getFullYear();

        // When the fiscal year turns over.
        let endOfFiscalYear = new Date(this.fiscal_year_start + ' 1 ' + new Date().getFullYear());
        // Today's date.
        let today = new Date();

        // If we've passed the end of the fiscal year, increment.
        if(today > endOfFiscalYear) {
            theYear++;
        }

        // If the default tax year is "next year", increment again.
        if(this.default_tax_year == "next") {
            theYear++;
        }

        return theYear;
    }

}
