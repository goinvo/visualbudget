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
     * Set the plugin name and the plugin version that can be used throughout the plugin.
     * Load the dependencies, define the locale, and set the hooks for the admin area and
     * the public-facing side of the site.
     */
    public function __construct() {

        /**
         * Define all constants related to this plugin.
         */
        define('VISUALBUDGET_SLUG', 'visualbudget' );
        define('VISUALBUDGET_VERSION', '0.1.0' );
        define('VISUALBUDGET_PATH', plugin_dir_path( dirname( __FILE__ ) ) );
        define('VISUALBUDGET_UPLOAD_PATH', VISUALBUDGET_PATH . 'datasets/' );

        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
        $this->define_public_hooks();

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

        $this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
        $this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );

        $this->loader->add_action( 'admin_init', $plugin_admin, 'get_filesystem_credentials' );

        $this->loader->add_action( 'admin_menu', $plugin_admin, 'visualbudget_add_dashboard_sidelink' );
        $this->loader->add_action( 'admin_init', $plugin_admin, 'visualbudget_dashboard_init' );
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
