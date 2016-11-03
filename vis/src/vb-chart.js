
class VbChart {

    // Chart
    constructor($div, data) {

        // The jQuery object for the chart div
        // and the chart's data.
        this.$div = $div;
        this.data = data;

        // Properties of the chart are specified as HTML data attributes.
        this.props = $div.data();

        // The shared state among charts. These properties are used
        // for the interaction between charts.
        this.state = {
            groups: [],
            date: "2016"
        }
    }

    setState(newState) {
        this.state = Object.assign({}, this.state, newState);
        // Do stuff with new state.
    }

    redraw() {
        // Redraw the chart.
        console.log('Drawing chart ' + this.props.vbHash + '.');
    }

    destroy() {
        // Remove everything in the chart.
        console.log('Destroying chart ' + this.props.vbHash + '.');
    }



}