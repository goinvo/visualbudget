<?php

/**
 * This class is handles the admin-specific functionality of the plugin.
 * The dashboard, file uploads, and shortcode definitions are all handled
 * here.
 */
class VisualBudget_Admin {

    // The file manager object, for interacting with the filesystem.
    public $datasetmanager;

    // All the active datasets, stored as an array of VisualBudget_Dataset objects.
    public $datasets;

    // This is a VisualBudget_Notifications object, which is a simple object
    // to track notifications which are to be displayed to the admin.
    // Queueing up new notifications is done via its method add().
    public $notifier;

    /**
     * Initialize the class and set its properties.
     */
    public function __construct() {

        // Load the classes that the admin panel uses.
        $this->load_dependencies();

        // Set up the notifier.
        $this->notifier = new VisualBudget_Notifications();
    }

    /**
     * Load the required dependencies for the admin panel.
     */
    private function load_dependencies() {

        // The notifications class.
        require_once VISUALBUDGET_PATH . 'admin/class-visualbudget-notifications.php';

        // The class responsible for interacting with the filesystem.
        // Note that we are not instatiating the datasetmanager here, but
        // do so rather in the function setup_dataset_manager(),
        // after the credentials are obtained.
        require_once VISUALBUDGET_PATH . 'admin/class-visualbudget-datasetmanager.php';

        // Each dataset is represented as an object of the dataset class.
        require_once VISUALBUDGET_PATH . 'admin/class-visualbudget-dataset.php';

        // The validator class hold a bunch of static methods for validating data.
        require_once VISUALBUDGET_PATH . 'admin/class-visualbudget-validator.php';

        // The class which handles all the settings of VB.
        require_once VISUALBUDGET_PATH . 'admin/class-visualbudget-admin-settings.php';

    }

    /**
     * Get the credentials to read/write to the filesystem, and create a
     * VisualBudget_DatasetManager object to interface with the filesystem.
     */
    public function setup_dataset_manager() {
        // The first thing to do is to get credentials to
        // get our fingers in the filesystem.
        $access_type = get_filesystem_method();

        if ($access_type === 'direct') {
            // We can safely run request_filesystem_credentials()
            // without any issues and don't need to worry about passing in a URL
            $creds = request_filesystem_credentials(site_url() . '/wp-content/plugins/' . VISUALBUDGET_SLUG, '', false, false, array());

            // Initialize the API
            if ( ! WP_Filesystem($creds) ) {
                // Exit if there are any problems
                $this->notifier->add('Unable to get write access to '
                                    . 'WordPress filesystem.', 'error');
                return false;
            }

            // Declare the global variable $wp_filesystem, which
            // is the WP class for interacting with the filesystem.
            global $wp_filesystem;

        } else {
            // We don't have direct write access. Prompt user with our notice.
            $this->notifier->add('Unable to get write access to WordPress filesystem.',
                                    'error');
        }

        // Finally, instantiate the file manager.
        $this->datasetmanager = new VisualBudget_DatasetManager();
    }

    /**
     * Add dashboard sidelink to the WP admin screen.
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
     * Dashboard page callback. Simply display the admin page.
     */
    public function visualbudget_display_dashboard() {
        require_once VISUALBUDGET_PATH . 'admin/partials/visualbudget-admin-display.php';
    }

    /**
     * Initialize the dashboard. Register VB settings, handle any
     * file uploads or deletions, and load in all the existing
     * datasets for use by other methods.
     */
    public function visualbudget_dashboard_init() {
        $this->settings = new VisualBudget_Admin_Settings();
        $this->settings->register_settings();

        // Now that settings are registered and the filesystem is set up,
        // we may handle any uploads taking place.
        $this->handle_file_uploads();
        $this->handle_file_deletions();

        // Now construct the dataset objects and store them in $this->datasets.
        $this->datasets = $this->construct_dataset_objects();
    }

