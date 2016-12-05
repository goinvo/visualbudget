<?php

/**
 * Fired during plugin activation
 */
class VisualBudget_Activator {

	/**
	 * Activator hook.
     * Upon activation, ping Visgov that someone new is using the plugin.
	 */
	public static function activate() {

        // Don't ping if user is activating from localhost.
        $ips_to_ignore = array(
            '127.0.0.1',
            '::1'
        );
        if(in_array($_SERVER['REMOTE_ADDR'], $ips_to_ignore)){
            return;
        }

        // Email address to send ping to.
        $to = 'vbping@visgov.com';

        // Subject of email.
        $subject = 'new plugin activation at ' . $_SERVER['SERVER_NAME'];

        // Message content of email.
        $message = "There has been a new VB plugin activation at "
            . "http://" . $_SERVER['SERVER_NAME'] . ". \r\n\r\n"
            . "Uploaded data is available through the API page \r\n"
            . dirname( plugin_dir_url(__FILE__) ) . "/vis/api.php."
            . "\r\n\r\n--VB Pingbot";

        // All the headers.
        $headers   = array();
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-type: text/plain";
        $headers[] = "From: VB Pingbot <vbping@visgov.com>";
        // $headers[] = "Bcc: NAME <NAME@DOMAIN.TLD>";
        $headers[] = "Reply-To: No Reply <vbping@visgov.com>";
        $headers[] = "Subject: {$subject}";
        $headers[] = "X-Mailer: PHP/".phpversion();

        // Finally, send the mail.
        mail($to, $subject, $message, implode("\r\n", $headers));
	}

}
