<?php
/**
 * API to return JSON of dataset files.
 */

// Return this as plain text to the other end
header("Content-Type: text/plain");

// Get an array of the names of files in the directory
$files = scandir('datasets/');

// Remove the virtual directories '.' and '..'
$files = array_diff_key($files, ['.', '..']);

// Print out all the others, one per line
echo implode("\n", $files);
