
class VbLegend extends VbChart {

    constructor($div, data, config) {

        // If multiple datasets were passed in, abort.
        if(data.constructor === Array) {
            return
        }

        // Cast the data.
        data.dollarAmounts.forEach(function(d) {
            // d.date = Date.parse(d.date);
            d.dollarAmount = +d.dollarAmount;
        });

        // Call super method.
        super($div, data, config);
    }

    redraw() {
        console.log('Drawing chart ' + this.atts.hash + ' (legend).');
        this.drawLegend();
    }

    setState(newState) {
        this.state = Object.assign({}, this.state, newState);

        // Redraw
        this.redraw();
    }

    /* Draw the actual chart.
     */
    drawLegend() {
        let node = this.getNodeByHash(this.state.hash) || this.data;

        let li = function(text, color) {
            let style = 'background-image: url("data:image/svg+xml,'
                + '<svg xmlns=\\"http://www.w3.org/2000/svg\\" '
                + 'viewBox=\\"0 0 10 10\\"><circle fill=\\"'
                + color + '\\" cx=\\"5\\" cy=\\"5\\" r=\\"5\\"/></svg>");';

            return '<li style=\'' + style + '\'">' + text + '</li>';
        }

        let items = [];
        for(let i = 0; i < node.children.length; i++) {
            items.push(li(node.children[i].name, node.children[i].color));
        }

        let html = "<ul>" + items.join("") + "</ul>";
        this.$div.html(html);
    }

}
