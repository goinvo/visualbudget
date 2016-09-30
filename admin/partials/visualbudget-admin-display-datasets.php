<?php
/**
 * This file displays the content of the "Datasets" tab in the dashboard.
 */
?>
<form method="post" action="options.php" enctype="multipart/form-data">
<?php
// Grab the saved options.
$this->settings->options = get_option( 'visualbudget_tab_datasets' );
// Display the settings fields here.
settings_fields( 'visualbudget_tab_datasets' );
do_settings_sections( 'visualbudget_tab_datasets' );
// Submit button for the upload.
submit_button('Add new dataset');
?>
</form>
<h2>My datasets</h2>
<div class='bootstrap-wrapper'><!-- Bootstrap styles work inside this div -->
<?php

// Get all the existing datasets.
$datasets = $this->datasets;

// Test to see if there actually are any datasets.
if (empty($datasets)) {

    // If not, say so.
    echo '<div><p>There are no datasets.</p></div>';

} else {

    // If there are datasets, print some information for each one
    foreach ($datasets as $dataset) {
        $props = $dataset->get_properties();

        echo '<br/>';
        echo '<div class="row"><div class="col-md-5">';
        echo '<strong>' . $props['uploaded_name'] . '</strong>';
        echo ' [<a href="?' . http_build_query($_GET) . '&delete=' . $props['id'] . '">delete</a>]';
        echo '<br/>';
        echo $dataset->num_rows() . ' rows &times; ' . $dataset->num_cols() . ' columns';
        echo '<br/>';
        echo 'added ' . date('H:i', $props['created']) . ' on '. date('j M Y', $props['created']);
        echo '<br/>';
        echo '<small>JSON: <a href="' . VISUALBUDGET_UPLOAD_URL . $props['filename'] . '">'
                    . $props['filename'] . '</a></small>';
        echo '<br/>';
        echo '<small>Original: <a href="' . VISUALBUDGET_UPLOAD_URL . $props['original_filename'] . '">'
                    . $props['original_filename'] . '</a></small>';
        echo '</div><div class="col-md-7">';
        $corner = VisualBudget_Dataset::infer_levels($dataset->corner());
        // table code from http://stackoverflow.com/a/37727144/1516307
        $tbody = array_reduce(array_slice($corner,1), function($a, $b){return $a.="<tr><td>".implode("</td><td>",$b)."</td></tr>";});
        $thead = "<tr><th>" . implode("</th><th>", array_values($corner[0])) . "</th></tr>";

        echo "<small><table class='table table-condensed table-responsive'>\n$thead\n$tbody\n</table></small>";
        echo '</div></div>';
    }
}

?>
</div>