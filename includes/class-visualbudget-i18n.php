<?php
/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 */
class VisualBudget_i18n {


	/**
	 * Load the plugin text domain for translation.
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'visualbudget',
			false,
			VISUALBUDGET_PATH . 'languages/'
		);

	}



}
