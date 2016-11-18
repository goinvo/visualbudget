<?php
/**
 * This file displays the content of the "Visualizations" tab in the dashboard.
 */
?>
<div class='bootstrap-wrapper'>

    <br/><br/><br/>

    <div ng-app="vbAdmin" ng-controller="vbController as vbCtrl">

        <tabs>
            <pane title="Line chart">
                <chart vis='linechart'></chart>
                <dataset-select></dataset-select>
                <shortcode></shortcode>
                <!-- <iframelink></iframelink> -->
            </pane>
            <pane title="Treemap">
                <chart vis='treemap'></chart>
                <dataset-select></dataset-select>
                <shortcode></shortcode>
                <!-- <iframelink></iframelink> -->
            </pane>
            <pane title="Metrics">
                <p>These metrics will automatically interact with any charts that appear on the same page.</p>
                <dataset-select></dataset-select>
                <div class="row">
                    <div class="col-md-6">
                        <p style='text-align:center'>The total for a given date:</p>
                        <chart vis='metric' metric='datetotal'></chart>
                        <shortcode metric='datetotal'></shortcode>
                    </div>
                    <div class="col-md-6">
                        <p style='text-align:center'>The date:</p>
                        <chart vis='metric' metric='date'></chart>
                        <shortcode metric='date'></shortcode>
                    </div>
                </div>
                <!-- <iframelink metric='datetotal'></iframelink> -->
                <!-- <iframelink metric='date'></iframelink> -->
            </pane>
            <!--<pane title="Stacked area chart">
            </pane>-->
            <!--<pane title="Comparison">
            </pane>
            <pane title="Ratio">
            </pane>
            <pane title="Difference">
            </pane>-->
            <pane title="Custom">
            </pane>
        </tabs>

    </div>

</div>
