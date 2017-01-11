<?php

/**
 * Visualization page, using the API specified in the VB wiki on Github.
 */


// Set the GET variables 'rand' and 'hash' if they are not set
// (which they shouldn't be, but I'm leaving available the option
// to specify them, in case we find a use for that.)
if ( ! isset($_GET['rand']) ) {
    $_GET['rand'] = mt_rand(0, PHP_INT_MAX);
}
if ( ! isset($_GET['hash']) ) {
    $query_string = http_build_query($_GET);
    $_GET['hash'] = hash('crc32', $query_string);
}


/** * * * * * * * * * * * * * * * * * **
 *      FUNCTIONS to be used below.    *
 * * * * * * * * * * * * * * * * * * * */

// Retrieve aliases from aliases.json.
$get_aliases = function() {
    $filename = 'aliases.json';
    $aliases = json_decode(file_get_contents($filename), true);
    return $aliases;
};

// Turn $_GET['data'] into an array of strings.
$data_query_to_array = function($string) {
    // If there is a comma, then the query is a list
    if(strpos($string, ',')) {
        $array = explode(',', $string);
    } else {
        // Otherwise, it's an array with one element.
        $array = array($string);
    }
    return $array;
};

// Return a URL of a dataset given an ID or alias.
// First, check to see if input string an alias;
// if it is an alias, convert it to an ID. Return a URL.
$id_or_alias_to_url = function($string) use ($get_aliases) {
    $aliases = $get_aliases();

    $the_id = $string;
    if (array_key_exists($string, $aliases)) {
        $the_id = $aliases[$string];
    }

    // Absolute URL:
    // $url = $_SERVER['HTTP_HOST'] . dirname(dirname($_SERVER["REQUEST_URI"]))
    //             . "/datasets/" . $the_id . ".json";
    $url = dirname(dirname($_SERVER["REQUEST_URI"]))
                    . "/datasets/" . $the_id . ".json";

    return $url;
};


/** * * * * * * * * * * * * * * * * * **
 *      Main routines & processing.    *
 * * * * * * * * * * * * * * * * * * * */


// Sort out the datasets specified. There may be one or more (comma-separated)
// and they may be specified via ID or via alias. First check to see if each
// is a valid ID; if not, check if it's a valid alias.
// If neither, set the URL anyway using the string provided (the user will
// get an error). [FIXME: << is that right? should the chart just
// say "invalid chart"?]
$dataset_names_array = $data_query_to_array($_GET['data']);
$dataset_urls = array_map($id_or_alias_to_url, $dataset_names_array);
if(count($dataset_urls) == 1) {
    $dataset_url = $dataset_urls[0];
}


// Now build the HTML element.
// The element will be a div if it's a chart, and a span if it's a metric.
$element_type = 'div';
$space = '';
if ($_GET['vis'] == 'metric') {
    $element_type = 'span';
    $space = '&nbsp;'; // A bit hacky. This is for the dashboard,
                       // so that the element doesn't flicker when
                       // reloading.
}

// We won't include 'rand' in the HTML data attributes, so unset it.
unset($_GET['rand']);

// Include all variables as attributes, including arbitrary ones.
$custom_atts = array();
foreach ($_GET as $key => $val) {
    array_push($custom_atts, 'data-vb-' . $key . '="' . $val . '"');
}

// Build a string of the data attributes.
if($dataset_url) {
    $data_atts = "data-vb-dataset-url='". $dataset_url . "' "
            . implode(' ', $custom_atts);
} else {
    $data_atts = "data-vb-dataset-urls='". $dataset_urls . "' "
            . implode(' ', $custom_atts);
}

// Build the chart div/span.
$chart_element = "<$element_type "
        . "id='vb-chart-" . $_GET['hash'] . "' "
        . "class='vb-chart vb-chart-" . $_GET['vis'] . "' "
        . $data_atts
        . ">$space</$element_type>";



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