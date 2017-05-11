# Visual Budget 2.0 Developer Guide

Last updated 11 May 2017


## Overview

This document contains what is necessary to understand the codebase and begin development on VB2.0.

Visual Budget 2.0 comprises two connected components: a JavaScript visualization module and a WordPress plugin. Accordingly, development for the two components occurs separately, although the code resides in the same respository. The reason for this is that while the plugin cannot exist without the visualization module, the visualization module *can* exist without the plugin, at least in principle. (However, it is a bit more difficult to use that way.)

## Structure of the codebase

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

**_zip/visualbudget.zip_** is a zip file of the latest build of VB2. The file is rewritten each build. It is stored here so that the latest build is always accessible by the URL [`https://github.com/goinvo/visualbudget/raw/master/zip/visualbudget.zip`](https://github.com/goinvo/visualbudget/raw/master/zip/visualbudget.zip), and it can be directly installed in WordPress as a plugin from the WordPress dashboard.







------

- Developing
    - Getting started
        - Setting up the repository
        - Building
        - Contributing to the repo

    - Code structure
        - Plugin
        - Visualization module
