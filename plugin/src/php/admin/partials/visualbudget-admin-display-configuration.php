<?php
/**
 * This file displays the content of the "Configuration" tab in the dashboard.
 */
?>
<form method="post" action="options.php">
<?php
// Grab the saved options.
$this->settings->options = get_option( 'visualbudget_tab_config' );
// Display the settings fields.
settings_fields( 'visualbudget_tab_config' );
do_settings_sections( 'visualbudget_tab_config' );
submit_button();
?>
</form>
