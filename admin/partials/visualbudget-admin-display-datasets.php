<?php
/**
 * This file displays the content of the "Datasets" tab in the dashboard.
 */
?><h2>Add a new dataset</h2>
<div><h3>Upload</h3></div>
<div><h3>From URL</h3></div>
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