    /**
     * Determine if any files have been uploaded. If so, construct a
     * VisualBudget_Dataset object from them in order to validate the
     * data, and if everything looks good then pass them on to the
     * datasetmanager for installation.
     */
    public function handle_file_uploads() {

        // These are the field names to look for.
        $group = $this->settings->get_dataset_tab_group_name();
        $upload_input = $this->settings->get_upload_field_name();
        $url_input = $this->settings->get_url_field_name();

        // This array will have up to two dataset objects to be added:
        // one uploaded, one from URL.
        $datasets = array();

        // First check for uploaded files.
        if ( isset($_FILES[$group]) ) {
            if ( $_FILES[$group]['error'][$upload_input] != 0 ) {
                // There was an error upon upload.
                $this->notifier->add('There was an error while trying to '
                                . 'upload the file.', 'error');
            } else {
                // Things are fine, so append the new dataset to our array.
                $tmp_name = $_FILES[$group]['tmp_name'][$upload_input];
                $uploaded_name = $_FILES[$group]['name'][$upload_input];
                $dataset = new VisualBudget_Dataset($this->notifier);
                $dataset->from_upload($tmp_name, $uploaded_name);
                array_unshift($datasets, $dataset);
            }
        }

        // Now check for datasets added by URL.
        // We do this simply by checking the $_POST variable.
        if ( !empty($_POST[$group][$url_input]) ) {
            $dataset = new VisualBudget_Dataset($this->notifier);
            $dataset->from_url($_POST[$group][$url_input]);
            array_unshift($datasets, $dataset);
        }

        // Try to upload each file.
        foreach($datasets as $dataset) {

            // The validate() function takes care of all validation
            // and normalization. We pass it the notifications object
            // so it can add errors and warnings if things went wrong.
            if ( $dataset->validate() ) {

                // Write the dataset and its meta information to the 'datasets' directory
                // and write the original file to the 'datasets/orignals' directory.
                $this->datasetmanager->write_dataset( $dataset->get_filename(),
                                              $dataset->get_json() );
                $this->datasetmanager->write_dataset( $dataset->get_meta_filename(),
                                              $dataset->get_meta_json() );
                $this->datasetmanager->write_dataset( $dataset->get_original_filename(),
                                              $dataset->get_original_blob() );

            }
        }
    }

    /**
     * Delete any files that were requested to be deleted.
     */
    public function handle_file_deletions() {

        // Get the dataset inventory from the dataset manager.
        // The returned object is an array created by $wp_filesystem.
        $datasets = $this->datasetmanager->get_datasets_inventory();
        $filenames = array_keys($datasets);

        // First check if we are supposed to delete any of them.
        // If the DELETE query key is set, make sure it actually refers to
        // a real file.
        $delete_num = false;
        if ( isset($_GET['delete'])
            && $this->datasetmanager->is_file($_GET['delete'] . '_data.json') ) {

            $delete_num = $_GET[ 'delete' ];
        }

        if ($delete_num) {
            // We must delete every file with the $delete_num value in the filename;
            // $delete_num is a number, and we search for NUMBER_data.json
            // NUMBER_meta.json, etc.
            $filenames_to_delete = array_filter($filenames,
                function($filename) use ($delete_num) {
                    return ( strpos($filename, $delete_num) !== false );
                });

            foreach ($filenames_to_delete as $filename) {
                $this->datasetmanager->move_dataset($filename, 'trash/' . $filename);
            }

            // Now we refresh the page, omitting the "delete" query string key.
            // This way if the user refreshes the page (or bookmarks it for some
            // reason), the delete command will not be repeatedly invoked.
            unset($_GET['delete']);
            $query = http_build_query($_GET);
            header("Refresh:0; url=?" . $query);
        }

    }

    /**
     * Construct a VisualBudget_Dataset object for each database in the
     * datasets folder. Return all objects in an array.
     */
    public function construct_dataset_objects() {

        // Get the inventory, which is an array of files created by
        // $wp_filesystem.
        $file_array = $this->datasetmanager->get_datasets_inventory();

        // Just get the IDs of the datasets
        $ids = array_map(function($i) {
                return explode('_', $i['name'])[0];
            }, $file_array);

        // We'll have duplicates, so get a unique set
        $ids = array_unique($ids);

        // The array we are building
        $datasets = Array();

        // Construct one object for each id
        foreach ($ids as $id) {
            $dataset = new VisualBudget_Dataset($this->notifier);
            $dataset->from_file($id);
            $datasets[] = $dataset;
        }

        return $datasets;
    }


    /**
     * Display the tab nav at the top of the VB dashboard page.
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

        // Add the bootstrap CSS file
        wp_enqueue_style( 'bootstrap', plugin_dir_url( __FILE__ ) . 'css/bootstrap-wrapper.css', array(), VISUALBUDGET_VERSION, 'all' );

        // Add the VB admin CSS file
        wp_enqueue_style( 'visualbudget_css', plugin_dir_url( __FILE__ ) . 'css/visualbudget-admin.css', array(), VISUALBUDGET_VERSION, 'all' );
    }

    /**
     * Register the JavaScript for the admin area.
     */
    public function enqueue_scripts() {

        // Add the VB admin JS file
        wp_enqueue_script( 'visualbudget_js', plugin_dir_url( __FILE__ ) . 'js/visualbudget-admin.js', array( 'jquery' ), VISUALBUDGET_VERSION, false );
    }

    /**
     * The callback function for the admin notices.
     */
    public function notifications_callback() {
        echo $this->notifier->get_html();
    }

}
