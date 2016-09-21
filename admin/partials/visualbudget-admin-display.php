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
<h1>Visual Budget</h1>
<p>Welcome to the Visual Budget dashboard. This is place to configure things.</p>
<form method="post" action="options.php">
    <?php $this->options = get_option( 'visualbudget_settings' );  ?>
    <?php settings_fields( 'visualbudget_settings_group' ); ?>
    <?php do_settings_sections( 'visualbudget_dashboard' ); ?>
    <?php submit_button(); ?>
</form>

</div><!-- div.wrap -->