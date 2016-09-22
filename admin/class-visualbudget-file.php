<?php
/**
 * Class for working with dataset files. This class is used by the filemanager,
 * and is not responsible for editing or otherwise touching files. It is simply
 * a data structure for information about each file.
 */

class VisualBudget_File {

    /**
     * The ID of this plugin.
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * The full path of the file.
     */
    private $full_path;

    /**
     * The filetype: may be one of:
     *      CSV, JSON
     */
    private $filetype;

    /**
     * Initialize the class and set its properties.
     * @param    string    $plugin_name   The name of this plugin.
     * @param    string    $version       The version of this plugin.
     */
    public function __construct( $plugin_name, $version ) {

        $this->plugin_name = $plugin_name;
        $this->version = $version;

    }

}

?>