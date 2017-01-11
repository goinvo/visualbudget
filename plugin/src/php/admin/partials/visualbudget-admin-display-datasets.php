<?php
/**
 * This file displays the content of the "Datasets" tab in the dashboard.
 *
 * Note that the form in this page is not POST'd to options.php but rather
 * to this page itself. WordPress does funny things when things to go
 * options.php, and if we did that then the error notices would not
 * display here.
 */


// Table generation code from http://stackoverflow.com/a/37727144/1516307
function make_html_table($data) {
    $tbody = array_reduce(array_slice($data,1), function($a, $b) {
                    return $a.="<tr><td><div class='tablecell'>".implode("</div></td><td><div class='tablecell'>",$b)."</div></td></tr>";
                });
    $thead = "<tr><th>" . implode("</th><th>", array_values($data[0])) . "</th></tr>";
    $html = "<table class='table table-condensed table-responsive table-bordered'>\n$thead\n$tbody\n</table>";
    return $html;
}
?>
<form method="post" action="<?php echo $_SERVER['REQUEST_URI']?>" enctype="multipart/form-data">
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

<hr/>
<h2>Aliases</h2>
<form method="post" action="<?php echo $_SERVER['REQUEST_URI']?>">
<?php
$datasets = $this->datasets;

// Only offer the option to create aliases if there are already datasets uploaded.
if(!empty($datasets)) {

    // Create the HTML for a <select> component. The given $id will be
    // preselected if it is given and matches the ID of an existing dataset.
    $select_html = function($datasets, $selected_id=false) {
        $html = '<select name="visualbudget_alias_id[]">';
        foreach($datasets as $dataset) {
            // Get the dataset's properties.
            $props = $dataset->get_properties();

            // Determine if the current option is selected.
            $selected = '';
            if($props['id'] == $selected_id) {
                $selected = ' selected="SELECTED"';
            }

            // Build the HTML for this option.
            $html .= '<option value="' . $props['id'] . '"' . $selected . '>';
            $html .= $props['uploaded_name'] . ' - (ID: ' . $props['id'] . ')</option>';
        }
        $html .= '</select>';
        return $html;
    };

    // Print all existing aliases.
    $aliases = $this->aliases;
    foreach($aliases as $alias => $id) {
        echo '<input type="text" name="visualbudget_alias_name[]" value="' . $alias . '" />';
        echo $select_html($datasets, $id);
        echo "<br/>";
    }

    // Print another field for creating a new alias.
    echo '<input type="text" name="visualbudget_alias_name[]" value="" placeholder="New alias" />';
    echo $select_html($datasets);
    echo "<br/>";
}
?>
<input type='submit' name='visualbudget_submit_aliases' value='Update aliases'>
</form>
<hr/>

<h2>My datasets</h2>
<div class='bootstrap-wrapper dataset-listings'><!-- Bootstrap styles work inside this div -->
<?php

// Get all the existing datasets.
$datasets = $this->datasets;

// Test to see if there actually are any datasets.
if (empty($datasets)) {

    // If not, say so.
    echo '<div><p>There are no datasets.</p></div>';

} else {

    // If there are datasets, print some information for each one
    foreach ($datasets as $n => $dataset) {
        $props = $dataset->get_properties();

        echo '<br/>';
        echo '<div class="row"><div class="col-md-4 dataset-info">';
        // echo '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
        echo '<strong>' . $props['uploaded_name'] . '</strong>';
        echo '<br/>';
        // echo '<span class="glyphicon glyphicon-th" aria-hidden="true"></span>';
        echo $dataset->num_rows() . ' rows &times; ' . $dataset->num_cols() . ' columns';
        echo '<br/>';
        echo '<span class="glyphicon glyphicon-time" aria-hidden="true"></span>';
        echo date('H:i', $props['created']) . ' on '. date('j M Y', $props['created']);
        echo '<br/>';
        echo '<span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span>';
        echo '<small><a href="' . VISUALBUDGET_UPLOAD_URL . $props['filename_json'] . '">'
                    . 'JSON</a></small>';
        echo ' &middot; <small><a href="' . VISUALBUDGET_UPLOAD_URL . $props['filename_original'] . '">'
                    . 'Original</a></small>';
        echo '<br/>';
        // echo '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>';
        echo '<span class="dataset-actions"><a href="?' . http_build_query($_GET) . '&delete=' . $props['id'] . '"><span class="label label-danger">delete</span></a></span>';

        echo '</div><div class="col-md-8">';

        $corner = $dataset->corner();
        $alldata = $dataset->get_data();

        echo '<div id="datamodal' . $n . '" style="display:none;" class="bootstrap-wrapper"><small>' . make_html_table($alldata) . '</small></div>';

        echo '<a href="#datamodal' . $n . '" rel="modal:open" class="tablelink">';
        echo "<div class='tablewrap'><small>" . make_html_table($corner) . "</small></div>";
        echo '</a>';

        echo '</div></div>';
    }
}

?>
</div>