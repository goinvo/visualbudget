/*
 * My Tax Bill: This component allows the user to enter their tax bill
 * and to see where each penny of it goes (via treemap or linechart).
 */
class VbMyTaxBill extends VbChart {

    constructor($div, config) {

        // Call super method.
        super($div, [], config);

        // Make it inline.
        $div.css({"display": "inline"});

        // Add the input.
        this.constructInput();

        // Bind the event for input change.
        // The "propertychange" event is for IE <9.
        jQuery('.vb-mytaxbill').on('input propertychange', this.inputChangeHandler(this));
    }

    // The redraw just ensures the value of the input is set correctly.
    redraw() {
        console.log('Drawing chart ' + this.atts.hash + ' (mytaxbill).');
        this.$div.find('.vb-mytaxbill').val(this.state.myTaxBill);
        console.log('My Tax Bill is ' + this.state.myTaxBill + ".")
    }

    // Triggered by window resize.
    resize() {
        this.redraw();
    }

    // Create the HTML element for the input.
    constructInput() {
        this.$div.append("<span>$</span><input type='text' class='vb-mytaxbill' placeholder='"
            + this.defaulttaxbill + "' value='" + this.getLocalStorageVar("myTaxBill", "") + "'>");
    }

    // The handler for the 'input' event.
    inputChangeHandler(that) {
        return function(event) {

            // First validate the input.
            let string = event.target.value;
            let validatedString = string.replace(/[^\d\.]/g, '')
                                    .replace(/^\.*/, '')
                                    .replace(/(\.\d{0,2})(.*)/, '$1');
            let validNumber = Math.abs(parseFloat(validatedString));
            if (!validNumber && validNumber !== 0) {
                validNumber = '';
            }

            // Store the tax bill in local storage if it's supported.
            if (typeof(Storage) !== "undefined") {
                sessionStorage.myTaxBill = validNumber;
            } else {
                console.log("Local storage not supported. 'My Tax Bill' will not be " +
                    "persistent across this session.")
            }

            // Broadcast the change to set the state.
            // (The value of the input will change when the broadcast,
            // which bubbles back down to here, is received.)
            visualbudget.broadcastStateChange({
                myTaxBill: validNumber
            });
        }
    }

}
