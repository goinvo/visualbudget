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
    public function add($message, $class='warning') {
        $this->notifications .= array('message' => $message,
                                      'class' => $class);
    }

    /**
     * Get the HTML for all the notifications.
     */
    public function get_html() {
        $notice = "<div class='notice notice-%s is-dismissible'><p>%s</p></div>";
        $html = '';
        foreach ($this->notifications as $notif) {
            $html .= sprintf($notice, $notif['class'], $notif['message']);
        }
        return $html;
    }

}
