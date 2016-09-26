<?php

/**
 * The file manager, for dealing with uploading/reading/writing of datasets.
 */

class VisualBudget_FileManager {

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

    /**
     * Return an inventory of all datasets that have been uploaded.
     */
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


    /**
     * Read a file.
     */
    public function read_file($dataset_filename) {
        global $wp_filesystem;

        return $wp_filesystem->get_contents(VISUALBUDGET_UPLOAD_PATH . $dataset_filename);
    }

    /**
     * Upload a file. The file will be accessed via PHP's own $_FILES variable,
     * and will specifically query  $_FILES[$group]['tmp_name'][$name]  to look
     * for the uploaded file.
     *
     * @param    $group   The settings group.
     * @param    $name    The input name.
     */
    public function new_file($path, $contents) {

        try {
            // WordPress's own filesystem class.
            global $wp_filesystem;

            // Write the new file
            $wp_filesystem->put_contents($path, $contents);

        } catch (Exception $e) {
            // FIXME: What to do with this error?
        }
    }

}

?>