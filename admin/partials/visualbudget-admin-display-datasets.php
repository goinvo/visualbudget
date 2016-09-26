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
    // Just get the IDs of the datasets
    $numbers = array_map(function($i) {
            return explode('_', $i['name'])[0];
        }, $datasets);

    // We'll have duplicates, so get a unique set
    $numbers = array_unique($numbers);

    // Now print some information for each.
    foreach ($numbers as $number) {

        $meta = $this->filemanager->read_file($number . '_meta.json');
        $meta = json_decode($meta, true);

        $data = $this->filemanager->read_file($number . '_data.json');
        $data = json_decode($data, true);
        $rows = count($data);
        $cols = count($data[0]);

        $corner = array_slice(
                array_map(function($i) {
                    return array_slice($i, 0, 5);
                }, $data),
            0, 4);


        echo '<div>';
        echo 'Uploaded as: ' . $meta['uploaded_name'];
        echo '<br/>';
        echo 'JSON file: <a href="' . VISUALBUDGET_UPLOAD_URL . $meta['filename'] . '">'
                    . $meta['filename'] . '</a>';
        echo '<br/>';
        echo 'Original file: <a href="' . VISUALBUDGET_UPLOAD_URL . $meta['original_filename'] . '">'
                    . $meta['original_filename'] . '</a>';
        echo '<br/>';
        echo 'Size: ' . $rows . ' rows &times; ' . $cols . ' columns';
        echo '<br/>';
        echo 'Corner: ';
        $rows = $meta['corner'];
        // table code from http://stackoverflow.com/a/37727144/1516307
        $tbody = array_reduce(array_slice($corner,1), function($a, $b){return $a.="<tr><td>".implode("</td><td>",$b)."</td></tr>";});
        $thead = "<tr><th>" . implode("</th><th>", array_values($corner[0])) . "</th></tr>";

        echo "<table>\n$thead\n$tbody\n</table>";
        echo '<hr/>';
        echo '</div>';
    }
} else {
    echo 'There are no datasets.';
}
