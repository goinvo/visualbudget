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

		wp_enqueue_style( 'vb_public_css', plugin_dir_url( __FILE__ ) . 'css/visualbudget-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 */
	public function enqueue_scripts() {

		wp_enqueue_script( 'vb_vis_js', plugin_dir_url( __FILE__ ) . '../vis/vb.js', array( 'jquery' ), $this->version, false );

		wp_enqueue_script( 'vb_public_js', plugin_dir_url( __FILE__ ) . 'js/visualbudget-public.js', array( 'jquery' ), $this->version, false );

	}

}
