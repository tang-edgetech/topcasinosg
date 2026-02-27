<?php
namespace LN_Elementor\Widgets;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Border;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class LN_Information_Swiper extends Widget_Base {

    public function get_name() {
        return 'ln-information-swiper';
    }

    public function get_title() {
        return __( 'LN Information Swiper', 'ln-elementor' );
    }

    public function get_icon() {
        return 'eicon-slider-push';
    }

    public function get_keywords() {
        return [ 'line', 'break', 'ln' ];
    }

	public function get_categories() {
		return [ 'ln-widgets' ];
	}

    protected function register_controls() {

        $this->start_controls_section(
            'section_content',
            [
                'label' => __( 'Settings', 'ln-elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

		$this->add_control(
			'section_heading_tag',
			[
				'label' => esc_html__( 'Heading', 'ln-elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'h1',
				'options' => [
					'h1' => esc_html__( 'H1', 'ln-elementor' ),
					'h2' => esc_html__( 'H2', 'ln-elementor' ),
					'h3'  => esc_html__( 'H3', 'ln-elementor' ),
					'h4' => esc_html__( 'H4', 'ln-elementor' ),
					'h5' => esc_html__( 'H5', 'ln-elementor' ),
					'h6' => esc_html__( 'H6', 'ln-elementor' ),
					'p' => esc_html__( 'p', 'ln-elementor' ),
					'span' => esc_html__( 'span', 'ln-elementor' ),
				]
			]
		);

        $this->add_control(
            'section_heading',
            [
                'label' => __( 'Content Type', 'ln-elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => esc_html__( 'Default title', 'ln-elementor' ),
				'placeholder' => esc_html__( 'Type your title here', 'ln-elementor' ),
            ]
        );

		$this->add_control(
			'section_body',
			[
				'label' => esc_html__( 'Description', 'ln-elementor' ),
				'type' => Controls_Manager::WYSIWYG,
				'default' => esc_html__( 'Default description', 'ln-elementor' ),
				'placeholder' => esc_html__( 'Type your description here', 'ln-elementor' ),
			]
		);

		$this->add_control(
			'see_all',
			[
				'label' => esc_html__( 'Link', 'ln-elementor' ),
				'type' => Controls_Manager::URL,
				'options' => [ 'url', 'is_external', 'nofollow' ],
				'default' => [
					'url' => '',
					'is_external' => false,
					'nofollow' => true,
				],
				'label_block' => true,
			]
		);

        $this->add_control(
            'content_type',
            [
                'label' => __( 'Content Type', 'ln-elementor' ),
                'type' => Controls_Manager::SELECT,
                'options' => [
					'blacklisted-providers' => esc_html__( 'Blacklisted', 'ln-elementor' ),
					'news' => esc_html__( 'News', 'ln-elementor' ),
					'dummy' => esc_html__( 'Dummy Contents', 'ln-elementor' ),
					'rtp' => esc_html__( 'RTP', 'ln-elementor' ),
                ],
                'default' => 'default',
                'label_block' => true,
            ]
        );

        $this->add_control(
            'rtp_region',
            [
                'label' => __( 'Country Selection', 'ln-elementor' ),
                'type' => Controls_Manager::SELECT,
                'options' => [
					'th' => esc_html__( 'TH', 'ln-elementor' ),
					'my' => esc_html__( 'MY', 'ln-elementor' ),
					'sg' => esc_html__( 'SG', 'ln-elementor' ),
					'id' => esc_html__( 'ID', 'ln-elementor' ),
					'vn' => esc_html__( 'VN', 'ln-elementor' ),
                ],
                'default' => 'th',
                'label_block' => true,
                'condition' => [
                    'content_type' => 'rtp',
                ]
            ]
        );

        $this->add_control(
            'rtp_content',
            [
                'label' => __( 'Content', 'ln-elementor' ),
                'type' => Controls_Manager::SELECT,
                'options' => [
					'top' => esc_html__( 'Top High RTP', 'ln-elementor' ),
					'consistent' => esc_html__( 'Consistent High RTP', 'ln-elementor' ),
					'dummy' => esc_html__( 'Dummy', 'ln-elementor' ),
                ],
                'default' => 'top',
                'label_block' => true,
                'condition' => [
                    'content_type' => 'rtp',
                ]
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'section_slider',
            [
                'label' => __( 'Slider', 'ln-elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

		$this->add_responsive_control(
			'slides_per_view',
			[
				'type' => Controls_Manager::SELECT,
				'label' => esc_html__( 'Slides Per View', 'ln-elementor' ),
				'devices' => [ 'desktop', 'laptop', 'tablet' ],
                'default' => 'auto',
                'options' => [
                    'auto' => esc_html__( 'Auto', 'ln-elementor' ),
                    '1' => esc_html__( '1', 'ln-elementor' ),
                    '2' => esc_html__( '2', 'ln-elementor' ),
                    '3' => esc_html__( '3', 'ln-elementor' ),
                    '4' => esc_html__( '4', 'ln-elementor' ),
                    '5' => esc_html__( '5', 'ln-elementor' ),
                    '6' => esc_html__( '6', 'ln-elementor' ),
                    '7' => esc_html__( '7', 'ln-elementor' ),
                    '8' => esc_html__( '8', 'ln-elementor' ),
                    '9' => esc_html__( '9', 'ln-elementor' ),
                    '10' => esc_html__( '10', 'ln-elementor' ),
                ]
			]
		);

		$this->add_responsive_control(
			'slides_width',
			[
				'label' => esc_html__( 'Slide Width', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ '%', 'px', 'em', 'rem', 'custom' ],
				'devices' => [ 'desktop', 'laptop', 'tablet' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 1,
					]
				],
				'default' => [
					'unit' => '%',
					'size' => 100,
				],
                'condition' => [
                    'slides_per_view' => 'auto',
                ],
				'selectors' => [
					'{{WRAPPER}} .swiper-slide' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'slides_width_mobile',
			[
				'type' => Controls_Manager::NUMBER,
				'label' => esc_html__( 'Slide Width (Mobile)', 'ln-elementor' ),
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
                'min' => 100,
                'max' => 1000,
                'step' => 1,
                'default' => [
                    'size' => 250,
                    'unit' => 'px',
                ],
                'selectors' => [
                    '{{WRAPPER}} .swiper-slide' => 'width: {{SIZE}}px',
                ]
			]
		);

		$this->add_control(
			'slider_loop',
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
			'slider_autoplay',
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
			'slider_autoplay_timeout',
			[
				'label' => esc_html__( 'Autoplay Timeout', 'ln-elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'max' => 100000,
				'step' => 1,
				'default' => 7000,
			]
		);

        $this->add_responsive_control(
            'space_between',
            [
                'label' => __( 'Space Between', 'ln-elementor' ),
                'type'  => \Elementor\Controls_Manager::NUMBER,
                'min'   => 0,
                'max'   => 200,
                'step'  => 1,
                'default' => 20,
            ]
        );

		$this->add_control(
			'slider_max_items',
			[
				'type' => Controls_Manager::NUMBER,
				'label' => esc_html__( 'Maximum Items', 'ln-elementor' ),
				'min' => 1,
				'max' => 30,
				'step' => 1,
				'default' => 12,
			]
		);

        $this->end_controls_section();
        
        $this->start_controls_section(
            'section_style',
            [
                'label' => __( 'Typography', 'ln-elementor' ),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name' => 'title_typography',
                'label' => __( 'Title Typography', 'ln-elementor' ),
                'selector' => '{{WRAPPER}} .ln-informative-swiper .ln-col.col-title .ln-section-title',
            ]
        );

        $this->add_control(
            'title_color',
            [
                'label' => __( 'Title Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'default' => '#1A1E71',
                'selectors' => [
                    '{{WRAPPER}} .ln-informative-swiper .ln-col.col-title .ln-section-title' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_group_control(
			Group_Control_Typography::get_type(),
            [
                'name' => 'body_typography',
                'label' => __( 'Body Typography', 'ln-elementor' ),
                'selector' => '{{WRAPPER}} .ln-informative-swiper .swiper-body',
            ]
        );

        $this->add_control(
            'body_color',
            [
                'label' => __( 'Body Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'default' => '#5A65B4',
                'selectors' => [
                    '{{WRAPPER}} .ln-informative-swiper .ln-section-desc, {{WRAPPER}} .ln-informative-swiper .ln-section-desc *' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'section_style_button',
            [
                'label' => __( 'Buttons', 'ln-elementor' ),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->start_controls_tabs(
            'section_style_button_tabs'
        );

        $this->start_controls_tab(
            'style_button_tab',
            [
                'label' => esc_html__( 'Normal', 'ln-elementor' ),
            ]
        );

        $this->add_control(
            'button_background_color',
            [
                'label' => __( 'Background Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .ln-informative-swiper .ln-informative-nav, {{WRAPPER}} .ln-col.col-navigator .btn-outline' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'button_border_color',
            [
                'label' => __( 'Border Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .ln-informative-swiper .ln-informative-nav, {{WRAPPER}} .ln-col.col-navigator .btn-outline' => 'border-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'button_icon_color',
            [
                'label' => __( 'Text Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .ln-informative-swiper .ln-informative-nav i, {{WRAPPER}} .ln-informative-swiper .ln-col.col-navigator .btn-outline' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->end_controls_tab();

        $this->start_controls_tab(
            'style_button_tab_hover',
            [
                'label' => esc_html__( 'Normal', 'ln-elementor' ),
            ]
        );

        $this->add_control(
            'button_background_color_hover',
            [
                'label' => __( 'Background Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .ln-informative-swiper .ln-informative-nav:hover, {{WRAPPER}} .ln-col.col-navigator .btn-outline:hover' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'button_border_color_hover',
            [
                'label' => __( 'Border Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .ln-informative-swiper .ln-informative-nav:hover, {{WRAPPER}} .ln-col.col-navigator .btn-outline:hover' => 'border-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'button_icon_color_hover',
            [
                'label' => __( 'Text Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .ln-informative-swiper .ln-informative-nav:hover i, {{WRAPPER}} .ln-informative-swiper .ln-col.col-navigator .btn-outline:hover' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->end_controls_tab();

        $this->end_controls_tabs();

        $this->end_controls_section();

        $this->start_controls_section(
            'section_container_style',
            [
                'label' => __( 'Container', 'ln-elementor' ),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'border',
				'selector' => '{{WRAPPER}} .swiper-slide .swiper-slide-inner',
			]
		);

		$this->add_responsive_control(
			'slide_content_spacing',
			[
				'type' => \Elementor\Controls_Manager::SLIDER,
				'label' => esc_html__( 'Spacing', 'ln-elementor' ),
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'default' => [
					'size' => 15,
					'unit' => 'px',
				],
				'laptop_default' => [
					'size' => 15,
					'unit' => 'px',
				],
				'tablet_default' => [
					'size' => 15,
					'unit' => 'px',
				],
				'mobile_default' => [
					'size' => 15,
					'unit' => 'px',
				],
				'selectors' => [
					'{{WRAPPER}} .swiper-slide .slide-lower' => 'gap: {{SIZE}}{{UNIT}};',
				],
			]
		);

        $this->add_group_control(
			Group_Control_Typography::get_type(),
            [
                'name' => 'slider_title_typography',
                'label' => __( 'Title Typography', 'ln-elementor' ),
                'selector' => '{{WRAPPER}} .swiper-slide .slide-lower .slide-title',
            ]
        );

        $this->add_control(
            'slider_title_color',
            [
                'label' => __( 'Slider Title Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'default' => '#1A1E71',
                'selectors' => [
                    '{{WRAPPER}} .swiper-slide .slide-lower .slide-title' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_group_control(
			Group_Control_Typography::get_type(),
            [
                'name' => 'slider_body_typography',
                'label' => __( 'Text Typography', 'ln-elementor' ),
                'selector' => '{{WRAPPER}} .swiper-slide .slide-lower',
            ]
        );

        $this->add_control(
            'slider_desc_color',
            [
                'label' => __( 'Slider Text Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'default' => '#5A65B4',
                'selectors' => [
                    '{{WRAPPER}} .swiper-slide .slide-lower' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'section_image_style',
            [
                'label' => __( 'Image', 'ln-elementor' ),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

		$this->add_responsive_control(
			'slide_image_width',
			[
				'type' => \Elementor\Controls_Manager::SLIDER,
				'label' => esc_html__( 'Width', 'ln-elementor' ),
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range' => [
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'selectors' => [
					'{{WRAPPER}} .swiper-slide .slide-thumbnail' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'slide_image_max_width',
			[
				'type' => \Elementor\Controls_Manager::SLIDER,
				'label' => esc_html__( 'Max Width', 'ln-elementor' ),
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range' => [
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'selectors' => [
					'{{WRAPPER}} .swiper-slide .slide-thumbnail' => 'max-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'slide_image_height',
			[
				'type' => \Elementor\Controls_Manager::SLIDER,
				'label' => esc_html__( 'Height', 'ln-elementor' ),
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
					],
				],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'selectors' => [
					'{{WRAPPER}} .swiper-slide .slide-thumbnail' => 'height: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'slide_image_border',
				'selector' => '{{WRAPPER}} .swiper-slide .slide-thumbnail',
			]
		);

		$this->add_control(
			'slide_image_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} .swiper-slide .slide-thumbnail' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

        $this->end_controls_section();
        
        $this->start_controls_section(
            'section_style_cosmetic_1',
            [
                'label' => __( 'Upper Content', 'ln-elementor' ),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'upper_background_color',
            [
                'label' => __( 'Background Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .swiper-slide-inner .slide-upper' => 'background-color: {{VALUE}};',
                ],
            ]
        );

		$this->add_responsive_control(
			'upper_padding',
			[
				'type' => Controls_Manager::DIMENSIONS,
				'label' => esc_html__( 'Padding', 'ln-elementor' ),
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'default' => [
					'top' => 20,
					'right' => 20,
					'bottom' => 20,
					'left' => 20,
					'unit' => 'px',
					'isLinked' => false,
				],
				'selectors' => [
					'{{WRAPPER}} .swiper-slide-inner .slide-upper' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

        $this->end_controls_section();
        
        $this->start_controls_section(
            'section_style_cosmetic_2',
            [
                'label' => __( 'Lower Content', 'ln-elementor' ),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'lower_background_color',
            [
                'label' => __( 'Background Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .swiper-slide-inner .slide-lower' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'lower_text_color',
            [
                'label' => __( 'Text Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .sub-list-item .sub-text' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'lower_icon_color',
            [
                'label' => __( 'Icon Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .sub-list-item .sub-icon' => 'color: {{VALUE}};',
                ],
            ]
        );

		$this->add_responsive_control(
			'lower_padding',
			[
				'type' => Controls_Manager::DIMENSIONS,
				'label' => esc_html__( 'Padding', 'ln-elementor' ),
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'default' => [
					'top' => 20,
					'right' => 20,
					'bottom' => 20,
					'left' => 20,
					'unit' => 'px',
					'isLinked' => false,
				],
				'selectors' => [
					'{{WRAPPER}} .swiper-slide-inner .slide-lower' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        $wrapper_id = $this->get_id();
        $content_type = $settings['content_type'] ?? '';
        $content_region = $settings['content_region'] ?? '';
        $rtp_content = $settings['rtp_content'] ?? '';
        $heading = $settings['section_heading'];
        $heading_tag = $settings['section_heading_tag'];
        $body = $settings['section_body'];
        $see_all = $settings['see_all'];
        $posts_per_page = $settings['slider_max_items'];
        
        $loop = $settings['slider_loop'];
        $autoplay = $settings['slider_autoplay'];
        $autoplay_timeout = $settings['slider_autoplay_timeout'];
        $slides_per_view_desktop = !empty( $settings['slides_per_view'] ) ? $settings['slides_per_view'] : 'auto';
        $slides_per_view_laptop  = !empty( $settings['slides_per_view_laptop'] ) ? $settings['slides_per_view_laptop'] : 'auto';
        $slides_per_view_tablet  = !empty( $settings['slides_per_view_tablet'] ) ? $settings['slides_per_view_tablet'] : 'auto';
        $slides_per_view_mobile  = 'auto';
        $space_between = !empty($settings['space_between']) ? $settings['space_between'] : 20;
        $space_between_laptop = !empty($settings['space_between_laptop']) ? $settings['space_between_laptop'] : 20;
        $space_between_tablet = !empty($settings['space_between_tablet']) ? $settings['space_between_tablet'] : 20;
        $space_between_mobile = !empty($settings['space_between_mobile']) ? $settings['space_between_mobile'] : 20;
        $html = '';
        if( $content_type == 'blacklisted-providers' ) {
            $items = get_field('providers', 'option');
            if( !empty($items) ) {
                foreach( $items as $item ) {
                    $name = $item['name'];
                    $image = $item['image'];
                    $rating = $item['rating'];
                    $points = $item['points'];
                    $maxRating = 10;
                    $totalStars = 5;
                    $stars = ceil(($rating / $maxRating) * $totalStars);
                    $stars_html = '';
                    if( empty($image['url']) ) {
                        $thumb_img = home_url() . '/wp-content/uploads/2025/11/img-media-temp.png';
                    }
                    else {
                        $thumb_img = $image['url'];
                    }
                    for ($i = 1; $i <= $totalStars; $i++) {
                        $stars_html .= '<img src="'.home_url().'/wp-content/uploads/2025/11/';
                        if ($i <= floor($stars)) {
                            $stars_html .= 'icon-star-shine.png';
                        }else {
                            $stars_html .= 'icon-star-default.png';
                        }
                        $stars_html .= '" alt="star" />';
                    }
                    $html .= '<div class="swiper-slide" data-size="'.$settings['slides_per_view_mobile'].'">
                        <div class="swiper-slide-inner">
                            <div class="slide-upper">';
                                $html .= '<div class="slide-thumb"><img src="'.$thumb_img.'" class="img-fluid w-100"/></div>';
                                $html .= '<div class="slide-rating"><span class="rate">'.$rating.'</span><sub>/10</sub></div>';
                                $html .= '<div class="slide-stars">'.$stars_html.'</div>';
                                $html .= '</div>
                            <div class="slide-lower">';
                        if( !empty($points) ) {
                            $html .= '<div class="sub-listing">';
                            $icon = '';
                            foreach( $points as $point ) {
                                if ( 'dashicons' === $point['icon']['type'] ) {
                                    $icon = '<div class="dashicons '.$point['icon']['value'].'"></div>';
                                }
                                if ( 'media_library' === $point['icon']['type'] ) {
                                    $attachment_id = $point['icon']['value']['id'];
                                    $size = 'full';

                                    $image_html = wp_get_attachment_image( $attachment_id, $size );
                                    $icon = $image_html;
                                }
                                if ( 'url' === $point['icon']['type'] ) {
                                    $icon = '<img src="'.$point['icon']['value'].'"/>';
                                }

                                $html .= '<div class="sub-list-item" data-label="'.$point['icon']['type'].'">
                                    <div class="sub-icon">'.$icon.'</div>
                                    <div class="sub-text">'.$point['content'].'</div>
                                </div>';
                            }
                            $html .= "</div>";
                        }
                    $html .= "</div>
                        </div>
                    </div>";
                }
            }
        }   
        else if( $content_type == 'news' || $content_type == 'dummy' ) {
            $html = generate_news_listing($content_type, $posts_per_page);
        }
        else if( $content_type == "rtp" && ( $rtp_content == 'top' || $rtp_content == 'consistency' ) ) {
            $html = generate_rtp_slider_content($content_type, $content_region, $rtp_content, $posts_per_page);
        }
    ?>
    <div class="ln-informative-swiper">
        <div class="ln-informative-header">
            <div class="ln-inner-row">
                <div class="ln-col col-title">
                    <?php
                    if( !empty($heading) ) {
                        echo '<'.$heading_tag.' class="ln-section-title">'.$heading.'</'.$heading_tag.'>';
                    } 
                    if( !empty($body) ) {
                        echo '<div class="ln-section-desc">'.$body.'</div>';
                    }
                    ?>
                </div>
                <div class="ln-col col-navigator">
                    <?php if( !empty($see_all['url']) ) { echo '<a href="'.$see_all['url'].'" class="btn btn-outline"><span>See All</span></a>'; } ?>
                    <div class="ln-informative-navbar">
                        <button type="button" class="btn-outline ln-informative-nav ln-informative-nav-prev" id="nav-prev-swiper-<?= $wrapper_id;?>"><i class="fa fa-caret-left"></i></button>
                        <button type="button" class="btn-outline ln-informative-nav ln-informative-nav-next" id="nav-next-swiper-<?= $wrapper_id;?>"><i class="fa fa-caret-right"></i></button>
                    </div>
                </div>
            </div>
        </div>
        <div class="ln-informative-body">
            <div class="ln-inner-row">
                <div class="ln-col ">
                    <div class="swiper informative-swiper<?= ' swiper-'.$content_type;?>"  id="swiper-<?= $wrapper_id;?>"
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
                        ppp="<?= $posts_per_page;?>"
                    >
                        <div class="swiper-wrapper">
                        <?= $html;?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
    }
}
