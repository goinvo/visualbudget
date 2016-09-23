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
     * Upload a file. The file will be accessed via PHP's own $_FILES variable,
     * and will specifically query  $_FILES[$group]['tmp_name'][$name]  to look
     * for the uploaded file.
     *
     * @param    $group   The settings group.
     * @param    $name    The input name.
     */
    public function upload_file($group, $name) {

        // WordPress's own filesystem class.
        global $wp_filesystem;

        // Check to see if the uploaded file exists.
        if ( isset($_FILES[$group]) && $_FILES[$group]['error'][$name] == 0 ) {
            // The current, temporary storage path
            $tmp_name = $_FILES[$group]['tmp_name'][$name];

            // Path to new uploaded file
            $new_filename = VISUALBUDGET_UPLOAD_PATH . sprintf('uploaded_%s.txt', time());

            // The contents of the file
            $contents = file_get_contents($tmp_name);

            // Write the new file
            $wp_filesystem->put_contents($new_filename, $contents);

        } else {
            // FIXME: This should be an error.
        }
    }

}

?>