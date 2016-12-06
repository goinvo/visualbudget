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
    }

    redraw() {
        console.log('Drawing chart ' + this.atts.hash + ' (mytaxbill).');
        // Nothing to do.
    }

    constructInput() {
        this.$div.append("<span>$</span><input type='text' class='vb-mytaxbill' placeholder='2000'>");
    }

}
