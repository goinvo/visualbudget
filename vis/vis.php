<?php

/**
 * Visualization page, using the API specified in the Github wiki.
 */

if ( ! isset($_GET['rand']) ) {
    $_GET['rand'] = random_int(PHP_INT_MIN, PHP_INT_MAX);
}
$query_string = http_build_query($_GET);
$hash = hash('crc32', $query_string);
$dataset_id = $_GET['data'];
$vis_type = $_GET['vis'];
$dataset_url = dirname(dirname($_SERVER["REQUEST_URI"]))
                . "/datasets/" . $dataset_id . ".json";

// Build the chart div.
$chart_div = "<div "
        . "id='vb-chart-$hash' "
        . "class='vb-chart' "
        . "data-vb-dataset-url='". $dataset_url . "' "
        . "data-vb-vis-type='$vis_type' "
        . "data-vb-dataset-id='$dataset_id'"
        . "></div>";


// Check to see if we're displaying an iframe or not.
if (isset($_GET['iframe'])) {

    // Include iframe.php, which is the iframe template.
    // Note: iframe.php uses the variable $chart_div.
    include 'iframe.php';

} else {

    // If no "iframe" argument, then just spit out the div.
    echo $chart_div;

}