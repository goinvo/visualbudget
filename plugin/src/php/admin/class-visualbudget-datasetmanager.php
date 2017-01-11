<?php

/**
 * The dataset manager, for dealing with uploading/reading/writing of datasets.
 * This class is called "DatasetManager" rather than "GeneralFileManager"
 * because it deals with things in the datasets directory: when a filename is
 * given, it is assumed to be in the datasets upload directory.
 */
class VisualBudget_DatasetManager {

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
     * Read a dataset.
     *
     * @param  string  $filename  The filename of the dataset.
     */
    public function read_dataset($filename) {
        global $wp_filesystem;

        return $wp_filesystem->get_contents(VISUALBUDGET_UPLOAD_PATH . $filename);
    }

    /**
     * Write to a file.
     *
     * @param  string  $filename  The filename of the new dataset.
     * @param  string  $contents  The contents of the new file.
     */
    public function write_dataset($filename, $contents) {

        try {
            // WordPress's own filesystem class.
            global $wp_filesystem;

            // Write the new file
            $wp_filesystem->put_contents(VISUALBUDGET_UPLOAD_PATH . $filename, $contents);

        } catch (Exception $e) {
            // FIXME: What to do with this error?
        }
    }

    /**
     * Move a dataset.
     *
     * @param  string  $current  The location of the existing file,
     *                           relative to the upload directory.
     * @param  string  $new      The new location of the file,
     *                           relative to the upload directory.
     */
    public function move_dataset($current, $new) {
        global $wp_filesystem;

        return $wp_filesystem->move(VISUALBUDGET_UPLOAD_PATH . $current,
                                    VISUALBUDGET_UPLOAD_PATH . $new);
    }

    /**
     * Read the aliases.json file and return its contents as an
     * associative array.
     */
    public function get_aliases() {
        try {
            // WordPress's own filesystem class.
            global $wp_filesystem;

            // Get the existing contents.
            $contents = $wp_filesystem->get_contents(VISUALBUDGET_PATH . VISUALBUDGET_ALIASES_FILE);
            $aliases_array = json_decode($contents, true); // "true" makes it an associative array
            if (!$aliases_array) {
                $aliases_array = array();
            }

            // Return the aliases.
            return $aliases_array;

        } catch (Exception $e) {
            // FIXME: What to do with this error?
        }
    }

    /**
     * This function updates the aliases.json file with
     * any new or changed aliases as submitted by the user.
     * Note that the aliases submitted by the user COMPLETELY
     * OVERWRITE any existing aliases.
     */
    public function update_aliases($new_aliases_array) {
        // Write the new file
        try {
            global $wp_filesystem; // WordPress's own filesystem class.
            $wp_filesystem->put_contents(VISUALBUDGET_PATH . VISUALBUDGET_ALIASES_FILE,
                                json_encode($new_aliases_array, JSON_PRETTY_PRINT));
        } catch (Exception $e) {
            // FIXME: What to do with this error?
        }
    }

    /**
     * Check to see if X a file, where X is in the uploads directory.
     *
     * @param  string  $filename  Filename to be checked. Can also be
     *                            a path relative to the uploads directory.
     */
    public function is_file($filename) {
        return is_file(VISUALBUDGET_UPLOAD_PATH . $filename);
    }

}

?>