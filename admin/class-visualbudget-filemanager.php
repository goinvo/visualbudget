<?php

/**
 * The file manager, for dealing with uploading/reading/writing of datasets.
 */

class VisualBudget_FileManager {

    /**
     * The contents of $upload_path, stored as an array of FILE objects.
     */
    private $datasets;

    /**
     * Initialize the class and set its properties.
     * @param    string    $plugin_name   The name of this plugin.
     * @param    string    $version       The version of this plugin.
     * @param    string    $upload_dir    The upload directory (not full path).
     */
    public function __construct() {

        // WordPress's own filesystem class.
        global $wp_filesystem;

        // Create the upload directory if it doesn't exist.
        if ( !is_dir(VISUALBUDGET_UPLOAD_PATH) ) {
            $wp_filesystem->mkdir(VISUALBUDGET_UPLOAD_PATH);
        }

    }

    public function get_datasets_inventory() {
        global $wp_filesystem;
        $filelist = $wp_filesystem->dirlist(VISUALBUDGET_UPLOAD_PATH);
        return $filelist;
    }

}

?>