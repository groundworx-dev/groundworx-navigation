<?php
/**
 * Plugin Name: Groundworx Navigation
 * Description: Responsive Gutenberg navigation for theme.json ready themes. Modal, dropdown, slide-in & hamburger. Supporting: accordion, stacked, list, vertical, and horizontal.
 * Version: 1.0.5
 * Plugin URI: https://wordpress.org/plugins/groundworx-navigation
 * Requires at least: 6.5
 * Tested up to: 6.8
 * Requires PHP: 8.2
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Author: Groundworx
 * Author URI: https://groundworx.dev
 * Donate link: https://ko-fi.com/groundworx
 * GitHub URI: https://github.com/groundworx-dev/groundworx-navigation
 */

defined( 'ABSPATH' ) || exit;

define( 'GROUNDWORX_NAVIGATION_VERSION', '1.0.5' );
define( 'GROUNDWORX_NAVIGATION_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GROUNDWORX_NAVIGATION_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

class Groundworx_Navigation_Loader {
    /** @var string The plugin version number. */
    var $version;
    private static $post_type = 'gwx_menu';
    private $default_slug   = 'menu';
    
    /**
     * __construct
     *
     * A dummy constructor to ensure GROUNDWORX_NAVIGATION is only setup once.
     *
     * @date    23/06/12
     * @since   5.0.0
     *
     * @param   void
     * @return  void
     */
    function __construct() {
        $this->version = $this->get_plugin_version();
    }

    /**
     * initialize
     *
     * Sets up the GROUNDWORX_NAVIGATION plugin.
     *
     * @date    28/09/13
     * @since   5.0.0
     *
     * @param   void
     * @return  void
     */

    public static function init() {
        // Register CPT, blocks, and view modules early.
        add_action( 'init', [__CLASS__, 'register_post_type'], 5 );
        add_action( 'init', [__CLASS__, 'load_blocks'] , 5 );
        add_action( 'init', [__CLASS__, 'register_view_module'], 5 );

        // Update messages and template types.
        add_filter('post_updated_messages', [__CLASS__, 'updated_messages'] );
        add_filter( 'default_template_types', [__CLASS__, 'add_default_template_types'], 10, 1 );

        // Front-end and editor assets.
        add_action( 'wp_enqueue_scripts', [__CLASS__, 'enqueue_scripts'], 101);
        add_action( 'wp_enqueue_scripts', [__CLASS__, 'enqueue_styles'], 101);
        add_action( 'enqueue_block_editor_assets', [__CLASS__, 'admin_enqueue_scripts'], 101);

        // Block support files.
        self::include_support_assets();
        add_action( 'enqueue_block_editor_assets', [__CLASS__, 'supports_enqueue_editor_scripts'], 101 );
        add_action( 'enqueue_block_assets', [__CLASS__, 'supports_enqueue_all_styles'], 101 );
        add_action( 'enqueue_block_assets', [__CLASS__, 'supports_enqueue_scripts'], 101 );
    }

    function get_plugin_version() {
        require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
        $plugin_data = get_file_data(__FILE__, ['Version' => 'Version']);
        return $plugin_data['Version'];
    }

    function define( $name, $value = true ) {
        if( !defined($name) ) {
            define( $name, $value );
        }
    }

    protected static function get_supports() {
        return glob(GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/build/supports/*', GLOB_ONLYDIR);
    }

    public static function include_support_assets() {
        foreach (self::get_supports() as $dir) {
            if (file_exists("$dir/support.php")) {
                include "$dir/support.php";
            }
        }
    }

    public static function supports_enqueue_scripts() {
        foreach (self::get_supports() as $dir) {
            $name = basename($dir);
            $src = str_replace(ABSPATH, '', $dir);

            if (file_exists("$dir/index.asset.php")) {
                $asset = include("$dir/index.asset.php");
                wp_enqueue_script("support-$name-script", "/$src/index.js", $asset['dependencies'], $asset['version'], true);
            }
        }
    }

    public static function supports_enqueue_editor_scripts() {
        foreach (self::get_supports() as $dir) {
            $name = basename($dir);
            $src = str_replace(ABSPATH, '', $dir);

            if (file_exists("$dir/editor.asset.php")) {
                $asset = include("$dir/editor.asset.php");
                wp_enqueue_script("support-$name-editor-script", "/$src/editor.js", $asset['dependencies'], $asset['version'], true);
            }
            if (file_exists("$dir/editor.css")) {
                wp_enqueue_style("support-$name-editor-style", "/$src/editor.css", [], filemtime("$dir/editor.css"));
            }
        }
    }

    public static function supports_enqueue_all_styles() {
        foreach (self::get_supports() as $dir) {
            $name = basename($dir);
            $src = str_replace(ABSPATH, '', $dir);

            if (file_exists("$dir/index.css")) {
                wp_enqueue_style("support-$name-style", "/$src/index.css", [], filemtime("$dir/index.css"));
            }
        }
    }

    /**
     * Registers the `menu` post type.
     */
    public static function register_post_type() {
        
        // Used only for dynamic labels (not for _x).
        $singular = __( 'Menu', 'groundworx-navigation' );
        $plural = __( 'Menus', 'groundworx-navigation' );

        register_post_type(self::$post_type, [
            'labels' => [
                'name' => $plural,
                'singular_name' => $singular,
                'menu_name' => $plural,
                // translators: %s: plural post type label
                'all_items'                => sprintf( __( 'All %s', 'groundworx-navigation' ), $plural ),
                // translators: %s: plural post type label
                'archives'                 => sprintf( __( '%s Archives', 'groundworx-navigation' ), $plural ),
                // translators: %s: plural post type label
                'attributes'               => sprintf( __( '%s Attributes', 'groundworx-navigation' ), $plural ),
                // translators: %s: plural post type label (lowercase)
                'insert_into_item'        => sprintf( __( 'Insert into %s', 'groundworx-navigation' ), strtolower( $plural ) ),
                // translators: %s: singular post type label (lowercase)
                'uploaded_to_this_item'   => sprintf( __( 'Uploaded to this %s', 'groundworx-navigation' ), strtolower( $singular ) ),
                'featured_image'          => __( 'Featured Photo', 'groundworx-navigation' ),
                'set_featured_image'      => __( 'Set featured photo', 'groundworx-navigation' ),
                'remove_featured_image'   => __( 'Remove featured photo', 'groundworx-navigation' ),
                'use_featured_image'      => __( 'Use as featured photo', 'groundworx-navigation' ),
                // translators: %s: plural post type label
                'filter_items_list'       => sprintf( __( 'Filter %s list', 'groundworx-navigation' ), $plural ),
                // translators: %s: plural post type label
                'items_list_navigation'   => sprintf( __( '%s list navigation', 'groundworx-navigation' ), $plural ),
                // translators: %s: plural post type label
                'items_list'              => sprintf( __( '%s list', 'groundworx-navigation' ), $plural ),
                // translators: %s: singular post type label
                'new_item'                => sprintf( __( 'New %s', 'groundworx-navigation' ), $singular ),
                'add_new'                 => __( 'Add New', 'groundworx-navigation' ),
                // translators: %s: singular post type label
                'add_new_item'            => sprintf( __( 'Add New %s', 'groundworx-navigation' ), $singular ),
                // translators: %s: singular post type label
                'edit_item'               => sprintf( __( 'Edit %s', 'groundworx-navigation' ), $singular ),
                // translators: %s: singular post type label
                'view_item'               => sprintf( esc_html_x( 'View %s', 'singular post type label', 'groundworx-navigation' ), esc_html( $singular ) ),
                // translators: %s: plural post type label
                'view_items'              => sprintf( esc_html_x( 'View %s', 'plural post type label', 'groundworx-navigation' ), esc_html( $plural ) ),
                // translators: %s: plural post type label (lowercase)
                'search_items'            => sprintf( __( 'Search %s', 'groundworx-navigation' ), $plural ),
                // translators: %s: plural post type label (lowercase)
                'not_found'               => sprintf( __( 'No %s found', 'groundworx-navigation' ), strtolower( $plural ) ),
                // translators: %s: plural post type label (lowercase)
                'not_found_in_trash'      => sprintf( __( 'No %s found in trash', 'groundworx-navigation' ), strtolower( $plural ) ),
                // translators: %s: plural post type label
                'parent_item_colon'       => sprintf( __( 'Parent %s:', 'groundworx-navigation' ), $plural ),
            ],
            'description'            => __( 'Custom navigation menus for Groundworx.', 'groundworx-navigation' ),
            'public' => false,
            '_builtin' => false,
            'has_archive' => false,
            'show_ui' => true,
            'show_in_menu' => false,
            'show_in_admin_bar' => false,
            'show_in_nav_menus' => false,
            'show_in_rest' => true,
            'exclude_from_search' => true,
            'publicly_queryable' => false,
            'rest_base' => 'gwx-menu',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'map_meta_cap' => true,
            'capabilities' => [
                'edit_others_posts' => 'edit_theme_options',
                'delete_posts' => 'edit_theme_options',
                'publish_posts' => 'edit_theme_options',
                'create_posts' => 'edit_theme_options',
                'read_private_posts' => 'edit_theme_options',
                'delete_private_posts' => 'edit_theme_options',
                'delete_published_posts' => 'edit_theme_options',
                'delete_others_posts' => 'edit_theme_options',
                'edit_private_posts' => 'edit_theme_options',
                'edit_published_posts' => 'edit_theme_options',
                'edit_posts' => 'edit_theme_options',
            ],
            'supports' => [ 'title', 'editor', 'revisions' ],
            'menu_icon' => 'dashicons-menu',
            'template' => [
                [ 'groundworx/navigation-link', [] ],
            ],
            'template_lock' => false,
            'menu_position' => null,
        ]);
    }

    public static function load_blocks() {
        $blocks = glob( GROUNDWORX_NAVIGATION_PLUGIN_DIR . 'build/blocks/**/block.php' );
        if (!empty($blocks)) {
            foreach (array_unique($blocks) as $block) {
                if (is_file($block)) require_once $block;
            }
        }
    }

    /**
     * Sets the post updated messages for the post type.
     *
     * @param  array $messages Post updated messages.
     * @return array Messages for the `menu` post type.
     */
    public static function updated_messages( $messages ) {
        global $post;

        $permalink = get_permalink($post);

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Only used to display admin message, no action taken.
        $revision = isset( $_GET['revision'] ) ? absint( $_GET['revision'] ) : 0;

        $post_type_object = get_post_type_object( self::$post_type );

        $messages[self::$post_type] = array(
            0 => '', // Unused. Messages start at index 1.
            // translators: 1: post type singular label, 2: permalink, 3: view link label.
            1 => sprintf(__('%1$s updated. <a target="_blank" href="%2$s">%3$s</a>', 'groundworx-navigation'), 
                $post_type_object->labels->singular_name, 
                esc_url($permalink), 
                $post_type_object->labels->view_item
            ),
            2 => __('Custom field updated.', 'groundworx-navigation'),
            3 => __('Custom field deleted.', 'groundworx-navigation'),
            // translators: %s: [what it represents, e.g., post type name]
            4 => sprintf(__('%s updated.', 'groundworx-navigation'), 
                $post_type_object->labels->singular_name
            ),
            5 => isset( $revision ) ? (
                sprintf(
                    // translators: 1: post type singular label, 2: date of revision
                    __( '%1$s restored to revision from %2$s', 'groundworx-navigation' ),
                    $post_type_object->labels->singular_name,
                    wp_post_revision_title( $revision, false ) // sanitize
                )
            ) : false,
            // translators: 1: post type singular label, 2: permalink, 3: view link label.
            6 => sprintf(__('%1$s published. <a href="%2$s">%3$s</a>', 'groundworx-navigation'), 
                $post_type_object->labels->singular_name, 
                esc_url($permalink),
                $post_type_object->labels->view_item
            ),
            // translators: %s: post type singular label
            7 => sprintf(__('%1$s saved.', 'groundworx-navigation'), 
                    $post_type_object->labels->singular_name 
            ),
            // translators: %s: post permalink
            8 => sprintf(__('%1$s submitted. <a target="_blank" href="%2$s">Preview %3$s</a>', 'groundworx-navigation'), 
                $post_type_object->labels->singular_name, 
                esc_url(add_query_arg('preview', 'true', $permalink)),
                strtolower($post_type_object->labels->singular_name)
            ),
            // translators: 1: scheduled date, 2: permalink, 3: post type singular, 4: lowercase post type.
            9 => sprintf(__('%3$s scheduled for: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Preview %4$s</a>', 'groundworx-navigation'),
                date_i18n(__('M j, Y @ G:i', 'groundworx-navigation' ), 
                strtotime($post->post_date)), esc_url($permalink),
                $post_type_object->labels->singular_name,
                strtolower($post_type_object->labels->singular_name)
            ),
            // translators: 1: preview link, 2: post type singular label, 3: lowercase post type label
            10 => sprintf(__('%2$s draft updated. <a target="_blank" href="%1$s">Preview %3$s</a>', 'groundworx-navigation'), 
                esc_url(add_query_arg('preview', 'true', $permalink)),
                $post_type_object->labels->singular_name,
                strtolower($post_type_object->labels->singular_name)
            ),
        );

        return $messages;
    }
    

    public static function add_default_template_types($default_template_types) { 
        $post_type_object = get_post_type_object(self::$post_type);
        
        if($post_type_object) {
            $title = sprintf(
            /* translators: %s: post type plural label */
            __( '%s Page', 'groundworx-navigation' ),
            $post_type_object->labels->name
        );

        $description = sprintf(
            /* translators: %s: post type plural label */
            __( 'Displays %s archive.', 'groundworx-navigation' ),
            $post_type_object->labels->name
        );

        $default_template_types["archive-".self::$post_type] = array(
            'title' => $title,
            'description' => $description,
        );

        $single_title = sprintf(
            /* translators: %s: post type singular label */
            __( 'Single %s', 'groundworx-navigation' ),
            $post_type_object->labels->singular_name
        );

        $single_description = sprintf(
            /* translators: %s: post type singular label */
            __( 'Displays single %s on your website.', 'groundworx-navigation' ),
            $post_type_object->labels->singular_name
        );

        $default_template_types["single-".self::$post_type] = array(
            'title' => $single_title,
            'description' => $single_description,
        );

        }
        
        return $default_template_types; 
    }

    
    public static function enqueue_scripts() {
        $asset_file_path = GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/build/main.asset.php';
        $script_file_path = GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/build/main.js';
        
        // Check if both the asset file and the script file exist
        if ( !file_exists( $asset_file_path ) ) {
            return; // Exit the function if the asset file is missing
        }
    
        if ( !file_exists( $script_file_path ) ) {
            return; // Exit the function if the script file is missing
        }
    
        // If both files exist, proceed with including the asset file
        $asset_file = include( $asset_file_path );
    
        $scripts = [
            [
                'label' => self::$post_type."-scripts",
                'src' => plugins_url('/build/main.js', __FILE__ ),
                'dependencies' => $asset_file['dependencies'],
                'version' => $asset_file['version'],
                'in_footer' => true
            ],
        ];
    
        foreach ($scripts as $script) {
            wp_register_script(
                $script['label'],
                $script['src'],
                $script['dependencies'],
                $script['version'],
                $script['in_footer']
            );
    
            wp_enqueue_script($script['label']);
        }
    }
    
    public static function register_view_module() {
        $asset_path  = GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/build/view.asset.php';
        $script_path = GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/build/view.js';

        if ( ! file_exists( $asset_path ) || ! file_exists( $script_path ) ) {
            return;
        }

        $asset = include $asset_path;

        wp_register_script_module(
            'groundworx-navigation-view',
            plugins_url( '/build/view.js', __FILE__ ),
            $asset['dependencies'] ?? [],
            $asset['version'] ?? false,
            array( 'in_footer' => true )
        );
    }

    public static function enqueue_editor_scripts() {
        $asset_file_path = GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/build/editor.asset.php';
        $script_file_path = GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/build/editor.js';
        
        // Check if the asset file exists
        if ( !file_exists( $asset_file_path ) ) {
            return; // Exit the function if the asset file is missing
        }
    
        // Check if the script file exists
        if ( !file_exists( $script_file_path ) ) {
            return; // Exit the function if the script file is missing
        }
    
        // If both files exist, proceed with including the asset file
        $asset_file = include( $asset_file_path );
    
        $scripts = [
            [
                'label' => self::$post_type."-editor-scripts",
                'src' => plugins_url('/build/editor.js', __FILE__ ),
                'dependencies' => $asset_file['dependencies'],
                'version' => $asset_file['version'],
                'in_footer' => true
            ],
        ];
    
        foreach ($scripts as $script) {
            wp_register_script(
                $script['label'],
                $script['src'],
                $script['dependencies'],
                $script['version'],
                $script['in_footer']
            );
    
            wp_enqueue_script($script['label']);
        }
    }


    public static function enqueue_styles() {
        $asset_file_path = GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/build/main.asset.php';
        $style_file_path = GROUNDWORX_NAVIGATION_PLUGIN_DIR . '/build/main.css';
        
        // Check if both the asset file and the script file exist
        if ( !file_exists( $asset_file_path ) ) {
            return; // Exit the function if the asset file is missing
        }

        // Check if the style file exists
        if ( !file_exists( $style_file_path ) ) {
            return; // Exit the function if the style file is missing
        }
        
        // If both files exist, proceed with including the asset file
        $asset_file = include( $asset_file_path );

        $styles = [
            [
                'label' => self::$post_type."-css-main",
                'src' => plugins_url('/build/main.css', __FILE__ ),
                'dependencies' => $asset_file['dependencies'],
                'version' => $asset_file['version'],
            ]
        ];

        foreach ($styles as $style) {
            wp_register_style(
                $style['label'],
                $style['src'],
                $style['dependencies'],
                $style['version'],
                false
            );

            wp_enqueue_style($style['label']);
        }
        
    }

    public static function admin_enqueue_scripts($hook) {
        self::enqueue_editor_scripts();
        self::enqueue_scripts();
        self::enqueue_styles();
    }

} 

Groundworx_Navigation_Loader::init();