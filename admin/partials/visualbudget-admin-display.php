<?php
/**
 * Provide an admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 *
 * @link              http://visgov.com
 * @since             0.1.0
 * @package           VisualBudget
 * @subpackage        VisualBudget/admin/partials
 */
?><div class="wrap">
<h1></span>Visual Budget</h1>
<?php

// First display the tab nav at the top
$this->visualbudget_display_dashboard_tabs();

// Find out (or set) which tab is active
// By default, 'configuration' is active
$active_tab = isset( $_GET[ 'tab' ] ) ? $_GET[ 'tab' ] : 'configuration';

// Grab the saved options
$this->options = get_option( 'visualbudget_settings' );

// Display the appropriate tab content
switch ( $active_tab ) {
    case 'configuration':
        include plugin_dir_path( dirname( __FILE__ ) ) . 'partials/visualbudget-admin-display-configuration.php';
        break;

    case 'datasets':
        include plugin_dir_path( dirname( __FILE__ ) ) . 'partials/visualbudget-admin-display-datasets.php';
        break;

    case 'visualizations':
        echo "Nothing here yet.";
        break;
}
?>
</form>

</div><!-- div.wrap -->