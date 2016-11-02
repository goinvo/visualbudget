<?php
/**
 * This file displays the content of the "Visualizations" tab in the dashboard.
 */
?>
<div class='bootstrap-wrapper'>

    <br/><br/><br/>

    <div ng-app="vbAdmin" ng-controller="vbVisualizationsController as vbCtrl">

        <tabs>
            <pane title="Trends">
                <div class='vb-chart-wrapper'></div>
                <br/><br/>
                <div class='vb-select-wrapper'>
                    <select class='vb-dataset-select'
                        ng-model="vbChartData.dataset"
                        ng-options="d.uploaded_name for d in datasets"
                        ng-change="vbCtrl.redrawChart()">
                        </select>
                </div>
                <br/><br/>
                <br/><br/>
                <div class='vb-time-slider'></div>
                <br/><br/>
                The above vis is generated using the following shortcode:
                <br/><br/>
                <pre class='vb-shortcode' ng-bind="vbCtrl.getShortcode()"></pre>
                Link to a standalone page of this chart:<br/>
                <a class='vb-iframe-link' ng-href="{{ vbCtrl.getShortcode('iframe_link') }}">{{ vbCtrl.getShortcode('iframe_link') }}</a>
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
