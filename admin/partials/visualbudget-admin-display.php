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
<?php $this->visualbudget_display_dashboard_tabs(); ?>
<form method="post" action="options.php">
    <?php
    // Grab the saved options
    $active_tab = isset( $_GET[ 'tab' ] ) ? $_GET[ 'tab' ] : 'configuration';
    $this->options = get_option( 'visualbudget_settings' );

    // Display the appropriate tab content
    if ( $active_tab == 'configuration' ) {
        settings_fields( 'visualbudget_settings_group' );
        do_settings_sections( 'visualbudget_dashboard' );
        submit_button();
    } else {
        echo ('<p>Nothing here yet.</p>');
    }
    ?>
</form>

</div><!-- div.wrap -->