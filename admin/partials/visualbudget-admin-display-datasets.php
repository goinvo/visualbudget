<?php
/**
 * This file displays the content of the "Datasets" tab in the dashboard.
 */
?><h2>Add a new dataset</h2>
<div><h3>Upload</h3></div>
<!-- <input type='hidden' name='MAX_FILE_SIZE' value='8388608' /> -->
<form method="post" action="options.php">
<input name='xxx' id='xxx' type='file' />
<?php submit_button('Upload file'); ?>
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