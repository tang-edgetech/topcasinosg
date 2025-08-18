<?php
/**
 * Plugin Name: TopCasinoSG Widgets
 * Description: Custom Elementor widgets for TopCasinoSG
 * Version: 1.0.0
 * Author: Your Name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define('PLUGIN_DIR', plugin_dir_path(__FILE__));

// Register widgets
function topcasinosg_register_widgets( $widgets_manager ) {
    require_once PLUGIN_DIR . '/widgets/my-container-widget.php';
    require_once PLUGIN_DIR . '/widgets/topcasino-container-widget.php';
    
    $widgets_manager->register( new \MyContainer_Widget() );
    $widgets_manager->register( new \TopcasinoContainerWidget() );
}

function topcasinosg_register_elementor() {
    if ( did_action( 'elementor/loaded' ) ) {
        add_action( 'elementor/widgets/register', 'topcasinosg_register_widgets' );
    }
}
add_action( 'elementor/widgets/register', 'topcasinosg_register_elementor');

function topcasinosg_add_widget_categories( $elements_manager ) {
    $elements_manager->add_category(
        'topcasinosg-category',
        [
            'title' => __( 'TopCasinoSG Widgets', 'topcasinosg_widgets' ),
            'icon'  => 'fa fa-plug',
        ]
    );
}
add_action( 'elementor/elements/categories_registered', 'topcasinosg_add_widget_categories' );