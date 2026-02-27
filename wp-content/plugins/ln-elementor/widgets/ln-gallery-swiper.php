<?php
namespace LN_Elementor\Widgets;

use Elementor\Widget_Base;
use Elementor\Icons_Manager;
use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Border;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class LN_Gallery_Swiper extends Widget_Base {

    public function get_name() {
        return 'ln-gallery_swiper';
    }

    public function get_title() {
        return __( 'LN Gallery Swiper', 'ln-elementor' );
    }

    public function get_icon() {
        return 'eicon-slider-push';
    }

    public function get_keywords() {
        return [ 'swiper', 'slider', 'ln' ];
    }

	public function get_categories() {
		return [ 'ln-widgets' ];
	}

    protected function register_controls() {
        $this->start_controls_section(
            'swiper_gallery',
            [
                'label' => __( 'Gallery', 'ln-elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

		$this->add_control(
			'gallery',
			[
				'label' => esc_html__( 'Add Images', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::GALLERY,
				'show_label' => false,
				'default' => [],
			]
		);


        $this->end_controls_section();


        $this->start_controls_section(
            'swiper_slider',
            [
                'label' => __( 'Slider', 'ln-elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

		$this->add_control(
			'slides_per_view_type',
			[
				'label' => esc_html__( 'Preview Type', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => esc_html__( 'Default', 'ln-elementor' ),
					'auto' => esc_html__( 'Auto', 'ln-elementor' ),
				],
			]
		);

		$this->add_responsive_control(
			'slides_per_view',
			[
				'label' => esc_html__( 'Slides Per View', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::NUMBER,
				'devices' => [ 'desktop', 'laptop', 'tablet' ],
				'min' => 1,
				'max' => 100,
				'step' => 1,
				'default' => 10,
                'laptop_default' => 8,  
                'tablet_default' => 6,
                'condition' => [
                    'slides_per_view_type' => 'default'
                ]
			]
		);

		$this->add_control(
			'slides_per_view_for_mobile',
			[
				'label' => esc_html__( 'Slides Per View (Mobile)', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => '1',
				'options' => [
					'1' => esc_html__( '1', 'ln-elementor' ),
					'2' => esc_html__( '2', 'ln-elementor' ),
					'3' => esc_html__( '3', 'ln-elementor' ),
					'auto' => esc_html__( 'Auto', 'ln-elementor' ),
				],
			]
		);
        
		$this->add_responsive_control(
			'slides_mobile_width',
			[
				'label' => esc_html__( 'Width', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ '%', 'px', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 1,
					],
                ],
                'default' => [
                    'size' => 100,
                    'unit' => '%',
                ],
                'laptop_default' => [
                    'size' => 100,
                    'unit' => '%',
                ],
                'tablet_default' => [
                    'size' => 100,
                    'unit' => '%',
                ],
                'mobile_default' => [
                    'size' => 300,
                    'unit' => 'px',
                ],
                'render_type' => 'ui',
                'hide_on_devices' => [ 'desktop', 'laptop', 'tablet' ],
				'selectors' => [
					'{{WRAPPER}} .ln-gallery-swiper .swiper-slide' => 'width: {{SIZE}}{{UNIT}}; ',
                ],
			]
		);

		$this->add_control(
			'slides_loop',
			[
				'label' => esc_html__( 'Loop', 'ln-elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Loop', 'ln-elementor' ),
				'label_off' => esc_html__( 'Off', 'ln-elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);

		$this->add_control(
			'slides_autoplay',
			[
				'label' => esc_html__( 'Autoplay', 'ln-elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Play', 'ln-elementor' ),
				'label_off' => esc_html__( 'Off', 'ln-elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);

		$this->add_control(
			'slides_autoplay_timeout',
			[
				'label' => esc_html__( 'Autoplay Timeout', 'ln-elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'max' => 100000,
				'step' => 1,
				'default' => 7000,
			]
		);

		$this->add_control(
			'slides_speed',
			[
				'label' => esc_html__( 'Speed', 'ln-elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'max' => 100000,
				'step' => 1,
				'default' => 500,
			]
		);

		$this->add_control(
			'slides_infinite_scroll',
			[
				'label' => esc_html__( 'Infinite Scroll', 'ln-elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'On', 'ln-elementor' ),
				'label_off' => esc_html__( 'Off', 'ln-elementor' ),
				'return_value' => 'yes',
                'condition' => [
                    'slides_per_view_type' => 'auto',
                ],
			]
		);

        $this->end_controls_section();

        $this->start_controls_section(
            'section_style_general',
            [
                'label' => __( 'General', 'ln-elementor' ),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );


        $this->end_controls_section();
    }
    
    protected function render() {
        $settings = $this->get_settings_for_display();
        $wrapper_id = $this->get_id();
        $gallery = $settings['gallery'];
        $speed = $settings['slides_speed'];
        $loop = $settings['slides_loop'];
        $autoplay = $settings['slides_autoplay'];
        $autoplay_timeout = $settings['slides_autoplay_timeout'];
        $preview_type = $settings['slides_per_view_type'];
        if( $preview_type == 'auto' ) {
            $slides_per_view_desktop = 'auto';
            $slides_per_view_laptop  = 'auto';
            $slides_per_view_tablet  = 'auto';
        }
        else {
            $slides_per_view_desktop = !empty( $settings['slides_per_view'] ) ? (int) $settings['slides_per_view'] : 4;
            $slides_per_view_laptop  = !empty( $settings['slides_per_view_laptop'] ) ? (int) $settings['slides_per_view_laptop'] : 3;
            $slides_per_view_tablet  = !empty( $settings['slides_per_view_tablet'] ) ? (int) $settings['slides_per_view_tablet'] : 2;
        }

        $slides_per_view_mobile  = !empty( $settings['slides_per_view_for_mobile'] ) ? $settings['slides_per_view_for_mobile'] : 'auto';
        $space_between = !empty( $settings['slider_space_between'] ) ? (int) $settings['slider_space_between'] : 25;
        $space_between_laptop = !empty( $settings['slider_space_between_laptop'] ) ? (int) $settings['slider_space_between_laptop'] : 20;
        $space_between_tablet = !empty( $settings['slider_space_between_tablet'] ) ? (int) $settings['slider_space_between_tablet'] : 15;
        $space_between_mobile = !empty( $settings['slider_space_between_mobile'] ) ? (int) $settings['slider_space_between_mobile'] : 15;
    ?>
        <div class="ln-gallery">
            <?php
            if( 'yes' === $settings['slides_infinite_scroll'] ) {
                echo '<style type="text/css">#swiper-'.$wrapper_id.'.swiper .swiper-wrapper { transition-timing-function: linear !important; }</style>';
            }
            ?>
            <div class="ln-gallery-swiper swiper" id="swiper-<?= $wrapper_id;?>"
                    data-slides-desktop="<?= $slides_per_view_desktop;?>" 
                    data-slides-laptop="<?= $slides_per_view_laptop;?>" 
                    data-slides-tablet="<?= $slides_per_view_tablet;?>" 
                    data-slides-mobile="<?= $slides_per_view_mobile;?>"
                    data-space-between="<?= $space_between;?>"
                    data-space-between-laptop="<?= $space_between_laptop;?>"
                    data-space-between-tablet="<?= $space_between_tablet;?>"
                    data-space-between-mobile="<?= $space_between_mobile;?>"
                    data-loop="<?= $loop;?>"
                    data-autoplay="<?= $autoplay;?>"
                    data-autoplay-timeout="<?= $autoplay_timeout;?>"
                    data-speed="<?= $speed;?>"
                >
                <?php
                if( !empty($gallery) ) {
                ?>
                <div class="swiper-wrapper">
                    <?php 
                    foreach( $gallery as $img ) {
                     echo '<div class="swiper-slide"><img src="'.$img['url'].'" class="img-fluid w-100"/></div>';
                    }
                    ?>
                </div>
                <?php
                }
                ?>
            </div>
        </div>
    <?php
    }
}   