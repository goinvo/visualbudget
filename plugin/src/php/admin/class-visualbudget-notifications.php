<?php

/**
 * Class for admin notifications, including success messages,
 * warnings, and errors.
 */
class VisualBudget_Notifications {

    /**
     * This is an array of notifications. Each notification is
     * simply an associative array.
     */
    private $notifications;

    /**
     * Construction.
     */
    public function __construct() {
        $this->notifications = array();
    }

    /**
     * Add a new notification.
     */
    public function add($message, $class='warning', $error_code=0) {
        $this->notifications[] = array('message' => $message,
                                       'class' => $class,
                                       'error_code' => $error_code);
    }

    /**
     * Get the HTML for all the notifications.
     */
    public function get_html() {

        // The HTML for a single notice.
        $notice = "<div class='notice notice-%s is-dismissible'><p>%s</p>%s</div>";

        // A link to the error docs on visgov.com.
        $error_code = '<p><a href="' . VISGOV_ERROR_URL. '%d">'
            . 'See more information about how to fix Error %d at visgov.com.'
            . '</a></p>';

        // Append HTML of all notices together in $html.
        $html = '';

        // Loop through notices, appending HTML to $html.
        foreach ($this->notifications as $notif) {
            if ($notif['error_code']) {
                // If the error had a code, then include a link to full documentation on visgov.com.
                $error_html = sprintf($error_code, $notif['error_code'], $notif['error_code']);
                $error_title = '<span class="error-title">Error %d:</span> ';
                $error_title = sprintf($error_title, $notif['error_code']);
                $html .= sprintf($notice, $notif['class'], $error_title . $notif['message'], $error_html);
            } else {
                // Otherwise, just display the error text.
                $html .= sprintf($notice, $notif['class'], $notif['message'], '');
            }
        }

        return $html;
    }

}
