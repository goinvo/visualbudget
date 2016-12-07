/*
 * My Tax Bill: This component allows the user to enter their tax bill
 * and to see where each penny of it goes (via treemap or linechart).
 */
class VbMyTaxBill extends VbChart {

    constructor($div, data) {

        // Call super method.
        super($div, data);

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
        this.$div.val(this.state.myTaxBill);
        console.log('My Tax Bill is ' + this.state.myTaxBill)
    }

    // Create the HTML element for the input.
    constructInput() {
        this.$div.append("<span>$</span><input type='text' class='vb-mytaxbill' placeholder='2000'>");
    }

    // The handler for the 'input' event.
    inputChangeHandler(that) {
        return function(event) {
            let string = event.target.value;
            let validatedString = string.replace(/[^\d\.]/g, '')
                                    .replace(/^\.*/, '')
                                    .replace(/(\.\d{0,2})(.*)/, '$1');
            let validNumber = Math.abs(parseFloat(validatedString)) || '';

            // Set the state and broadcast the change.
            // (The value of the input will change upon broadcast,
            // which bubbles back down to here.)
            jQuery('.vb-mytaxbill').val(validNumber);
            that.state.myTaxBill = validNumber;
            visualbudget.broadcastStateChange(that.state);
        }
    }

}
