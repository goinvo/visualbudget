<?php
/**
 * This file displays the content of the "Configuration" tab in the dashboard.
 */
?>
<div class='bootstrap-wrapper'><p></p>&nbsp;<p>

<?php

$datasets = $this->datasets;

if (empty($datasets)) {

    // If not, say so.
    echo 'There are no datasets.';

} else {

    echo '<select id="vb-select-dataset">';

    // If there are datasets, print some information for each one
    foreach ($datasets as $n=>$dataset) {
        $props = $dataset->get_properties();
        $atts = array(
                'data' => $props['id'],
                'vis' => 'linechart',
                'data_atts' => 1
            );
        $vis_atts_url = VISUALBUDGET_URL . 'vis/vis.php?'
                            . http_build_query($atts);
        echo '<option '
            . file_get_contents($vis_atts_url)
            . '>' . $props['uploaded_name'] . '</option>';
    }

    echo '</select>';
}

// echo do_shortcode('[visualbudget data=1476739268 vis=linechart]');

?>
</p>

<div id='vb-chart' class='vb-chart'></div>

<br/><br/>
<br/><br/>
The above vis is generating using the following shortcode:
<br/>
<br/>
<pre id='vb-shortcode'></pre>

</div>
