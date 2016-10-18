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

// Build a string of the data attributes.
$data_atts = "data-vb-hash='" . $hash . "' "
        . "data-vb-dataset-url='". $dataset_url . "' "
        . "data-vb-dataset-id='$dataset_id'"
        . "data-vb-vis-type='$vis_type'";

// Build the chart div.
$chart_div = "<div "
        . "id='vb-chart-$hash' "
        . "class='vb-chart' "
        . $data_atts
        . "></div>";


// Check to see if we're displaying an iframe or not.
if (isset($_GET['iframe'])) {

    // Include iframe.php, which is the iframe template.
    // Note: iframe.php uses the variable $chart_div.
    include 'iframe.php';

} elseif (isset($_GET['data_atts'])) {

    // Just echo the data- attributes.
    echo trim($data_atts);

} else {

    // If no "iframe" or "data_atts" argument, then just spit out the div.
    echo $chart_div;

}