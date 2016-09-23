<?php
/**
 * Provide an admin area view for the plugin.
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
$this->settings->options = get_option( 'visualbudget_settings' );

// Display the appropriate tab content
switch ( $active_tab ) {
    case 'configuration':
        include VISUALBUDGET_PATH . 'admin/partials/visualbudget-admin-display-configuration.php';
        break;

    case 'datasets':
        include VISUALBUDGET_PATH . 'admin/partials/visualbudget-admin-display-datasets.php';
        break;

    case 'visualizations':
        echo "Nothing here yet.";
        break;
}
?>
</form>

</div><!-- div.wrap -->