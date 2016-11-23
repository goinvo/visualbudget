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
        $notice_template = "<div class='notice notice-%s is-dismissible'><p>%s</p>%s</div>";

        // A link to the error docs on visgov.com.
        $error_link_template = '<p><a href="' . VISGOV_ERROR_URL. '%d">'
            . 'See more information about how to fix %s at visgov.com.'
            . '</a></p>';

        // Prefix to the error text, if there is number.
        $error_prefix_template = '<span class="error-title">%s:</span> ';

        // Append HTML of all notices together in $html.
        $html = '';

        // Loop through notices, appending HTML to $html.
        foreach ($this->notifications as $notif) {
            if ($notif['error_code']) {
                // If the error had a code, then include a link to full documentation on visgov.com.
                $error_name = ucfirst($notif['class']) . ' ' . $notif['error_code'];
                $error_link = sprintf($error_link_template, $notif['error_code'], $error_name);
                $error_prefix = sprintf($error_prefix_template, $error_name);

                $html .= sprintf($notice_template, $notif['class'], $error_prefix . $notif['message'], $error_link);
            } else {
                // Otherwise, just display the error text.
                $error_prefix = sprintf($error_prefix_template, ucfirst($notif['class']));
                $html .= sprintf($notice_template, $notif['class'], $error_prefix . $notif['message'], '');
            }
        }

        return $html;
    }

}
