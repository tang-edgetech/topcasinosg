<?php
/**
 * Plugin Name: LN Elementor
 * Description: Custom Elementor widgets by LN.
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: ln-elementor
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

// Define constants
define( 'LN_ELEMENTOR_VERSION', '1.0.'.time() );
define( 'LN_ELEMENTOR_PATH', plugin_dir_path( __FILE__ ) );
define( 'LN_ELEMENTOR_URL', plugin_dir_url( __FILE__ ) );

add_action( 'elementor/widgets/register', 'ln_elementor_register_widgets' );
function ln_elementor_register_widgets( $widgets_manager ) {
    require_once LN_ELEMENTOR_PATH . 'widgets/ln-website-copyright.php';
    require_once LN_ELEMENTOR_PATH . 'widgets/ln-text-collapsible-editor.php';
    require_once LN_ELEMENTOR_PATH . 'widgets/ln-line-break.php';
    require_once LN_ELEMENTOR_PATH . 'widgets/ln-information-swiper.php';
    require_once LN_ELEMENTOR_PATH . 'widgets/ln-casino-calculator.php';
    require_once LN_ELEMENTOR_PATH . 'widgets/ln-horizontal-iconbox.php';
    require_once LN_ELEMENTOR_PATH . 'widgets/ln-gallery-swiper.php';

    $widgets_manager->register( new \LN_Elementor\Widgets\LN_Website_Copyright() );
    $widgets_manager->register( new \LN_Elementor\Widgets\LN_Text_Collapsible_Editor() );
    $widgets_manager->register( new \LN_Elementor\Widgets\LN_Line_Break() );
    $widgets_manager->register( new \LN_Elementor\Widgets\LN_Information_Swiper() );
    $widgets_manager->register( new \LN_Elementor\Widgets\LN_Casino_Calculator() );
    $widgets_manager->register( new \LN_Elementor\Widgets\LN_Horizontal_Iconbox() );
    $widgets_manager->register( new \LN_Elementor\Widgets\LN_Gallery_Swiper() );
}

function ln_elementor_editor_scripts() {
    wp_enqueue_style(
        'ln-elementor-editor-style',
        LN_ELEMENTOR_URL . 'assets/css/editor.css',
        [],
        LN_ELEMENTOR_VERSION,
        'all'
    );

    wp_enqueue_script(
        'ln-elementor-editor-script',
        LN_ELEMENTOR_URL . 'assets/js/editor.js',
        [ 'jquery' ],
        LN_ELEMENTOR_VERSION,
        true
    );
}
add_action( 'wp_enqueue_scripts', 'ln_elementor_editor_scripts' );

add_action( 'elementor/elements/categories_registered', function( $elements_manager ) {
    $elements_manager->add_category(
        'ln-widgets',
        [
            'title' => __( 'LN Widgets', 'ln-elementor' ),
            'icon'  => 'fa fa-plug',
        ]
    );
});