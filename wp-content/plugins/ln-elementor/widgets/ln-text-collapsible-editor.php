<?php
namespace LN_Elementor\Widgets;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class LN_Text_Collapsible_Editor extends Widget_Base {

	public function get_name() {
		return 'text-collapsible-editor';
	}

	public function get_title() {
		return __( 'Text Collapsible Editor', 'ln-elementor' );
	}

	public function get_icon() {
		return 'eicon-editor-list-ul';
	}

    public function get_keywords() {
        return [ 'text', 'collapse', 'ln' ];
    }

	public function get_categories() {
		return [ 'ln-widgets' ];
	}

	protected function register_controls() {

		$this->start_controls_section(
			'section_content',
			[
				'label' => __( 'Content', 'ln-elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'content_text',
			[
				'label' => __( 'Content', 'ln-elementor' ),
				'type' => Controls_Manager::WYSIWYG,
				'default' => __( 'This is your collapsible content.', 'ln-elementor' ),
			]
		);
		
		$this->add_control(
			'line_limit',
			[
				'label' => __( 'Collapsed Line Limit', 'ln-elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 1,
				'max' => 5,
				'default' => 3,
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_orientation',
			[
				'label' => esc_html__( 'Orientation', 'ln-elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'flex_direction',
			[
				'label' => esc_html__( 'Flex Direction', 'ln-elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'row' => [
						'title' => esc_html__( 'Horizontal', 'ln-elementor' ),
						'icon' => 'eicon-h-align-right',
					],
					'column' => [
						'title' => esc_html__( 'Vertical', 'ln-elementor' ),
						'icon' => 'eicon-v-align-bottom',
					],
				],
				'default' => 'row',
				'toggle' => true,
				'selectors' => [
					'{{WRAPPER}} .ln-collapsible-editor' => 'display: flex; flex-direction: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'align_items',
			[
				'label' => esc_html__( 'Align Items', 'ln-elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'flex-start' => [
						'title' => esc_html__( 'Start', 'ln-elementor' ),
						'icon' => 'eicon-align-start-v',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'ln-elementor' ),
						'icon' => 'eicon-align-center-v',
					],
					'flex-end' => [
						'title' => esc_html__( 'End', 'ln-elementor' ),
						'icon' => 'eicon-align-end-v',
					],
				],
				'default' => 'flex-start',
				'selectors' => [
					'{{WRAPPER}} .ln-collapsible-editor' => 'align-items: {{VALUE}};',
				],
				'condition' => [
					'flex_direction!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'content_gap',
			[
				'type' => Controls_Manager::SLIDER,
				'label' => esc_html__( 'Size', 'ln-elementor' ),
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'default' => [
					'size' => 0.625,
					'unit' => 'rem',
				],
				'selectors' => [
					'{{WRAPPER}} .ln-collapsible-toggle .collapsible-text-button::before, {{WRAPPER}} .ln-collapsible-toggle .collapsible-text-button::after' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);
		
		$this->add_control(
			'background_color',
			[
				'label' => esc_html__( 'Background Color', 'ln-elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .ln-collapsible-editor' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_responsive_control(
			'padding',
			[
				'label' => esc_html__( 'Padding', 'ln-elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'default' => [
					'top' => 1.25,
					'right' => 1.25,
					'bottom' => 1.25,
					'left' => 1.25,
					'unit' => 'rem',
					'isLinked' => true,
				],
				'selectors' => [
					'{{WRAPPER}} .ln-collapsible-editor' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_text',
			[
				'label' => esc_html__( 'Content', 'ln-elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'text_typography',
				'label' => esc_html__( 'Typography', 'ln-elementor' ),
				'selector' => '{{WRAPPER}} .ln-collapsible-content',
			]
		);

		$this->add_control(
			'text_color',
			[
				'label' => esc_html__( 'Color', 'ln-elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .ln-collapsible-content' => 'color: {{VALUE}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_icon',
			[
				'label' => esc_html__( 'Icon', 'ln-elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'icon_size',
			[
				'type' => Controls_Manager::SLIDER,
				'label' => esc_html__( 'Size', 'ln-elementor' ),
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'default' => [
					'size' => 1,
					'unit' => 'rem',
				],
				'laptop_default' => [
					'size' => 1,
					'unit' => 'rem',
				],
				'tablet_default' => [
					'size' => 1,
					'unit' => 'rem',
				],
				'mobile_default' => [
					'size' => 1,
					'unit' => 'rem',
				],
				'selectors' => [
					'{{WRAPPER}} .ln-collapsible-toggle .collapsible-text-button' => 'width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}}',
					'{{WRAPPER}} .ln-collapsible-toggle .collapsible-text-button::before, {{WRAPPER}} .ln-collapsible-toggle .collapsible-text-button::after' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'icon_position',
			[
				'type' => Controls_Manager::SLIDER,
				'label' => esc_html__( 'Icon Position', 'ln-elementor' ),
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'devices' => [ 'desktop', 'laptop', 'tablet', 'mobile' ],
				'default' => [
					'size' => 0,
					'unit' => 'px',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		?>
    	<div class="ln-collapsible-editor">
			<div class="ln-collapsible-content">
				<?php echo $settings['content_text']; ?>
			</div>
			<div class="ln-collapsible-toggle">
				<button type="button" class="collapsible-text-button"><span class="d-none" aria-hidden="true">Toggle</span></button>
			</div>
		</div>
		<?php
	}
}
