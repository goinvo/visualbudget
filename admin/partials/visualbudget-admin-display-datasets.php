<?php
/**
 * This file displays the content of the "Datasets" tab in the dashboard.
 */
?>
<!-- <input type='hidden' name='MAX_FILE_SIZE' value='8388608' /> -->
<form method="post" action="options.php" enctype="multipart/form-data">
<?php
// Grab the saved options
$this->settings->options = get_option( 'visualbudget_tab_datasets' );

settings_fields( 'visualbudget_tab_datasets' );
do_settings_sections( 'visualbudget_tab_datasets' );
submit_button('Upload file');
?>
</form>
<div><h3>From URL</h3></div>
<form method="post" action="options.php">
<input name='xxx' id='xxx' type='text' />
<?php submit_button('Add file from URL'); ?>
</form>
<hr/>
<h2>My datasets</h2>
<?php
$datasets = $this->filemanager->get_datasets_inventory();
if (!empty($datasets)) {
    foreach ($datasets as $dataset) {
        echo '<div>' . $dataset['name'] . '</div>';
    }
} else {
    echo 'There are no datasets.';
}
?>