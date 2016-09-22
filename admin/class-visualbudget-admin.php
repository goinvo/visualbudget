<?php

/**
 * The admin-specific functionality of the plugin.
 */

class VisualBudget_Admin {

    /**
     * Initialize the class and set its properties.
     */
    public function __construct() {

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
     * Dashboard page callback
     */
    public function visualbudget_display_dashboard() {

        require_once VISUALBUDGET_PATH . 'admin/partials/visualbudget-admin-display.php';

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
     * Register and add settings
     */
    public function visualbudget_dashboard_init() {
        register_setting(
            'visualbudget_settings_group',  // option group
            'visualbudget_settings',        // option name
            array( $this, 'sanitize' )      // sanitize
        );

        // Add a new setting section
        add_settings_section(
            'visualbudget_config',          // section ID
            'Required configuration',       // section title
            array( $this, 'print_section_info' ), // callback
            'visualbudget_dashboard'        // page
        );

        // Add the name setting
        add_settings_field(
            'org_name',                      // setting ID
            'Name of city, town, district, or organization', // setting title
            array( $this, 'org_name_callback' ),             // callback function
            'visualbudget_dashboard',        // page
            'visualbudget_config'            // settings section
        );

        // Add the contact email setting
        add_settings_field(
            'contact_email',
            'Contact email address',
            array( $this, 'contact_email_callback' ),
            'visualbudget_dashboard',
            'visualbudget_config'
        );

    }

    /**
     * Sanitize each setting field as needed
     * @param array     $input      Contains all settings fields as array keys
     */
    public function sanitize( $input ) {
        $new_input = array();
        if( isset( $input['org_name'] ) )
            $new_input['org_name'] = sanitize_text_field( $input['org_name'] );

        if( isset( $input['contact_email'] ) )
            $new_input['contact_email'] = sanitize_email( $input['contact_email'] );

        return $new_input;
    }

    /**
     * Print the section text
     */
    public function print_section_info() {
        print 'Required configuration for your Visual Budget website:';
    }

    /**
     * Callback for the long town name setting
     */
    public function org_name_callback() {
        printf(
            '<input type="text" size="35" id="org_name" name="visualbudget_settings[org_name]" value="%s" />',
            isset( $this->options['org_name'] ) ? esc_attr( $this->options['org_name']) : ''
        );
    }

    /**
     * Callback for the contact email setting
     */
    public function contact_email_callback() {
        printf(
            '<input type="text" size="35" id="contact_email" name="visualbudget_settings[contact_email]" value="%s" />',
            isset( $this->options['contact_email'] ) ? esc_attr( $this->options['contact_email']) : ''
        );
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
