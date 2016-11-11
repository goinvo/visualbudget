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
                <rz-slider
                           rz-slider-model="chart.minDate"
                           rz-slider-high="chart.maxDate"></rz-slider>
                <br/><br/>
                The above vis is generated using the following shortcode:
                <br/><br/>
                <pre class='vb-shortcode' ng-bind="vbCtrl.getShortcode()"></pre>
                Link to a standalone page of this chart:<br/>
                <a class='vb-iframe-link' ng-href="{{ vbCtrl.getShortcode('iframe_link') }}">{{ vbCtrl.getShortcode('iframe_link') }}</a>
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
