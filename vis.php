<?php

/**
 * Visualization page, using the API specified in the Github wiki.
 */

$text = (isset($_GET['text'])) ? $_GET['text'] : '';
echo "<p>I, the vis, say '" . $text . "'.</p>";