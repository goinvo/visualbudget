<?php

/**
 * The public-facing functionality of the plugin.
 */
class VisualBudget_Public {

	/**
	 * Initialize the class and set its properties.
	 */
	public function __construct() {

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 */
	public function enqueue_styles() {

        // Add the VB admin CSS file
        wp_enqueue_style(
            'vis_css',
            plugin_dir_url( __FILE__ ) . '../vis/vb.min.css',
            array(), VISUALBUDGET_VERSION, 'all' );
	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 */
	public function enqueue_scripts() {

        // Add D3
        wp_enqueue_script(
            'd3',
            'https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.6/d3.min.js',
            array(), VISUALBUDGET_VERSION, false );

        // Add D3 tooltip lib
        wp_enqueue_script(
            'd3-tip',
            plugin_dir_url( __FILE__ ) . 'js/d3.tip.js',
            array( 'd3' ), VISUALBUDGET_VERSION, false );

        // Add the visualization js file and submodules.
        wp_enqueue_script(
            'vb_js',
            plugin_dir_url( __FILE__ ) . '../vis/vb.min.js',
            array( 'jquery' ), VISUALBUDGET_VERSION, false );

	}

}
