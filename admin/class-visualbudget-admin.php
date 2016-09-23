<?php

/**
 * The admin-specific functionality of the plugin.
 */

class VisualBudget_Admin {

    // The file manager object, for interacting with the filesystem.
    public $filemanager;

    /**
     * Initialize the class and set its properties.
     */
    public function __construct() {

        // Load the classes that the admin panel uses.
        $this->load_dependencies();

    }

    /**
     * Load the required dependencies for the admin panel.
     */
    private function load_dependencies() {

        // The class responsible for interacting with the filesystem.
        // Note that we are not instatiating the filemanager here, but
        // do rather in the function setup_filesystem_manager(),
        // after the credentials are obtained.
        require_once VISUALBUDGET_PATH . 'admin/class-visualbudget-filemanager.php';

        // The class which handles all the settings of VB.
        require_once VISUALBUDGET_PATH . 'admin/class-visualbudget-admin-settings.php';

    }

    /**
     * Required to read/write to the filesystem.
     */
    public function setup_filesystem_manager() {
        // The firs thing to do is to get credentials to
        // get our fingers in the filesystem.
        $access_type = get_filesystem_method();
        if($access_type === 'direct') {
            // We can safely run request_filesystem_credentials()
            // without any issues and don't need to worry about passing in a URL
            $creds = request_filesystem_credentials(site_url() . '/wp-content/plugins/' . VISUALBUDGET_SLUG, '', false, false, array());

            // Initialize the API
            if ( ! WP_Filesystem($creds) ) {
                // Exit if there are any problems
                return false;
            }

            // Declare the global variable $wp_filesystem, which
            // is the WP class for interacting with the filesystem.
            global $wp_filesystem;

        } else {
            // We don't have direct write access. Prompt user with our notice.
            // FIXME: Add notice of error.
        }

        // Finally, instantiate the file manager.
        $this->filemanager = new VisualBudget_FileManager();
    }

    /**
     * Add dashboard page
     */
    public function visualbudget_add_dashboard_sidelink() {
        add_menu_page(
            'Visual Budget',                                // string $page_title,
            'Visual Budget',                                // string $menu_title,
            'manage_options',                               // string $capability,
            VISUALBUDGET_SLUG,                              // string $menu_slug,
            array($this, 'visualbudget_display_dashboard'), // callable $function = '',
            'dashicons-chart-area',                         // string $icon_url = '',
            null                                            // int $position = null
        );
    }

    /**
     * Dashboard page callback. Simply display the page.
     */
    public function visualbudget_display_dashboard() {
        require_once VISUALBUDGET_PATH . 'admin/partials/visualbudget-admin-display.php';
    }

    /**
     * Initialize the dashboard
     */
    public function visualbudget_dashboard_init() {
        $this->settings = new VisualBudget_Admin_Settings();
        $this->settings->register_settings();

        // Now that settings are registered and the filesystem is set up,
        // we may handle any uploads taking place.
        $this->handle_file_uploads();
    }

    /**
     * Pass uploaded files on to the filemanager.
     */
    public function handle_file_uploads() {
        // These are the field names to look for.
        $settings_name = $this->settings->get_settings_group_name();
        $input_names = $this->settings->get_upload_field_names();

        // Try to upload each file.
        // The file manager takes care of error handling.
        foreach($input_names as $i => $input_name) {
            $this->filemanager->upload_file($settings_name, $input_name);
        }

        // // conversion of CSV to JSON
        // $file = "abc.csv";
        // $csv = file_get_contents($file);
        // $array = array_map("str_getcsv", explode("\n", $csv));
        // $json = json_encode($array);
    }

    /**
     * Display the tab nav at the top of the VB dashboard page
     */
    public function visualbudget_display_dashboard_tabs() {
        echo '<h2 class="nav-tab-wrapper">';

        // Get the active tab name if there is one; else go to default.
        $active_tab = isset( $_GET[ 'tab' ] ) ? $_GET[ 'tab' ] : 'configuration';

        // A list of the tabs
        $tabs = array(
            'configuration' =>
                array('name'=>'Configuration',
                      'icon'=>'dashicons-admin-settings'),
            'datasets' =>
                array('name'=>'Datasets',
                      'icon'=>'dashicons-media-spreadsheet'),
            'visualizations' =>
                array('name'=>'Visualizations',
                      'icon'=>'dashicons-chart-line'),
            );

        foreach ($tabs as $key => $info) {
            echo '<a href="?page=' . VISUALBUDGET_SLUG . '&tab=' . $key;
            echo '" class="nav-tab ' . ( $active_tab == $key ? 'nav-tab-active' : '' );
            echo '"><span class="dashicons ' . $info['icon'] . '" style="margin-right:.3em"></span>';
            echo $info['name'] . '</a>';
        }
        echo '</h2>';
    }

    /**
     * Register the stylesheets for the admin area.
     */
    public function enqueue_styles() {

        /**
         * This function is provided for demonstration purposes only.
         *
         * An instance of this class should be passed to the run() function
         * defined in VisualBudget_Loader as all of the hooks are defined
         * in that particular class.
         *
         * The VisualBudget_Loader will then create the relationship
         * between the defined hooks and the functions defined in this
         * class.
         */

        wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/visualbudget-admin.css', array(), $this->version, 'all' );

    }

    /**
     * Register the JavaScript for the admin area.
     */
    public function enqueue_scripts() {

        /**
         * This function is provided for demonstration purposes only.
         *
         * An instance of this class should be passed to the run() function
         * defined in VisualBudget_Loader as all of the hooks are defined
         * in that particular class.
         *
         * The VisualBudget_Loader will then create the relationship
         * between the defined hooks and the functions defined in this
         * class.
         */

        wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/visualbudget-admin.js', array( 'jquery' ), $this->version, false );

    }

}
