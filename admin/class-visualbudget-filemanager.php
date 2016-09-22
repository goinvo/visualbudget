<?php

/**
 * The file manager, for dealing with uploading/reading/writing of datasets.
 *
 * @link       http://visgov.com
 * @since      0.1.0
 *
 * @package    VisualBudget
 * @subpackage VisualBudget/admin
 */

class VisualBudget_FileManager {

    /**
     * Full path to the directory in which datasets reside.
     */
    private $upload_path;

    /**
     * The contents of $upload_path, stored as an array of FILE objects.
     */
    private $datasets;

    /**
     * Initialize the class and set its properties.
     *
     * @since    0.1.0
     * @param    string    $plugin_name   The name of this plugin.
     * @param    string    $version       The version of this plugin.
     * @param    string    $upload_dir    The upload directory (not full path).
     */
    public function __construct() {

        // $url = wp_nonce_url($this->upload_path);
        // if (false === ($creds = request_filesystem_credentials($url, '', false, false, null) ) ) {
        //     return; // stop processing here
        // }
        // if ( ! WP_Filesystem($creds) ) {
        //     request_filesystem_credentials($url, '', true, false, null);
        //     return;
        // }

        // $code = $this->initialize_filesystem();
        // echo $code;

        // Create the $datasets array.
        // $this->datasets = $this->get_tree_of( $this->upload_dir );

    }

    public function initialize_filesystem() {
        return 0;
    }

    /**
     * Read into a directory and create a VisualBudget_File object for each file.
     * Return all objects in an array.
     */
    public function get_tree_of( $dir ) {
        return Array(0);
    }

}

?>