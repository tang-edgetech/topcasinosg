<?php
namespace LN_Elementor\Widgets;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class LN_Line_Break extends Widget_Base {

	public function get_name() {
		return 'text-line-break';
	}

	public function get_title() {
		return __( 'Line Break', 'ln-elementor' );
	}

	public function get_icon() {
		return 'eicon-divider';
	}

    public function get_keywords() {
        return [ 'line', 'break', 'ln' ];
    }

	public function get_categories() {
		return [ 'ln-widgets' ];
	}

	protected function register_controls() {
        $this->start_controls_section(
            'section_line_break_general',
            [
                'label' => esc_html__( 'General', 'ln-elementor' ),
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'line_break_style',
            [
                'label' => esc_html__( 'Size', 'ln-elementor' ),
                'type' => Controls_Manager::SELECT,
                'default' => 'default',
                'options' => [
                    'default' => esc_html__( 'Full Width', 'ln-elementor' ),
                    'full-screen'  => esc_html__( 'Full Screen', 'ln-elementor' ),
                    'custom' => esc_html__( 'Custom', 'ln-elementor' ),
                ],
            ]
        );

		$this->add_responsive_control(
			'line_alignment',
			[
				'type' => Controls_Manager::CHOOSE,
				'label' => esc_html__( 'Alignment', 'ln-elementor' ),
				'options' => [
					'left' => [
						'title' => esc_html__( 'Left', 'ln-elementor' ),
						'icon' => 'eicon-text-align-left',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'ln-elementor' ),
						'icon' => 'eicon-text-align-center',
					],
					'right' => [
						'title' => esc_html__( 'Right', 'ln-elementor' ),
						'icon' => 'eicon-text-align-right',
					],
				],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'prefix_class' => 'content-align-%s',
				'selectors' => [
					'{{WRAPPER}} .ln-line-break.custom' => 'text-align: {{VALUE}};',
				],
                'condition' => [
                    'line_break_style' => 'custom'
                ]
			]
		);

		$this->add_responsive_control(
			'line_width',
			[
				'type' => Controls_Manager::SLIDER,
				'label' => esc_html__( 'Width', 'ln-elementor' ),
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'default' => [
					'size' => 100,
					'unit' => '%',
                ],
				'selectors' => [
					'{{WRAPPER}} .ln-line-break.custom span' => 'width: {{SIZE}}{{UNIT}};',
				],
                'condition' => [
                    'line_break_style' => 'custom'
                ]
			]
		);
        
		$this->add_responsive_control(
			'line_thickness',
			[
				'type' => Controls_Manager::SLIDER,
				'label' => esc_html__( 'Thickness', 'ln-elementor' ),
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'default' => [
					'size' => 2,
					'unit' => 'px',
                ],
				'selectors' => [
					'{{WRAPPER}} .ln-line-break' => 'height: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .ln-line-break span' => 'height: {{SIZE}}{{UNIT}};',
				],
			]
		);

        $this->add_control(
            'line_color',
            [
                'label' => esc_html__( 'Border Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'default' => '',
                'selectors' => [
                    '{{WRAPPER}} .ln-line-break span' => 'background-color: {{VALUE}}',
                ],
            ]
        );

        $this->end_controls_section();
    }

	protected function render() {
		$settings = $this->get_settings_for_display();
        $style = $settings['line_break_style'];
		?>
    	<div class="ln-line-break <?= $style;?>"><span></span></div>
		<?php
	}
}
