<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       http://visgov.com
 * @since      0.1.0
 *
 * @package    VisualBudget
 * @subpackage VisualBudget/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    VisualBudget
 * @subpackage VisualBudget/admin
 */

class VisualBudget_Admin {

    /**
     * The ID of this plugin.
     *
     * @since    0.1.0
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    0.1.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * The settings page is accessed via
     *      [URL]/wp-admin/admin.php?page=$settings_page_handle
     */
    private $settings_page_handle = 'visualbudget';

    /**
     * Initialize the class and set its properties.
     *
     * @since    0.1.0
     * @param    string    $plugin_name   The name of this plugin.
     * @param    string    $version       The version of this plugin.
     */
    public function __construct( $plugin_name, $version ) {

        $this->plugin_name = $plugin_name;
        $this->version = $version;

    }

    /**
     * Add dashboard page
     */
    public function visualbudget_add_dashboard_sidelink() {
        add_menu_page(
            'Visual Budget',                                // string $page_title,
            'Visual Budget',                                // string $menu_title,
            'manage_options',                               // string $capability,
            $this->settings_page_handle,                    // string $menu_slug,
            array($this, 'visualbudget_display_dashboard'), // callable $function = '',
            'dashicons-chart-area',                         // string $icon_url = '',
            null                                            // int $position = null
        );
    }

    /**
     * Dashboard page callback
     */
    public function visualbudget_display_dashboard() {

        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/partials/visualbudget-admin-display.php';

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
            echo '<a href="?page=' . $this->settings_page_handle . '&tab=' . $key;
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

        // Add the state setting
        add_settings_field(
            'state',                        // setting ID
            'State or territory',           // setting title
            array( $this, 'state_callback' ), // callback function
            'visualbudget_dashboard',       // page
            'visualbudget_config'           // settings section
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
     *
     * @param array     $input      Contains all settings fields as array keys
     */
    public function sanitize( $input ) {
        $new_input = array();
        if( isset( $input['org_name'] ) )
            $new_input['org_name'] = sanitize_text_field( $input['org_name'] );

        if( isset( $input['state'] ) )
            $new_input['state'] = sanitize_text_field( $input['state'] );

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
     * Callback for the state setting
     */
    public function state_callback() {
        $states = array(
                    'Alabama (AL)',
                    'Alaska (AK)',
                    'American Samoa (AS)',
                    'Arizona (AZ)',
                    'Arkansas (AR)',
                    'California (CA)',
                    'Colorado (CO)',
                    'Connecticut (CT)',
                    'Delaware (DE)',
                    'District of Columbia (DC)',
                    'Federated States of Micronesia (FM)',
                    'Florida (FL)',
                    'Georgia (GA)',
                    'Guam (GU)',
                    'Hawaii (HI)',
                    'Idaho (ID)',
                    'Illinois (IL)',
                    'Indiana (IN)',
                    'Iowa (IA)',
                    'Kansas (KS)',
                    'Kentucky (KY)',
                    'Louisiana (LA)',
                    'Maine (ME)',
                    'Marshall Islands (MH)',
                    'Maryland (MD)',
                    'Massachusetts (MA)',
                    'Michigan (MI)',
                    'Minnesota (MN)',
                    'Mississippi (MS)',
                    'Missouri (MO)',
                    'Montana (MT)',
                    'Nebraska (NE)',
                    'Nevada (NV)',
                    'New Hampshire (NH)',
                    'New Jersey (NJ)',
                    'New Mexico (NM)',
                    'New York (NY)',
                    'North Carolina (NC)',
                    'North Dakota (ND)',
                    'Northern Marianas Islands (MP)',
                    'Ohio (OH)',
                    'Oklahoma (OK)',
                    'Oregon (OR)',
                    'Palau (PW)',
                    'Pennsylvania (PA)',
                    'Puerto Rico (RP)',
                    'Rhode Island (RI)',
                    'South Carolina (SC)',
                    'South Dakota (SD)',
                    'Tennessee (TN)',
                    'Texas (TX)',
                    'Utah (UT)',
                    'Vermont (VT)',
                    'Virgin Islands (VI)',
                    'Virginia (VA)',
                    'Washington (WA)',
                    'West Virginia (WV)',
                    'Wisconsin (WI)',
                    'Wyoming (WY)' );

        echo '<select name="visualbudget_settings[state]" id="state">';
        foreach ($states as $state) {
            echo '<option value="' . esc_attr($state) . '" '
                . selected( $this->options['state'], esc_attr($state) )
                . '>' . esc_attr($state) . '</option>';
        }
        echo '</select>';
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
     *
     * @since    0.1.0
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
     *
     * @since    0.1.0
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
