<?php
/**
 * This file displays the content of the "Visualizations" tab in the dashboard.
 */
?>
<div class='bootstrap-wrapper'>

    <br/><br/><br/>

    <div ng-app="vbAdmin" ng-controller="vbController as vbCtrl">

        <tabs>

            <pane title="Linechart" vb-chart-type="linechart"></pane>
            <pane title="Stacked area graph" vb-chart-type="stackedarea"></pane>
            <pane title="Treemap" vb-chart-type="treemap"></pane>
            <pane title="Metrics" vb-chart-type="metrics"></pane>



            <pane title="Trends">
                <chart></chart>
                <br/><br/>
                <select class='vb-dataset-select'
                        ng-model="chart.dataset"
                        ng-options="Loading..."
                        ng-change="vbCtrl.redrawChart()">
                        </select>
                <br/><br/>
                <rz-slider
                           rz-slider-model="chart.minDate"
                           rz-slider-high="chart.maxDate"></rz-slider>
                <br/><br/>
                The above vis is generated using the following shortcode:
                <br/><br/>
                <shortcode></shortcode>
                <iframelink></iframelink>
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
