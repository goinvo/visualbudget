<?php
/**
 * This file displays the content of the "Configuration" tab in the dashboard.
 */

$datasets = $this->datasets;

// if (empty($datasets)) {
//     // FIXME: What do?
// } else {
//     echo '<select id="vb-select-dataset">';

//     // If there are datasets, print some information for each one
//     foreach ($datasets as $n=>$dataset) {
//         $props = $dataset->get_properties();
//         $atts = array(
//                 'data' => $props['id'],
//                 'vis' => 'linechart',
//                 'data_atts' => 1
//             );
//         $vis_atts_url = VISUALBUDGET_URL . 'vis/vis.php?'
//                             . http_build_query($atts);
//         echo '<option '
//             . file_get_contents($vis_atts_url)
//             . '>' . $props['uploaded_name'] . '</option>';
//     }

//     echo '</select>';
// }
?>
<div class='bootstrap-wrapper'>

<br/><br/><br/>

<div ng-app="vbAdmin" ng-controller="vbVisualizationsController">

    <tabs>
        <pane title="Trends">
            <select ng-model="vbDatasetSelect"
                    ng-options="d.uploaded_name for d in datasets"
                    ng-change="">
                    </select>
            <div id='vb-chart' class='vb-chart'></div>
            <br/><br/>
            The above vis is generated using the following shortcode:
            <br/><br/>
            <pre id='vb-shortcode' ng-model='vbShortcode'>[visualbudget data={{vbDatasetSelect.id}} vis=linechart]</pre>
        </pane>
        <pane title="Breakdown">
        </pane>
        <pane title="Comparison">
        </pane>
        <pane title="Ratio">
        </pane>
        <pane title="Difference">
        </pane>
        <pane title="Metrics">
        </pane>
        <pane title="Custom">
        </pane>
    </tabs>

</div>

</div>



