<?php

/**
 * All of the admin settings, which can be injected into whichever pages they're needed.
 */

class VisualBudget_Admin_Settings {

    /**
     * Initialize the class and set its properties.
     */
    public function __construct() {
    }

    /**
     * Register and add settings
     */
    public function register_settings() {
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


}

?>