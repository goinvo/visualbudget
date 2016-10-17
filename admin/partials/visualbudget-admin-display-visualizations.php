<?php
/**
 * This file displays the content of the "Configuration" tab in the dashboard.
 */
?>
<div><p>

<?php

$datasets = $this->datasets;

if (empty($datasets)) {

    // If not, say so.
    echo 'There are no datasets.';

} else {

    echo '<select>';

    // If there are datasets, print some information for each one
    foreach ($datasets as $n=>$dataset) {
        $props = $dataset->get_properties();
        echo '<option>' . $props['uploaded_name'] . '</option>';
    }

    echo '</select>';
}

echo '</p>';

echo do_shortcode('[visualbudget data=1476477175 vis=linechart]');

?>
</div>
