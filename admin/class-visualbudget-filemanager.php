<?php

/**
 * The file manager, for dealing with uploading/reading/writing of datasets.
 *
 * FIXME: The methods of this class are inconsistent: some require the full path
 *        to the datasets directory, while others simply require a filename.
 *        Should this class be called "datasets-manager" or such? Perhaps it is
 *        meant to be a specialized datasets manager, and not a general
 *        interface to the filesystem. (What else do we need to interact with
 *        the filesystem for, anyway?)
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

        // Create the trash directory if it doesn't exist.
        if ( !is_dir(VISUALBUDGET_UPLOAD_PATH . 'trash/') ) {
            $wp_filesystem->mkdir(VISUALBUDGET_UPLOAD_PATH . 'trash/');
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
     *
     * @param  string  $dataset_filename  The filename (not path) of the dataset.
     */
    public function read_file($dataset_filename) {
        global $wp_filesystem;

        return $wp_filesystem->get_contents(VISUALBUDGET_UPLOAD_PATH . $dataset_filename);
    }

    /**
     * Upload a file.
     *
     * @param    $path      The full path to the new file to be created.
     * @param    $contents  The contents of the new file.
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

    /**
     * Move a file.
     *
     * @param  string  $current  The location of the existing file.
     * @param  string  $new      The new location of the file.
     */
    public function move_file($current, $new) {
        global $wp_filesystem;

        return $wp_filesystem->move(VISUALBUDGET_UPLOAD_PATH . $current,
                                    VISUALBUDGET_UPLOAD_PATH . $new);
    }

    /**
     * Check to see if X a file.
     *
     * @param  string  $filename  The filename (not path) of the file
     *                            to be checked. This method looks in
     *                            the datasets folder only.
     */
    public function is_file($filename) {
        return is_file(VISUALBUDGET_UPLOAD_PATH . $filename);
    }

}

?>