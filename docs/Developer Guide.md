# Visual Budget 2.0 Developer Guide

Last updated 11 May 2017


## Overview

This document contains what is necessary to understand the codebase and begin development on VB2.0.

Visual Budget 2.0 comprises two connected components: a JavaScript visualization module and a WordPress plugin. Accordingly, development for the two components occurs separately, although the code resides in the same respository. The reason for this is that while the plugin cannot exist without the visualization module, the visualization module *can* exist without the plugin, at least in principle. (However, it is a bit more difficult to use that way.)




## Getting started

### Structure of the codebase

The overall directory structure of the repository is this:

```
visualbudget/
  |-- docs/
  |-- plugin/
  |     +-- src/
  |-- vis/
  |     +-- src/
  |-- zip/
  |     +-- visualbudget.zip
  |-- gulpfile.js
  +-- package.json
```

**_docs/_** contains all VB2 documention, including the dataset definition specification, the visualization API, and this developer guide.

**_plugin/src/_** contains the code for the WordPress plugin. The code is mostly PHP and JavaScript. After building, the compiled code will be written to *plugin/dist/*.

**_vis/src/_** contains the code for the visualization module. The code is mostly JavaScript. After building, the compiled code will be written to *vis/dist/*.

**_zip/visualbudget.zip_** is a zip file of the latest build of VB2. The file is rewritten each build and is always accessible by the URL [`https://github.com/goinvo/visualbudget/raw/master/zip/visualbudget.zip`](https://github.com/goinvo/visualbudget/raw/master/zip/visualbudget.zip). This file can be directly installed in WordPress as a plugin from the WordPress dashboard.

**_gulpfile.js_** is a script containing the directives for the compiling process, which uses Gulp.

**_package.json_** is a package definition file written in accordance with npm conventions.


### Setting up the repository

Clone the repo from github using

```$ git clone https://github.com/goinvo/visualbudget.git```


### Building

To build, you must have Node.js and npm, the Node Package Manager, installed.

After cloning the repo, navigate to it in a console and run

```$ npm install```

to install dependences. Then run

```$ gulp build```

to build. (If this command returns an error, it may because gulp isn't installed globally. You can fix this by running `$ npm install -g gulp`.) Finally, if you want to export the built plugin to a local install of WordPress, run

```$ gulp plugin-export```

Of course, you will need to modify the `paths.pluginExport` variable in `gulpfile.js` to point to the plugins directory of your WordPress install (usually at `wp-content/plugins/` from the WP base directory).


### Contributing to the repository

We are happy to consider pull requests with new features, and any submitted bug reports are appreciated.



## More about the code

More about the code for developers.

### Code structure, in-depth

The general code structure is above; here it is in more detail.

#### Plugin

The code for the plugin is divided into PHP, JavaScript, and SASS. The code in each language serves a difference function in the plugin, so it's a clean separation.

##### PHP

The plugin is built off of the [WordPress plugin boilerplate](https://github.com/DevinVinson/WordPress-Plugin-Boilerplate) repository. The important parts are these:

```
visualbudget/plugin/src/php/
  |-- admin/
  |-- includes/
  +-- vis/
```

- **_admin/_** contains the bulk of the important Visual Budget code, including all the classes and methods for displaying the dashboard and uploading datasets. Several classes exist solely for the dataset upload & restructuring process. The files `class-visualbudget-admin.php` is the high-level executor of admin dashboard functions. The subfolder `partials/` contains the files to display each of the individual dashboard tabs (“Datasets”, “Visualizations”, “Configuration”).

- **_includes/_** contains one file of note, `class-visualbudget.php`, which defines all the important constants that are used throughout the plugin.

- **_vis/_** contains `vis.php`, which is the most important file in interfacing with the visualization JavaScript module. When `vis.php` is loaded with a set of query string parameters, it produces a visualization in accordance with those parameters. Most of the parameters are not dealt with in `vis.php` itself; rather, with a couple of exceptions, all parameters are simply written out as data-attributes in a div which the visualization JavaScript module parses on its own.

  It also contains `api.php`, which is an interface for querying datasets. Loading `api.php` on its own returns a JSON array filenames. Loading `api.php?filename={filename}` will return the contents of a specific file.

##### JavaScript

The JavaScript in the plugin is used in the “Visualizations” tab of the dashboard. The visualizations interface is built using Angular.js. It dynamically loads visualizations, allowing users to test visualizations and get their embed codes.

```
visualbudget/plugin/src/js/
  |-- includes/
  |-- vendor/
  |-- _vb-admin.js
  +-- {components}
```

**_includes/_** contains HTML templates of different Angular components.

**_vendor/_** contains external libraries that are used in the admin dashboard.

**_\_vb-admin.js_** is the main VB admin script. It defines the Angular module and loads datasets for display.

**_{components}_** refers to each of the self-contained directives for dashboard components (e.g. chart components, tabs, shortcodes, the dataset selector element, etc).

##### SASS

The SASS file here contains only the styles for the admin dashboard, and *not* for the visualizations themselves!


#### Visualization module

##### JavaScript

The folder `visualbudget/vis/src/js/` contains the bulk of code responsible for generating visualizations.

```
visualbudget/vis/src/js/
  |-- vendor/
  |-- vb.js
  |-- vb-chart.js
  |-- vb-comparison.js
  |-- vb-legend.js
  |-- vb-linechart.js
  |-- vb-metric.js
  +-- ...
```

**_vendor/_** contains any external modules and libraries. As of this writing, the only external modules used are d3-tip (for creating tooltips) and mustache.js, which is used in the generation of the table chart.

**_vb.js_** is the main file in the Visual Budget module. When included in a page, it begins the process of loading datasets and rendering charts.

**_vb-chart.js_** is the superclass for all Visual Budget charts.

**_vb-{x}.js_** are each files for rendering a specific type of chart. The code in each is very different, since charts have different kinds of functionality (some are rendered with D3, while others are simply text). However, there are a few common methods, including `redraw()`, which redraws the chart taking into account any new state variables, and `setState()`, which is a public function to change the state of this chart.


##### SASS

The SASS file here contains all styling pertaining to visualizations themselves, including the styling of SVG components generated by the D3 library.
