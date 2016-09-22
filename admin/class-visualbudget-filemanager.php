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

        // see:
        // http://wordpress.stackexchange.com/questions/160823/use-wp-filesystem-to-list-files-in-directory
        $files = $wp_filesystem->dirlist(VISUALBUDGET_UPLOAD_PATH);

        // Filter out anything that is not a file
        // (i.e. the 'originals' directory)
        $files = array_filter($files,
            function(&$i) {
                return is_file(VISUALBUDGET_UPLOAD_PATH . $i['name']);
            });

        return $files;
    }

    public function upload_file($file) {
        echo 'Not yet.';
    }

}

?>