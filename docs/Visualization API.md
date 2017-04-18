The Visual Budget WordPress Plugin produces visualizations of data uploaded
through the plugin's interface. Visualizations are specified using WordPress's
own shortcode syntax. This document provides a detailed specification of how
to produce visualizations in this way.

The Visualization tab of the plugin provides some capabilities for testing
visualizations, but not all parameter options are displayed there. Refer to
this guide for comprehensive documentation.

## WordPress Shortcodes

Visualizations are embedded in WordPress posts or pages via shortcodes, which
are translated into iframes.

For example, when the Visual Budget plugin is installed, the shortcode

    [visualbudget vis=treemap data=expenses node=schools iframe]

gets translated into the HTML code

    <iframe src='[PLUGIN_URL]/vis/vis.php?vis=treemap&data=expenses&node=schools'></iframe>

which in turn will load an iframe with a treemap of a dataset with alias "expenses".
For information about shortcodes, see the
[WordPress Codex](https://codex.wordpress.org/Shortcode).

## Using Visual Budget shortcodes

The keyword for Visual Budget charts is `visualbudget`. To be well-formed,
most charts require at least two parameters: the `vis` attribute and the
`data` attribute. Other optional parameters are exist for customization. A
comprehensive list of parameters is below.

Note: The value of `data` parameter can either be a dataset ID
(listed in the dashboard) or an alias (which can be set in the dashboard).


### All charts

    [visualbudget               // The tag always opens with the "visualbudget" identifier.
        vis={VALUE}             // Required: Visualization type.
        data={VALUE}            // Required, except on mytaxbill: Can be an alias or a dataset ID.

        // Optional parameters:
        iframe                  // If this parameter is declared (no value required),
                                //   then the chart is displayed in an iframe.
        node=schools:salaries   // Default: null. Dive into the data, displaying a child node as
                                //   the dataset. Levels are colon-separated. Can be a
                                //   comma-separated list when used with comparison chart.
        date=2012               // Set the year whose data the chart draws. Irrelevant on the
                                //   comparison chart.
        width=400px             // Set the css width of the chart div.
        height=600px            // Set the css height of the chart div.
        class="abc xyz"         // Set custom classes of the chart div.
        ]


### Line chart

    [visualbudget
        vis=linechart
        data=expenses
        ]


### Stacked area chart

    [visualbudget
        vis=stackedarea
        data=expenses

        // Optional parameters:
        colorscheme=1           // Select the color scheme. Must be one of {0,1}. Default: 0.
        smooth=1                // 0 gives a stacked bar chart. 1 gives a stacked area (line) chart.
                                //   Default: 0.
        ]


### Treemap

    [visualbudget
        vis=treemap
        data=expenses

        // Optional parameters:
        colorscheme=1           // Select the color scheme. Must be one of {0,1}. Default: 0.
        showmycontribution=1    // Display "my tax contribution" in the tooltip. Default: 0.
        taxtype=property        // Define this parameter to add the tooltip parenthetical
                                //   "(X% is paid for by {taxtype} taxes.)". X is calculated
                                //   from the metadata field FUNDED_BY_TAXES.
        showfundedbytaxes=all   // If "all", the tooltip parenthetical is always shown.
                                //   If "fractions", it is only shown when FUNDED_BY_TAXES is < 1.
                                //   Default: "fractions".
        ]


### Legend

    [visualbudget
        vis=legend
        data=expenses

        // Optional parameters:
        colorscheme=1           // Select the color scheme. Must be one of {0,1}. Default: 0.
        ]


### Comparison chart

    [visualbudget
        vis=comparisontime
        data=expenses,revenues  // Comma-separated list of aliases or dataset IDs (or mixed).
        ]


### Metrics

#### Date

    [visualbudget
        vis=metric
        data=expenses
        metric=date             // Displays the current year.
        ]

#### Date total

    [visualbudget
        vis=metric
        data=expenses
        metric=datetotal        // Displays the total dollar amount for
                                //   current item at current year.
        ]

#### Average

    [visualbudget
        vis=metric
        data=expenses
        metric=average          // Displays the average dollar amount for
                                //   current item over all years.
        ]

#### 5-year average

    [visualbudget
        vis=metric
        data=expenses
        metric=5yearaverage     // Displays the average dollar amount for current item
                                //   over last 5 years (or fewer at early dates).
        ]

#### Number of years averaged

    [visualbudget
        vis=metric
        data=expenses
        metric=numyearsaveraged // Since the 5-year average is not actually always over
                                //   five years (because early years don't have a history),
                                //   this metric gives the actual number of years that
                                //   have been averaged.
        ]

#### Percent growth

    [visualbudget
        vis=metric
        data=expenses
        metric=percentgrowth    // Displays the percent growth from the previous year
                                //   (can be negative).
        ]

#### Absolute growth

    [visualbudget
        vis=metric
        data=expenses
        metric=absgrowth        // Displays the absolute (dollar-amount) growth from
                                //   the previous year (can be negative).
        ]

#### Name

    [visualbudget
        vis=metric
        data=expenses
        metric=name             // Displays the name of this line item.
  
        // Optional parameters:
        name=Expenses           // Set the name of the root item (i.e. the dataset name),
                                //   which otherwise is a number if data={DATASET_ID}.
        ]

#### Download link

For `metric=download`, the result is different if there is one or multiple datasets:

- For e.g. `data=expenses`, the result is          `<Download data>`
- For e.g. `data=expenses,funds`, the result is     `Download data [<1>, <2>]`,
  where <> denotes a link. In each case, only the "Download data" text is customizable.

```
[visualbudget
    vis=metric
    metric=download         // Displays a link to download data.
    data=expenses           // Which datasets to download. Can also be a
                            //   comma-separated list (e.g. "expenses,revenues,funds")

    // Optional parameters:
    filetype=json           // Set the filetype to download (default: "csv")
    text="Click me"         // Set the text to display (default: "Download data")
    title="Title text"      // Set the title text (default: "Download data")
    target="_self"          // Set the target attribute of the link
                            //   (default: "_blank", which opens the link in a new tab)
    ]
```

#### My tax contribution

    [visualbudget
        vis=metric
        data=expenses
        metric=mytaxcontribution    // Displays the user's tax contribution
                                    // toward the current item.
        ]


### My tax bill

    [visualbudget
        vis=mytaxbill           // Displays an text input field for the user to write
                                //   their tax bill. The input is persistent for the session.
        ]


### Table

    [visualbudget
        vis=table
        data=expenses

        // Optional parameters:
        name=Expenses           // Set the name of the root item of the table
                                // (which otherwise is a number if data={DATASET_ID}).
        ]
