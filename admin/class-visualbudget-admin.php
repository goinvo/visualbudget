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

    public function visualbudget_add_dashboard_sidelink() {
        add_menu_page(
            'Visual Budget',                            // string $page_title,
            'Visual Budget',                            // string $menu_title,
            'manage_options',                           // string $capability,
            'visualbudget',                             // string $menu_slug,
            array($this, 'visualbudget_dashboard'),     // callable $function = '',
            '',                                         // string $icon_url = '',
            null                                        // int $position = null
        );
    }


    public function visualbudget_dashboard() {

        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/partials/visualbudget-admin-display.php';

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
