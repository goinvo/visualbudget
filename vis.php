<?php

/**
 * Visualization page, using the API specified in the Github wiki.
 */

header("Content-type: text/html");

// FIXME: Maybe add a $_GET['iframe'] variable -- if true,
// return an iframe. Otherwise return a div.
?><!DOCTYPE html>
<html>
<head>




<style> /* set the CSS */
body { font: 12px Arial;}
path {
    stroke: steelblue;
    stroke-width: 2;
    fill: none;
}
.axis path,
.axis line {
    fill: none;
    stroke: grey;
    stroke-width: 1;
    shape-rendering: crispEdges;
}
</style>





<script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.6/d3.min.js'></script>
<script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js'></script>
<script type='text/javascript'><?php
    require_once 'includes/class-visualbudget.php';
    require_once 'admin/class-visualbudget-dataset.php';
    // VisualBudget::define_constants();
    if (isset($_GET['data'])) {
        // FIXME: do validation here. What if the ID is not an ID?
        $qdata = explode(':', $_GET['data']);
        $id = $qdata[0];
        array_shift($qdata);
        // $dataset = new VisualBudget_Dataset(array('id'=>$id));

        // if ($dataset->is_valid()) {
        //     $json = json_encode( $dataset->query($qdata) );
        //     echo "window._visualbudget_data=";
        //     print_r($json);
        //     echo ";";
        // } else {
        //     echo "null";
        //     $json = "Dataset not found.";
        // }
    } else {
        // FIXME:
        // If no "data" was specified, what to do?
    }
?>

<?php /* FIXME: should we inject the data directly into a JS variable? */ ?>
$( document ).ready(function() {

    // d3.csv("api.php?dataset=<?php echo $id; ?>_data.csv")
    //     .get(function(data) {
    //         $('#data').html(JSON.stringify(data));
    //     });

    // $('#data').html(JSON.stringify(data));










// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.timeFormat("%d-%b-%y").parse;

// Set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Define the axes
// only show the year in the x-axis, not the month
var xAxis = d3.axisBottom().scale(x)
                .tickFormat(function(time, index) { return time.getUTCFullYear(); });

var yAxis = d3.axisLeft().scale(y)
                .ticks(5);

// Define the line
var valueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.value); });

// Adds the svg canvas
var svg = d3.select("#chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.json("data.json", function(error, data) {

    data.values.forEach(function(d) {
        d.date = Date.parse(d.date);
        d.value = +d.value;
    });

    // Scale the range of the data
    x.domain(d3.extent(data.values, function(d) { return d.date; }));
    y.domain([0, d3.max(data.values, function(d) { return d.value; })]);

    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data.values));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

});









});

</script>
</head>
<body>
<pre id='data'></pre>
<div id='chart'></div>
</body>
</html>
