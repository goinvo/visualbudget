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
<h1><span class="dashicons dashicons-admin-settings" style='font-size:30px;margin-right:.6em;'></span>Visual Budget</h1>
<h2 class="nav-tab-wrapper">
<?php
// Get the active tab name if there is one; else go to default.
$active_tab = isset( $_GET[ 'tab' ] ) ? $_GET[ 'tab' ] : 'configuration';
?>
    <a href="?page=<?php echo $this->settings_page_handle ?>&tab=configuration" class="nav-tab <?php echo $active_tab == 'configuration' ? 'nav-tab-active' : ''; ?>">Configuration</a>
    <a href="?page=<?php echo $this->settings_page_handle ?>&tab=datasets" class="nav-tab <?php echo $active_tab == 'datasets' ? 'nav-tab-active' : ''; ?>">Datasets</a>
    <a href="?page=<?php echo $this->settings_page_handle ?>&tab=visualizations" class="nav-tab <?php echo $active_tab == 'visualizations' ? 'nav-tab-active' : ''; ?>">Visualizations</a>
</h2>
<form method="post" action="options.php">
    <?php
    // Grab the saved options
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