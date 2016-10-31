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
                <chart></chart>
                <br/><br/>
                <select class='vb-dataset-select'
                        ng-model="chart.dataset"
                        ng-options="d.uploaded_name for d in datasets"
                        ng-change="vbCtrl.redrawChart()">
                        </select>
                <br/><br/>
                <rz-slider rz-slider-model="chart.minDate"
                           rz-slider-high="chart.maxDate"></rz-slider>
                <br/><br/>
                The above vis is generated using the following shortcode:
                <br/><br/>
                <shortcode></shortcode>
                <iframelink></iframelink>
            </pane>

            <pane title="Breakdown">
                <div class='vb-chart-wrapper'></div>
                <br/><br/>
                <select class='vb-dataset-select'
                        ng-model="vbChartBreakdown.dataset"
                        ng-options="d.uploaded_name for d in datasets"
                        ng-change="vbCtrl.redrawChart()">
                        </select>
                <br/><br/>
                <br/><br/>
                <div class='vb-time-slider-range'></div>
                <br/><br/>
                <br/><br/>
                The above vis is generated using the following shortcode:
                <br/><br/>
                <pre class='vb-shortcode' ng-bind="vbCtrl.getShortcode()"></pre>
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
