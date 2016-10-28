<?php
/**
 * This file displays the content of the "Visualizations" tab in the dashboard.
 */
?>
<div class='bootstrap-wrapper'>

<br/><br/><br/>

<div ng-app="vbAdmin" ng-controller="vbVisualizationsController">

    <tabs>
        <pane title="Trends">
            <select ng-model="vbChartData.dataset"
                    ng-options="d.uploaded_name for d in datasets"
                    ng-change="redrawChart()">
                    </select>
            <div id='chart-wrapper'></div>
            <br/><br/>
            The above vis is generated using the following shortcode:
            <br/><br/>
            <textarea id='vb-shortcode' disabled='disabled'>{{ vbChartData.dataset.id }}</textarea>
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
