# Visual Budget

Visual Budget is a WordPress plugin designed to make it easy to visualize a
town's budget for its citizenry.


## Description

VisualBudget is two things: it is both JavaScript module to visualize budget
data as well as a WordPress plugin to facilitate data management and creation of
visualizations.

The plugin lets users (1) upload datasets as CSV files, (2) create
visualizations using a dashboard editor, and (3) embed those visualizations on
WordPress pages or other websites.

By default, many of the visualizations interact with each other and with the
user, providing a flexibility not many visualization tools offer.

**Developer note:** The JavaScript module `vb.js` *can* be used without the
WordPress plugin, but the budget JSON must be correctly formatted and 'chart
divs' with correct data attributes must be included on a page for charts to
load. In the future we hope to include proper documentation on how to spin up
visualizations without the plugin, but for now the best way to learn how to do
that is to use the plugin to generate some visualizations and then work from
those.


## Installation

### For users

To install the plugin on your WordPress site, you will need the file
`zip/visualbudget.zip` in this repo. You can either clone the whole repo for
that file or
[download it here](https://github.com/goinvo/visualbudget/raw/master/zip/visualbudget.zip).

On the WordPress dashboard there is a "Plugins" link on the sidebar.
At the top of the Plugins page there is a button to "Add New".
You can simply upload the .zip file of the VisualBudget plugin to install it.

### For developers

Compiling the plugin requires Node.js and npm, the Node Package Manager.

After cloning this repo, navigate to it in a terminal and run

```
$ npm install
$ gulp build
```

(If the second command returns an error, it may because gulp isn't installed
globally. You can fix this by running `$ npm install -g gulp`.)

To export the plugin to a local WordPress installation, modify the
`paths.pluginExport` variable in `gulpfile.js` to point to the plugins
directory of WordPress (usually at `wp-content/plugins/` from the WP base
directory), then run

```
$ gulp plugin-export
```


## Screenshots
[Screenshots of VB in action.]


## Changelog
[A log of version updates.]
