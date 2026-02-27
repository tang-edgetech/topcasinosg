<?php
namespace LN_Elementor\Widgets;

use Elementor\Widget_Base;
use Elementor\Icons_Manager;
use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Border;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class LN_Horizontal_Iconbox extends Widget_Base {

    public function get_name() {
        return 'ln-horizontal-iconbox';
    }

    public function get_title() {
        return __( 'LN Horizontal Iconbox', 'ln-elementor' );
    }

    public function get_icon() {
        return 'eicon-image-box';
    }

    public function get_keywords() {
        return [ 'icon', 'horizontal', 'ln' ];
    }

	public function get_categories() {
		return [ 'ln-widgets' ];
	}

    protected function register_controls() {
        $this->start_controls_section(
            'section_content',
            [
                'label' => __( 'Icon Box', 'ln-elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

		$this->add_control(
			'iconbox_icon',
			[
				'label' => esc_html__( 'Image', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::MEDIA,
				'default' => [
					'url' => \Elementor\Utils::get_placeholder_image_src(),
				],
			]
		);

		$this->add_control(
			'iconbox_heading',
			[
				'label' => esc_html__( 'Title', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => esc_html__( 'Default title', 'ln-elementor' ),
				'placeholder' => esc_html__( 'Type your title here', 'ln-elementor' ),
			]
		);

		$this->add_control(
			'iconbox_heading_tag',
			[
				'label' => esc_html__( 'Heading Tag', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => 'h1',
				'options' => [
					'h1' => esc_html__( 'H1', 'ln-elementor' ),
					'h2' => esc_html__( 'H2', 'ln-elementor' ),
					'h3'  => esc_html__( 'H3', 'ln-elementor' ),
					'h4' => esc_html__( 'H4', 'ln-elementor' ),
					'h5' => esc_html__( 'H5', 'ln-elementor' ),
					'h6' => esc_html__( 'H6', 'ln-elementor' ),
					'p' => esc_html__( 'Paragraph', 'ln-elementor' ),
					'span' => esc_html__( 'Span', 'ln-elementor' ),
				],
			]
		);
        
		$this->add_control(
			'iconbox_description',
			[
				'label' => esc_html__( 'Description', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::WYSIWYG,
				'default' => esc_html__( 'Default description', 'ln-elementor' ),
				'placeholder' => esc_html__( 'Type your description here', 'ln-elementor' ),
			]
		);

		$this->add_control(
			'iconbox_cta_link',
			[
				'label' => esc_html__( 'Link', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::URL,
				'options' => [ 'url', 'is_external', 'nofollow' ],
				'default' => [
					'url' => '',
					'is_external' => true,
					'nofollow' => true,
				],
				'label_block' => true,
			]
		);
        
		$this->add_control(
			'iconbox_cta_icon',
			[
				'label' => esc_html__( 'Link Icon', 'ln-elementor' ),
				'type' => Controls_Manager::ICONS,
				'default' => [
					'value' => 'fas fa-caret-right',
					'library' => 'fa-solid',
				],
				'recommended' => [
					'fa-solid' => [
						'circle',
						'dot-circle',
						'square-full',
					],
					'fa-regular' => [
						'circle',
						'dot-circle',
						'square-full',
					],
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

		$this->add_responsive_control(
			'iconbox_container_width',
			[
				'type' => \Elementor\Controls_Manager::SLIDER,
				'label' => esc_html__( 'Iconbox Width', 'ln-elementor' ),
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 1900,
						'step' => 1,
                    ]
                ],
				'default' => [
					'size' => 275,
					'unit' => 'px',
				],
				'laptop_default' => [
					'size' => 275,
					'unit' => 'px',
				],
				'tablet_default' => [
					'size' => 275,
					'unit' => 'px',
				],
				'mobile_default' => [
					'size' => 275,
					'unit' => 'px',
				],
				'selectors' => [
					'{{WRAPPER}}' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'iconbox_icon_position',
			[
				'label' => esc_html__( 'Icon Position', 'ln-elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => esc_html__( 'Left', 'ln-elementor' ),
						'icon' => 'eicon-h-align-left',
					],
					'right' => [
						'title' => esc_html__( 'Right', 'ln-elementor' ),
						'icon' => 'eicon-h-align-right',
					],
				],
				'default' => 'left',
				'toggle' => true,
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'prefix_class' => 'iconbox-align-%s',
			]
		);

		$this->add_responsive_control(
			'iconbox_icon_valign',
			[
				'label' => esc_html__( 'Icon Alignment', 'ln-elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'top' => [
						'title' => esc_html__( 'Top', 'ln-elementor' ),
						'icon' => 'eicon-v-align-top',
					],
					'middle' => [
						'title' => esc_html__( 'Middle', 'ln-elementor' ),
						'icon' => 'eicon-v-align-middle',
					],
					'bottom' => [
						'title' => esc_html__( 'Bottom', 'ln-elementor' ),
						'icon' => 'eicon-v-align-bottom',
					],
				],
				'default' => 'top',
				'toggle' => true,
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'prefix_class' => 'iconbox-valign-%s',
                'condition' => [
                    'iconbox_icon_position!' => '',
                ]
			]
		);

		$this->add_responsive_control(
			'iconbox_header_body_spacing',
			[
				'type' => \Elementor\Controls_Manager::SLIDER,
				'label' => esc_html__( 'Spacing', 'ln-elementor' ),
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'default' => [
					'size' => 0.5,
					'unit' => 'rem',
				],
				'laptop_default' => [
					'size' => 0.5,
					'unit' => 'rem',
				],
				'tablet_default' => [
					'size' => 0.5,
					'unit' => 'rem',
				],
				'mobile_default' => [
					'size' => 0.5,
					'unit' => 'rem',
				],
				'selectors' => [
					'{{WRAPPER}} .ln-iconbox .ln-iconbox-inner' => 'gap: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Border::get_type(),
			[
				'name' => 'iconbox_border',
				'selector' => '{{WRAPPER}} .ln-iconbox .ln-iconbox-inner',
			]
		);

		$this->add_control(
			'iconbox_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'selectors' => [
					'{{WRAPPER}} .ln-iconbox .ln-iconbox-inner' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

        $this->end_controls_section();

        $this->start_controls_section(
            'section_style_general_icon',
            [
                'label' => __( 'Icon', 'ln-elementor' ),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

		$this->add_control(
			'iconbox_icon_padding',
			[
				'label' => esc_html__( 'Icon Padding', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'default' => [
					'top' => 1,
					'right' => 1,
					'bottom' => 1,
					'left' => 1,
					'unit' => 'rem',
					'isLinked' => true,
				],
				'selectors' => [
					'{{WRAPPER}} .ln-iconbox .ln-iconbox-icon' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'iconbox_icon_background',
			[
				'label' => esc_html__( 'Text Color', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .ln-iconbox .ln-iconbox-icon' => 'background-color: {{VALUE}}',
				],
			]
		);
        
		$this->add_responsive_control(
			'iconbox_icon_width',
			[
				'type' => \Elementor\Controls_Manager::SLIDER,
				'label' => esc_html__( 'Width', 'ln-elementor' ),
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
                'default' => [
                    'unit' => 'px',
                ],
				'selectors' => [
					'{{WRAPPER}} .ln-iconbox .ln-iconbox-icon img' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);
        
		$this->add_responsive_control(
			'iconbox_icon_height',
			[
				'type' => \Elementor\Controls_Manager::SLIDER,
				'label' => esc_html__( 'Height', 'ln-elementor' ),
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
                'default' => [
                    'unit' => 'px',
                ],
				'selectors' => [
					'{{WRAPPER}} .ln-iconbox .ln-iconbox-icon img' => 'height: {{SIZE}}{{UNIT}};',
				],
			]
		);

        $this->end_controls_section();

        $this->start_controls_section(
            'section_style_general_body',
            [
                'label' => __( 'Body', 'ln-elementor' ),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

		$this->add_control(
			'iconbox_body_background',
			[
				'label' => esc_html__( 'Background Color', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .ln-iconbox .ln-iconbox-body' => 'background-color: {{VALUE}}',
				],
			]
		);

        $this->add_group_control(
			Group_Control_Typography::get_type(),
            [
                'name' => 'iconbox_heading_typography',
                'label' => __( 'Heading Typography', 'ln-elementor' ),
                'selector' => '{{WRAPPER}} .ln-iconbox .ln-iconbox-body .ln-iconbox-content .ln-iconbox-title',
            ]
        );

		$this->add_control(
			'iconbox_heading_typography_color',
			[
				'label' => esc_html__( 'Heading Color', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
                'default' => '#1A1E71',
				'selectors' => [
					'{{WRAPPER}} .ln-iconbox .ln-iconbox-body .ln-iconbox-content .ln-iconbox-title' => 'color: {{VALUE}}',
				],
			]
		);

        $this->add_group_control(
			Group_Control_Typography::get_type(),
            [
                'name' => 'iconbox_paragraph_typography',
                'label' => __( 'Description Typography', 'ln-elementor' ),
                'selector' => '{{WRAPPER}} .ln-iconbox .ln-iconbox-body .ln-iconbox-content',
            ]
        );

		$this->add_control(
			'iconbox_paragraph_typography_color',
			[
				'label' => esc_html__( 'Background Color', 'ln-elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
                'default' => '#5A65B4',
				'selectors' => [
					'{{WRAPPER}} .ln-iconbox .ln-iconbox-body .ln-iconbox-content' => 'color: {{VALUE}}',
				],
			]
		);

        $this->end_controls_section();
    }
    
    protected function render() {
        $settings = $this->get_settings_for_display();
        $icon = $settings['iconbox_icon'];
        $heading = $settings['iconbox_heading'];
        $heading_tag = $settings['iconbox_heading_tag'];
        $desc = $settings['iconbox_description'];
        $link = $settings['iconbox_cta_link'];
        $link_icon = $settings['iconbox_cta_icon'];
    ?>
        <div class="ln-iconbox iconbox-horizontal">
            <div class="ln-iconbox-item">
                <div class="ln-iconbox-inner">
                    <div class="ln-iconbox-icon">
			            <?php if( !empty($icon['url']) ) { echo '<img src="'.$icon['url'].'" class="img-fluid w-100">'; } ?>
                    </div>
                    <div class="ln-iconbox-body">
                        <div class="ln-iconbox-content">
                            <?= '<'.$heading_tag.' class="ln-iconbox-title">'.$heading.'</'.$heading_tag.'>';?>
                            <?php
                            if( !empty($desc) ) {
                                echo '<div class="ln-iconbox-desc">'.$desc.'</div>';
                            }
                            ?>
                        </div>
                        <div class="ln-iconbox-cta">
			                <?php
                            if( !empty($link['url']) ) {
                                echo '<a href="'.$link['url'].'" class="btn btn-cta">'; 
                            ?>
                                <?php Icons_Manager::render_icon( $link_icon, [ 'aria-hidden' => 'true' ] ); ?>
                            <?php
                                echo '</a>';
                            }
                            ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <?php
    }
}