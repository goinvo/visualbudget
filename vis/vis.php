<?php

/**
 * Visualization page, using the API specified in the Github wiki.
 */

if ( ! isset($_GET['rand']) ) {
    $_GET['rand'] = mt_rand(0, PHP_INT_MAX);
}
$query_string = http_build_query($_GET);
$hash = hash('crc32', $query_string);
$dataset_id = $_GET['data'];
// FIXME: prepend $_SERVER['HTTP_HOST'] to URL to make it absolute.
$dataset_url = dirname(dirname($_SERVER["REQUEST_URI"]))
                . "/datasets/" . $dataset_id . ".json";

// The element will be a div if it's a chart, and a span if it's a metric.
$element_type = 'div';
if ($_GET['vis'] == 'metric') {
    $element_type = 'span';
}

unset($_GET['rand']);
$custom_atts = array();
foreach ($_GET as $key => $val) {
    array_push($custom_atts, 'data-vb-' . $key . '="' . $val . '"');
}

// Build a string of the data attributes.
$data_atts = "data-vb-hash='" . $hash . "' "
        . "data-vb-dataset-url='". $dataset_url . "' "
        . implode(' ', $custom_atts);

// Build the chart div.
$chart_element = "<$element_type "
        . "id='vb-chart-$hash' "
        . "class='vb-chart' "
        . $data_atts
        . ">&nbsp;</$element_type>";


// Check to see if we're displaying an iframe or not.
if ($_GET['iframe']) {

    // Include iframe.php, which is the iframe template.
    // Note: iframe.php uses the variable $chart_element.
    include 'iframe.php';

} elseif (isset($_GET['data_atts'])) {

    // Just echo the data- attributes.
    echo trim($data_atts);

} else {

    // If no "iframe" or "data_atts" argument, then just spit out the div.
    echo $chart_element;

}