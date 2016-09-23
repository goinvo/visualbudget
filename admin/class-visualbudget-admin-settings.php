<?php

/**
 * All of the admin settings, which can be injected into whichever pages they're needed.
 */

class VisualBudget_Admin_Settings {

    // Define both the settings group name and an array of input "name"
    // attributes, so that the admin class can know while $_FILES[]
    // to look for and what to do with them.
    private $upload_field_names;
    private $settings_group_name;

    /**
     * Initialize the class and set its properties.
     */
    public function __construct() {
        $this->settings_group_name = 'visualbudget_settings';
        $this->upload_field_names = Array('upload');
    }

    /**
     * Register and add settings
     */
    public function register_settings() {
        // First set up the options group
        register_setting(
            $this->settings_group_name,           // option group
            $this->settings_group_name,           // option name
            array( $this, 'sanitize' )            // sanitize
        );

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * CONFIGURATION OPTIONS
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        // And add a new setting section for configuration
        add_settings_section(
            'visualbudget_section',               // section ID
            'Required configuration',             // section title
            '',                                   // callback
            'visualbudget_configuration'          // page
        );

        // Add the name setting
        add_settings_field(
            'org_name',                                      // setting ID
            'Name of city, town, district, or organization', // setting title
            array( $this, 'org_name_callback' ),             // callback function
            'visualbudget_configuration',                    // page
            'visualbudget_section'                           // settings section
        );

        // Add the contact email setting
        add_settings_field(
            'contact_email',
            'Contact email address',
            array( $this, 'contact_email_callback' ),
            'visualbudget_configuration',
            'visualbudget_section'
        );

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
         * DATASET UPLOADER
         * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        // And add a new setting section for the uploader
        add_settings_section(
            'visualbudget_section',               // section ID
            'Upload a new dataset',               // section title
            '',                                   // callback
            'visualbudget_datasets_upload'        // page
        );

        // Add the contact email setting
        add_settings_field(
            'upload',
            'Upload new dataset',
            array( $this, 'upload_callback' ),
            'visualbudget_datasets_upload',
            'visualbudget_section'
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
            '<input type="text" size="35" id="org_name" name="visualbudget_settings[org_name]" value="%s" />',
            isset( $this->options['org_name'] ) ? esc_attr( $this->options['org_name']) : ''
        );
    }

    // Callback for the contact email setting
    public function contact_email_callback() {
        printf(
            '<input type="text" size="35" id="contact_email" name="visualbudget_settings[contact_email]" value="%s" />',
            isset( $this->options['contact_email'] ) ? esc_attr( $this->options['contact_email']) : ''
        );
    }

    // Callback for the upload
    public function upload_callback() {
        printf( '<input name="visualbudget_settings[upload]" id="upload" type="file" />' );
    }

    // Get function for the settings group name.
    // The admin class uses this.
    public function get_settings_group_name() {
        return $this->settings_group_name;
    }

    // Get function for the upload field names.
    // The admin class uses this.
    public function get_upload_field_names() {
        return $this->upload_field_names;
    }

}
