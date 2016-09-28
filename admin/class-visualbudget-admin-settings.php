<?php

/**
 * This class is responsible for the VB settings, defined and managed
 * using the WordPress Settings API.
 */
class VisualBudget_Admin_Settings {

    /**
     * The option group and field names are defined here
     * so that the admin class can retrieve them in order
     * to know which $_FILES[] to look for during uploading.
     */
    private $upload_field_names;
    private $upload_group_name;
    private $settings_group_names;

    /**
     * Initialize the class and set a few properties.
     */
    public function __construct() {
        $this->settings_group_names = Array(
                    'visualbudget_tab_config',
                    'visualbudget_tab_datasets'
                    );
        $this->upload_group_name = 'visualbudget_tab_datasets';
        $this->upload_field_names = Array('upload');
    }

    /**
     * Register and add settings, group by group.
     */
    public function register_settings() {
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * CONFIGURATION OPTIONS
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        // And add a new setting section for configuration
        add_settings_section(
            'visualbudget_config',                // section ID
            'Required configuration',             // section title
            '',                                   // callback
            'visualbudget_tab_config'             // page
        );

        // Add the name setting
        add_settings_field(
            'org_name',                                      // setting ID
            'Name of city, town, district, or organization', // setting title
            array( $this, 'org_name_callback' ),             // callback function
            'visualbudget_tab_config',                       // page
            'visualbudget_config'                            // settings section
        );

        // Add the contact email setting
        add_settings_field(
            'contact_email',
            'Contact email address',
            array( $this, 'contact_email_callback' ),
            'visualbudget_tab_config',
            'visualbudget_config'
        );

        // Now register the settings
        register_setting(
            'visualbudget_tab_config',            // option group
            'visualbudget_tab_config',            // option name
            array( $this, 'sanitize' )            // sanitize
        );

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * DATASET UPLOADER
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        // And add a new setting section for the uploader
        add_settings_section(
            'visualbudget_upload',                // section ID
            'Upload a new dataset',               // section title
            '',                                   // callback
            'visualbudget_tab_datasets'           // page
        );

        // Add the contact email setting
        add_settings_field(
            'upload',
            'Upload new dataset',
            array( $this, 'upload_callback' ),
            'visualbudget_tab_datasets',
            'visualbudget_upload'
        );

        // Now register the settings
        register_setting(
            'visualbudget_tab_datasets',          // option group
            'visualbudget_tab_datasets',          // option name
            array( $this, 'sanitize' )            // sanitize
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
            $new_input['contact_email'] = sanitize_text_field( $input['contact_email'] );

        // We don't want WP to save uploaded files to the database;
        // so we intercept them in the admin and upload them ourselves locally.
        if( isset( $input['upload'] ) ) {
            // Do nothing.
        }

        return $new_input;
    }

    // Callback for the organization name setting
    public function org_name_callback() {
        printf(
            '<input type="text" size="35" id="org_name" name="visualbudget_tab_config[org_name]" value="%s" />',
            isset( $this->options['org_name'] ) ? esc_attr( $this->options['org_name']) : ''
        );
    }

    // Callback for the contact email setting
    public function contact_email_callback() {
        printf(
            '<input type="text" size="35" id="contact_email" name="visualbudget_tab_config[contact_email]" value="%s" />',
            isset( $this->options['contact_email'] ) ? esc_attr( $this->options['contact_email']) : ''
        );
    }

    // Callback for the uploader
    public function upload_callback() {
        printf( '<input name="visualbudget_tab_datasets[upload]" id="upload" type="file" />' );
    }

    // Get function for the upload settings group name.
    // The admin class uses this.
    public function get_upload_group_name() {
        return $this->upload_group_name;
    }

    // Get function for the upload field names.
    // The admin class uses this.
    public function get_upload_field_names() {
        return $this->upload_field_names;
    }

}
