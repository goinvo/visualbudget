<?php
/**
 * API to return JSON of dataset files.
 * Because this file is meant to be called directly,
 * it does not interact with $wp_filesystem, which
 * requires credentials. This file is standalone.
 */

// Return this as plain text to the other end
header("Content-Type: text/plain");

// Gotta hardcode something in a standalone file.
// This is the same constant as defined in includes/class-visualbudget.php
define( 'VISUALBUDGET_UPLOAD_DIR', '../datasets/' );

// If the "filename" key of the query string has been defined,
// then look for that file. If it exists, return its contents.
// If it doesn't exist, return an error (as JSON).
if ( isset($_GET['filename']) ) {

    $dataset = $_GET['filename'];
    $dataset_filename = VISUALBUDGET_UPLOAD_DIR . $dataset;
    if ( is_file($dataset_filename) ) {
        echo file_get_contents($dataset_filename);
    } else {
        echo '{"Error":"File not found."}';
    }

// If the 'dataset' key is not defined in the query string,
// then return the names of all the dataset files (as JSON).
} else {

    // Get an array of the names of files in the directory
    $files = scandir(VISUALBUDGET_UPLOAD_DIR);

    // Remove anything that is not a file, and wrap all file
    // names in quotes.
    foreach ($files as $key => $file) {
        if ( is_file(VISUALBUDGET_UPLOAD_DIR . $file) ) {
            // Filter appropriately.
            switch($_GET['filter']) {

                // Only return file IDs.
                case "id":
                    $file = explode('_', explode('.', $file)[0])[0];
                    break;

                // Default, including if there is no filter.
                default:
                    break;
            }

            // If no filter
            $files[$key] = '"' . $file . '"';

        } else {
            unset($files[$key]);
        }
    }

    // Remove duplicates.
    $files = array_unique($files);

    // Print out all the others, one per line
    echo '[';
    echo implode(",", $files);
    echo "]";
}
