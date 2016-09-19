<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              http://visgov.com
 * @since             0.1.0
 * @package           VisualBudget
 *
 * @wordpress-plugin
 * Plugin Name:       Visual Budget
 * Plugin URI:        http://visgov.com/plugin/
 * Description:       Easily visualize your town's budget. Includes tools to import budget data and to select and customize visualizations. See also the Visual Budget WordPress Theme, a theme specially tailored for display of town budgets.
 * Version:           0.1.0
 * Author:            Involution Studios
 * Author URI:        http://goinvo.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       visualbudget
 * Domain Path:       /languages
 */


// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-visualbudget-activator.php
 */
function activate_visualbudget() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-visualbudget-activator.php';
	visualbudget_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-visualbudget-deactivator.php
 */
function deactivate_visualbudget() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-visualbudget-deactivator.php';
	visualbudget_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_visualbudget' );
register_deactivation_hook( __FILE__, 'deactivate_visualbudget' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-visualbudget.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    0.1.0
 */
function run_visualbudget() {

	$plugin = new VisualBudget();
	$plugin->run();

}
run_visualbudget();
