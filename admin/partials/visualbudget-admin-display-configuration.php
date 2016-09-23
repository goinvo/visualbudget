<?php
/**
 * This file displays the content of the "Configuration" tab in the dashboard.
 */
?>
<form method="post" action="options.php">
<?php
settings_fields( 'visualbudget_settings' );
do_settings_sections( 'visualbudget_configuration' );
submit_button();
?>
</form>
