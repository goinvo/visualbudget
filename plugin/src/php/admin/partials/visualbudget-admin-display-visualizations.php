<?php
/**
 * This file displays the content of the "Visualizations" tab in the dashboard.
 */
?>
<div class='bootstrap-wrapper'>

    <br/>
    See <a href="https://github.com/goinvo/visualbudget/tree/master/docs/Visualization%20API.md" target="_blank">documentation</a> for a comprehensive list of visualizations and parameters.
    <br/><br/>

    <div ng-app="vbAdmin" ng-controller="vbController as vbCtrl">

        <tabs>
            <pane title="Stacked area chart">
                <chart vis='stackedarea'></chart>
                <dataset-select></dataset-select>
                <shortcode explain='true'></shortcode>
                <iframelink></iframelink>
            </pane>
            <pane title="Line chart">
                <chart vis='linechart'></chart>
                <dataset-select></dataset-select>
                <shortcode explain='true'></shortcode>
                <iframelink></iframelink>
            </pane>
            <pane title="Treemap">
                <chart vis='treemap'></chart>
                <dataset-select></dataset-select>
                <shortcode explain='true'></shortcode>
                <iframelink></iframelink>
            </pane>
            <pane title="Comparison">
                <chart vis='comparisontime'></chart>
                <dataset-select multiple></dataset-select>
                <shortcode explain='true'></shortcode>
                <iframelink></iframelink>
            </pane>
            <pane title="Table">
                <chart vis='table'></chart>
                <dataset-select></dataset-select>
                <shortcode explain='true'></shortcode>
                <iframelink></iframelink>
            </pane>
            <pane title="Metrics">
                <p>These metrics will automatically interact with any charts that appear on
                the same page. This linechart demonstrates the functionality:</p>
                <chart vis='linechart'></chart>
                <dataset-select></dataset-select>
                <div class="row" style='margin-top: 2em'>
                    <div class="col-md-6">
                        <p style='text-align:center'>The item's name:</p>
                        <chart vis='metric' metric='name'></chart>
                        <shortcode metric='name'></shortcode>
                        <iframelink metric='name'></iframelink>
                    </div>
                    <div class="col-md-6">
                        <p style='text-align:center'>The item's average dollar amount over all years:</p>
                        <chart vis='metric' metric='average'></chart>
                        <shortcode metric='average'></shortcode>
                        <iframelink metric='average'></iframelink>
                    </div>
                </div>
                <div class="row" style='margin-top: 2em'>
                    <div class="col-md-6">
                        <p style='text-align:center'>The item's dollar amount for a given date:</p>
                        <chart vis='metric' metric='datetotal'></chart>
                        <shortcode metric='datetotal'></shortcode>
                        <iframelink metric='datetotal'></iframelink>
                    </div>
                    <div class="col-md-6">
                        <p style='text-align:center'>The current date:</p>
                        <chart vis='metric' metric='date'></chart>
                        <shortcode metric='date'></shortcode>
                        <iframelink metric='date'></iframelink>
                    </div>
                </div>
                <div class="row" style='margin-top: 2em'>
                    <div class="col-md-6">
                        <p style='text-align:center'>The percent growth from previous year:</p>
                        <chart vis='metric' metric='percentgrowth'></chart>
                        <shortcode metric='percentgrowth'></shortcode>
                        <iframelink metric='percentgrowth'></iframelink>
                    </div>
                    <div class="col-md-6">
                        <p style='text-align:center'>The absolute growth ($) from previous year:</p>
                        <chart vis='metric' metric='absgrowth'></chart>
                        <shortcode metric='absgrowth'></shortcode>
                        <iframelink metric='absgrowth'></iframelink>
                    </div>
                </div>
                <div class="row" style='margin-top: 2em'>
                    <div class="col-md-6">
                        <p style='text-align:center'>The 5-year average:<br>
                            <small>(or fewer, on the boundary)</small></p>
                        <chart vis='metric' metric='5yearaverage'></chart>
                        <shortcode metric='5yearaverage'></shortcode>
                        <iframelink metric='5yearaverage'></iframelink>
                    </div>
                    <div class="col-md-6">
                        <p style='text-align:center'>Number of years averaged:<br>
                            <small>(usually 5, except on the boundary)</small></p>
                        <chart vis='metric' metric='numyearsaveraged'></chart>
                        <shortcode metric='numyearsaveraged'></shortcode>
                        <iframelink metric='numyearsaveraged'></iframelink>
                    </div>
                </div>
                <div class="row" style='margin-top: 2em'>
                    <div class="col-md-6">
                        <p style='text-align:center'>The user's tax contribution to the current item:</p>
                        <chart vis='metric' metric='mytaxcontribution'></chart>
                        <shortcode metric='mytaxcontribution'></shortcode>
                        <iframelink metric='mytaxcontribution'></iframelink>
                    </div>
                    <div class="col-md-6">
                        <p style='text-align:center'>Dataset download link:</p>
                        <chart vis='metric' metric='download'></chart>
                        <shortcode metric='download'></shortcode>
                        <iframelink metric='download'></iframelink>
                    </div>
                </div>
            </pane>
            <pane title="My Tax Bill">
                <p>The "My Tax Bill" component allows users to enter their tax bill (in dollars)
                in order to see through charts where each penny of their tax bill goes.</p>
                <chart vis='mytaxbill'></chart>
                <div class="vb-shortcode-wrapper">
                    <p>Paste the following shortcode in your WordPress page to display this visualization:</p>
                    <pre class="vb-shortcode">[visualbudget vis=mytaxbill]</pre>
                </div>
                <!-- <shortcode explain='true'></shortcode> -->
            </pane>
            <!--<pane title="Stacked area chart">
            </pane>-->
            <!--<pane title="Comparison">
            </pane>
            <pane title="Ratio">
            </pane>
            <pane title="Difference">
            </pane>
            <pane title="Custom">
            </pane>-->
        </tabs>

    </div>

</div>
