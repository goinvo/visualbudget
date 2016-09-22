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

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in VisualBudget_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The VisualBudget_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/visualbudget-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in VisualBudget_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The VisualBudget_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/visualbudget-public.js', array( 'jquery' ), $this->version, false );

	}

}
