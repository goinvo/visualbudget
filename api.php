<?php
/**
 * API to return JSON of dataset files.
 */

// Return this as plain text to the other end
header("Content-Type: text/plain");

// Get an array of the names of files in the directory
$dir = 'datasets/';
$files = scandir($dir);

// Filter out anything that is not a file
$files = array_filter($files,
    function(&$i) use ($dir) {
        return is_file($dir . $i);
    });

// Print out all the others, one per line
echo implode("\n", $files);
