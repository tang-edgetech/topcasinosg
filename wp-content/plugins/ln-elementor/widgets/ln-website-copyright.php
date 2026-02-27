<?php
namespace LN_Elementor\Widgets;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class LN_Website_Copyright extends Widget_Base {

    public function get_name() {
        return 'ln_website_copyright';
    }

    public function get_title() {
        return __( 'Website Copyright', 'ln-elementor' );
    }

    public function get_icon() {
        return 'eicon-text';
    }

    public function get_categories() {
        return [ 'ln-widgets' ]; // or your custom category later
    }

    public function get_keywords() {
        return [ 'copyright', 'footer', 'text' ];
    }

    protected function register_controls() {
        // --- CONTENT TAB ---
        $this->start_controls_section(
            'content_section',
            [
                'label' => __( 'Content', 'ln-elementor' ),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

		$this->add_control(
			'copyright_prefix',
			[
				'label' => esc_html__( 'Border Style', 'ln-elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '© ',
				'options' => [
					'© ' => esc_html__( 'Default', 'ln-elementor' ),
					'Copyright © ' => esc_html__( 'Full Text', 'ln-elementor' ),
				],
			]
		);

		$this->add_control(
			'show_site_title',
			[
				'label' => esc_html__( 'Show Title', 'ln-elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Show', 'ln-elementor' ),
				'label_off' => esc_html__( 'Hide', 'ln-elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);

        $this->add_control(
            'content_text',
            [
                'label' => __( 'Copyright Text', 'ln-elementor' ),
                'type' => Controls_Manager::TEXTAREA,
                'default' => '© ' . date('Y') . ' All Rights Reserved.',
                'placeholder' => __( 'Enter copyright text', 'ln-elementor' ),
                'condition' => [
                    'show_site_title!' => 'yes'
                ],
            ]
        );

		$this->add_control(
			'copyright_suffix',
			[
				'label' => esc_html__( 'Show All Rights Reserved?', 'ln-elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Show', 'ln-elementor' ),
				'label_off' => esc_html__( 'Hide', 'ln-elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);

        $this->end_controls_section();

        // --- STYLE TAB ---
        $this->start_controls_section(
            'style_section',
            [
                'label' => __( 'Style', 'ln-elementor' ),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'text_color',
            [
                'label' => __( 'Text Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .ln-copyright' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Typography::get_type(),
            [
                'name' => 'typography',
                'selector' => '{{WRAPPER}} .ln-copyright',
            ]
        );

        $this->add_responsive_control(
            'text_align',
            [
                'label' => __( 'Alignment', 'ln-elementor' ),
                'type' => Controls_Manager::CHOOSE,
                'options' => [
                    'left' => [
                        'title' => __( 'Left', 'ln-elementor' ),
                        'icon' => 'eicon-text-align-left',
                    ],
                    'center' => [
                        'title' => __( 'Center', 'ln-elementor' ),
                        'icon' => 'eicon-text-align-center',
                    ],
                    'right' => [
                        'title' => __( 'Right', 'ln-elementor' ),
                        'icon' => 'eicon-text-align-right',
                    ],
                ],
                'default' => 'center',
                'selectors' => [
                    '{{WRAPPER}} .ln-copyright' => 'text-align: {{VALUE}};',
                ],
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        $site_title = get_bloginfo( 'name' );
        $prefix = $settings['copyright_prefix'];
        if( $settings['copyright_suffix'] == 'yes' ) {
            $suffix = 'All Right Reserved.';
        }
        else {
            $suffix = '';
        }
        $content = $settings['content_text'];
        $replacements = [
            '{year}'      => date('Y'),
            '{site_name}' => get_bloginfo('name'),
            '{site_url}'  => home_url(),
        ];
        $content = strtr( $content, $replacements );
        ?>
        <div class="ln-copyright">
            <?php 
            echo $prefix;
            if( $settings['show_site_title'] == 'yes' ) {
                echo date('Y') . ' ' . $site_title . '.';
            }
            else {
                echo wp_kses_post( $content ); 
            }
            echo $suffix;
            ?>
        </div>
        <?php
    }
}
