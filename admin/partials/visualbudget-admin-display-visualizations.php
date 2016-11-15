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
                <!--<chart vis='linechart'></chart>-->
                <dataset-select></dataset-select>
                <shortcode></shortcode>
                <!--<iframelink></iframelink>-->
            </pane>
            <!--<pane title="Stacked area chart">
            </pane>-->
            <!--
            <pane title="Treemap">
                <chart vis='treemap'></chart>
                <dataset-select></dataset-select>
                <shortcode></shortcode>
                <iframelink></iframelink>
            </pane>
            <pane title="Metrics">
                <chart vis='metric' metric='datetotal'></chart>
                <dataset-select></dataset-select>
                <shortcode metric='datetotal'></shortcode>
                <iframelink metric='datetotal'></iframelink>
                <!-<chart vis='metric' metric='date'></chart>
                <shortcode metric='date'></shortcode>
                <iframelink metric='date'></iframelink>->
            </pane>
            -->
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
