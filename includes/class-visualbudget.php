<?php
/**
 * The core plugin class.
 */
class VisualBudget {

    /**
     * The loader that's responsible for maintaining and registering all hooks that power
     * the plugin.
     * @var      VisualBudget_Loader    $loader    Maintains and registers all hooks for the plugin.
     */
    protected $loader;

    /**
     * Define the core functionality of the plugin.
     *
     * Set constants that can be used throughout the plugin.
     * Load the dependencies, define the locale, and set the hooks
     * for the admin area and the public-facing side of the site.
     */
    public function __construct() {

        // Set the timezone. FIXME: How to localize?
        date_default_timezone_set("America/New_York");

        $this->define_constants();      // Define VB-related constants.
        $this->load_dependencies();     // Load dependencies.
        $this->set_locale();            // Set the locale, language.
        $this->define_admin_hooks();    // Admin hooks.
        $this->define_public_hooks();   // Public hooks.
        $this->define_shortcodes();     // Define the VB shortcodes.

    }

    /**
     * Define the constants which can be used throughout the plugin code.
     */
    public static function define_constants() {
        $trailingslashit = function ($s) { return rtrim( $s, '/\\' ) . '/'; };

        define('VISUALBUDGET_SLUG', 'visualbudget' );
        define('VISUALBUDGET_VERSION', '0.1.0' );
        define('VISUALBUDGET_UPLOAD_DIR', 'datasets/' );
        define('VISUALBUDGET_PATH', $trailingslashit(dirname(__FILE__, 2)));
        define('VISUALBUDGET_UPLOAD_PATH', VISUALBUDGET_PATH . VISUALBUDGET_UPLOAD_DIR );

        /* We cannot set the URL if being called statically. */
        // if (isset($this)) {
        define('VISUALBUDGET_URL', plugin_dir_url( dirname( __FILE__ ) ) );
        define('VISUALBUDGET_UPLOAD_URL', VISUALBUDGET_URL . VISUALBUDGET_UPLOAD_DIR );
        // }
    }

    /**
     * Load the required dependencies for this plugin.
     *
     * Include the following files that make up the plugin:
     *
     * - VisualBudget_Loader. Orchestrates the hooks of the plugin.
     * - VisualBudget_i18n. Defines internationalization functionality.
     * - VisualBudget_Admin. Defines all hooks for the admin area.
     * - VisualBudget_Public. Defines all hooks for the public side of the site.
     *
     * Create an instance of the loader which will be used to register the hooks
     * with WordPress.
     */
    private function load_dependencies() {

        /**
         * The class responsible for orchestrating the actions and filters of the
         * core plugin.
         */
        require_once VISUALBUDGET_PATH . 'includes/class-visualbudget-loader.php';

        /**
         * The class responsible for defining internationalization functionality
         * of the plugin.
         */
        require_once VISUALBUDGET_PATH . 'includes/class-visualbudget-i18n.php';

        /**
         * The class responsible for defining all actions that occur in the admin area.
         */
        require_once VISUALBUDGET_PATH . 'admin/class-visualbudget-admin.php';

        /**
         * The class responsible for defining all actions that occur in the public-facing
         * side of the site.
         */
        require_once VISUALBUDGET_PATH . 'public/class-visualbudget-public.php';

        $this->loader = new VisualBudget_Loader();

    }

    /**
     * Define the locale for this plugin for internationalization.
     *
     * Uses the VisualBudget_i18n class in order to set the domain and to register the hook
     * with WordPress.
     */
    private function set_locale() {

        $plugin_i18n = new VisualBudget_i18n();

        $this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );

    }

    /**
     * Register all of the hooks related to the admin area functionality
     * of the plugin.
     */
    private function define_admin_hooks() {

        $plugin_admin = new VisualBudget_Admin();

        // Add scripts and styles.
        $this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
        $this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );

        // Set up the file manager, including getting the credentials.
        $this->loader->add_action( 'admin_init', $plugin_admin, 'setup_dataset_manager' );

        // Set up the dashboard.
        $this->loader->add_action( 'admin_init', $plugin_admin, 'visualbudget_dashboard_init' );
        $this->loader->add_action( 'admin_menu', $plugin_admin, 'visualbudget_add_dashboard_sidelink' );

        // Display all the notices.
        $this->loader->add_action( 'admin_notices', $plugin_admin, 'notifications_callback' );
    }

    /**
     * Register all of the hooks related to the public-facing functionality
     * of the plugin.
     */
    private function define_public_hooks() {

        $plugin_public = new VisualBudget_Public();

        $this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
        $this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );

    }

    /**
     * Define the VB shortcode.
     */
    private function define_shortcodes() {
        // [visualbudget data=193826342:schools:utilities]
        add_shortcode( 'visualbudget', Array( $this, 'visualbudget_func' ) );
    }

    /**
     * This is the VB shortcode callback. It simply translates the shortcode attributes
     * into a URL to vis.php with appropriate query string.
     */
    public function visualbudget_func( $atts ) {
        $a = shortcode_atts( array(
            'data' => '',
            'vis' => '',
            'iframe' => null
        ), $atts );

        $vis_url = VISUALBUDGET_URL . "vis.php?" . http_build_query($a);

        // If the "iframe" variable was passed, then return an iframe element.
        if ($a['iframe']) {
            return "<iframe src='" . $vis_url . "'"
                . " width='100%' height='300px' style='border:1px solid #aaa;'>"
                . "</iframe>";
        } else {
            // Otherwise, return a div. We'll get the div by requesting the same page
            // with the iframe variable unset.
            return file_get_contents($vis_url);
        }

    }

    /**
     * Run the loader to execute all of the hooks with WordPress.
     */
    public function run() {
        $this->loader->run();
    }

    /**
     * The reference to the class that orchestrates the hooks with the plugin.
     * @return    VisualBudget_Loader    Orchestrates the hooks of the plugin.
     */
    public function get_loader() {
        return $this->loader;
    }


    /**
     * The name of the plugin used to uniquely identify it within the context of
     * WordPress and to define internationalization functionality.
     * @return    string    The name of the plugin.
     */
    public function get_plugin_name() {
        return VISUALBUDGET_SLUG;
    }

    /**
     * Retrieve the version number of the plugin.
     * @return    string    The version number of the plugin.
     */
    public function get_version() {
        return VISUALBUDGET_VERSION;
    }

}
