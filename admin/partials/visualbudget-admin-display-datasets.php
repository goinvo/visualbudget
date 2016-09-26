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
<!--
<div><h3>From URL</h3></div>
<form method="post" action="options.php">
<input name='xxx' id='xxx' type='text' />
<?php submit_button('Add file from URL'); ?>
</form>
-->
<h2>My datasets</h2>
<div class='bootstrap-wrapper'>
<?php
$datasets = $this->filemanager->get_datasets_inventory();
$filenames = array_keys($datasets);

// First check if we are supposed to delete any of them.
// If the DELETE query key is set, make sure it actually refers to
// a real file.
$delete_num = false;
if ( isset($_GET['delete'])
    && $this->filemanager->is_file($_GET['delete'] . '_data.json') ) {

    $delete_num = $_GET[ 'delete' ];
}

if ($delete_num) {
    // We must delete every file with the $delete_num value in the filename;
    // $delete_num is a number, and we search for NUMBER_data.json
    // NUMBER_meta.json, etc.
    $filenames_to_delete = array_filter($filenames,
        function($filename) use ($delete_num) {
            return ( strpos($filename, $delete_num) !== false );
        });

    foreach ($filenames_to_delete as $filename) {
        $this->filemanager->move_file($filename, 'trash/' . $filename);
    }

    // Now get the inventory again, since it has changed.
    $datasets = $this->filemanager->get_datasets_inventory();
    $filenames = array_keys($datasets);
}


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


        // echo '<hr/>';
        echo '<br/>';
        echo '<div class="row">';
        echo '<div class="col-md-5">';
        echo '<strong>' . $meta['uploaded_name'] . '</strong>';
        echo ' [<a href="?' . http_build_query($_GET) . '&delete=' . $number . '">delete</a>]';
        echo '<br/>';
        echo $rows . ' rows &times; ' . $cols . ' columns';
        echo '<br/>';
        echo '<small>JSON: <a href="' . VISUALBUDGET_UPLOAD_URL . $meta['filename'] . '">'
                    . $meta['filename'] . '</a></small>';
        echo '<br/>';
        echo '<small>Original: <a href="' . VISUALBUDGET_UPLOAD_URL . $meta['original_filename'] . '">'
                    . $meta['original_filename'] . '</a></small>';
        echo '</div>';
        echo '<div class="col-md-7">';
        $rows = $meta['corner'];
        // table code from http://stackoverflow.com/a/37727144/1516307
        $tbody = array_reduce(array_slice($corner,1), function($a, $b){return $a.="<tr><td>".implode("</td><td>",$b)."</td></tr>";});
        $thead = "<tr><th>" . implode("</th><th>", array_values($corner[0])) . "</th></tr>";

        echo "<small><table class='table table-condensed table-responsive'>\n$thead\n$tbody\n</table></small>";
        echo '</div>';
        echo '</div>';
    }
} else {
    echo 'There are no datasets.';
}
?>
</div>