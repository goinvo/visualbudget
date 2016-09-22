<?php
/**
 * This file displays the content of the "Configuration" tab in the dashboard.
 */
?>
<form method="post" action="options.php">
<?php
settings_fields( 'visualbudget_settings_group' );
do_settings_sections( 'visualbudget_dashboard' );
submit_button();
?>
</form>
