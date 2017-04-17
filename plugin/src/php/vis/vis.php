<?php

/**
 * Visualization page, using the API specified in the VB wiki on Github.
 */

// Gotta hardcode something in a standalone file.
// This is the same constant as defined in includes/class-visualbudget.php
define('WP_PLUGINS_DIR', dirname(dirname(dirname($_SERVER["REQUEST_URI"]))));
define('VISUALBUDGET_UPLOAD_DIR', '/visualbudget-datasets/');
define('VISUALBUDGET_ALIASES_FILE', '../../' . VISUALBUDGET_UPLOAD_DIR . 'settings/aliases.json');


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
    $filename = VISUALBUDGET_ALIASES_FILE;
    if(file_exists($filename)) {
        $aliases = json_decode(file_get_contents($filename), true);
        return $aliases;
    } else {
        return Array();
    }
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

    // Output relative URLs to localhost; absolute URLs to real websites.
    $whitelist = array('127.0.0.1', '::1');
    if(in_array($_SERVER['REMOTE_ADDR'], $whitelist)) {
        // Site is running on localhost. Use relative URL.
        $url = WP_PLUGINS_DIR . VISUALBUDGET_UPLOAD_DIR . $the_id . ".json";
    } else {
        // Site is not on localhost. Use absolute URL. 
        $url = "//" . $_SERVER['HTTP_HOST'] . WP_PLUGINS_DIR . VISUALBUDGET_UPLOAD_DIR . $the_id . ".json";
    }

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

// If there is no "data" variable, then it should be a "mytaxbill" vis.
if(!isset($_GET['data'])) {
    $_GET['data'] = '';
}
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
if ($_GET['vis'] == 'mytaxbill') {
    $data_atts = implode(' ', $custom_atts);   
} elseif($dataset_url) {
    $data_atts = "data-vb-dataset-url='". $dataset_url . "' "
            . implode(' ', $custom_atts);
} else {
    $data_atts = "data-vb-dataset-urls='". implode(',', $dataset_urls) . "' "
            . implode(' ', $custom_atts);
}

// Build the chart div/span.
$chart_element = "<$element_type "
        . "id='vb-chart-" . $_GET['hash'] . "' "
        . "class='vb-chart vb-chart-" . $_GET['vis'] . "' "
        . $data_atts
        . ">$space</$element_type>";



// Check to see if we're displaying an iframe or not.
if (isset($_GET['iframe'])) {

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