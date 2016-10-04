<?php

/**
 * Fired during plugin activation
 */
class VisualBudget_Activator {

	/**
	 * Activator hook.
	 */
	public static function activate() {

        // Upon activate, ping Visgov that someone new is using the plugin.

        // Email address to send ping to.
        $to = 'hrothgar@goinvo.com';

        // Subject of email.
        $subject = 'new Visual Budget plugin activation at ' . $_SERVER['SERVER_NAME'];

        // Message content of email.
        $message = "There has been a new VB plugin activation at "
            . "http://" . $_SERVER['SERVER_NAME'] . ". \r\n\r\n"
            . "Uploaded data is available through the API page "
            . dirname( plugin_dir_url(__FILE__) ) . "/api.php."
            . "\r\n\r\n--VB Pingbot";

        // All the headers.
        $headers   = array();
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-type: text/plain";
        $headers[] = "From: VB Pingbot <no-reply@visgov.com>";
        // $headers[] = "Bcc: NAME <NAME@DOMAIN.TLD>";
        $headers[] = "Reply-To: No Reply <no-reply@visgov.com>";
        $headers[] = "Subject: {$subject}";
        $headers[] = "X-Mailer: PHP/".phpversion();

        // Finally, send the mail.
        mail($to, $subject, $message, implode("\r\n", $headers));
	}

}
