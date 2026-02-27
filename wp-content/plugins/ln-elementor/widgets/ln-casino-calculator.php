<?php
namespace LN_Elementor\Widgets;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class LN_Casino_Calculator extends Widget_Base {

	public function get_name() {
		return 'ln-casino-calculator';
	}

	public function get_title() {
		return __( 'Casino Calculator', 'ln-elementor' );
	}

	public function get_icon() {
		return 'eicon-divider';
	}

    public function get_keywords() {
        return [ 'casino', 'calculator', 'ln' ];
    }

	public function get_categories() {
		return [ 'ln-widgets' ];
	}

	protected function register_controls() {
        $this->start_controls_section(
            'calculator_general',
            [
                'label' => esc_html__( 'General', 'ln-elementor' ),
            ]
        );

		$this->add_control(
			'calculator_header_title',
			[
				'label' => esc_html__( 'Header Title', 'ln-elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => esc_html__( 'Default title', 'ln-elementor' ),
				'placeholder' => esc_html__( 'Type your title here', 'ln-elementor' ),
			]
		);

		$this->add_control(
			'calculator_header_title_tag',
			[
				'label' => esc_html__( 'Header Title Tag', 'ln-elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'h1',
				'options' => [
					'h1' => esc_html__( 'H1', 'ln-elementor' ),
					'h2' => esc_html__( 'H2', 'ln-elementor' ),
					'h3'  => esc_html__( 'H3', 'ln-elementor' ),
					'h4' => esc_html__( 'H4', 'ln-elementor' ),
					'h5' => esc_html__( 'H5', 'ln-elementor' ),
					'h6' => esc_html__( 'H6', 'ln-elementor' ),
					'span' => esc_html__( 'Span', 'ln-elementor' ),
					'p' => esc_html__( 'Paragraph', 'ln-elementor' ),
				],
			]
		);

		$this->add_control(
			'calculator_header_description',
			[
				'label' => esc_html__( 'Header Description', 'ln-elementor' ),
				'type' => Controls_Manager::WYSIWYG,
				'default' => esc_html__( 'Default description', 'ln-elementor' ),
				'placeholder' => esc_html__( 'Type your description here', 'ln-elementor' ),
			]
		);

        $this->end_controls_section();
        
        $this->start_controls_section(
            'calculator_typography',
            [
                'label' => esc_html__( 'Typography', 'ln-elementor' ),
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );
        
		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
		        'label' => esc_html__( 'Title Typography', 'ln-elementor' ),
				'name' => 'calculator_typography_heading',
				'selector' => '{{WRAPPER}} .casino-calculator .calc-header-title',
			]
		);

		$this->add_control(
			'calculator_heading_color',
			[
				'label' => esc_html__( 'Title Color', 'ln-elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .casino-calculator .calc-header-title' => 'color: {{VALUE}}',
				],
			]
		);
        
		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
		        'label' => esc_html__( 'Description Typography', 'ln-elementor' ),
				'name' => 'calculator_typography_description',
				'selector' => '{{WRAPPER}} .casino-calculator .calc-header-desc',
			]
		);

		$this->add_control(
			'calculator_description_color',
			[
				'label' => esc_html__( 'Description Color', 'ln-elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .casino-calculator .calc-header-desc' => 'color: {{VALUE}}',
				],
			]
		);
            
        $this->end_controls_section();

        $this->start_controls_section(
            'calculator_style',
            [
                'label' => esc_html__( 'Style', 'ln-elementor' ),
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );

		$this->add_control(
			'calculator_frame_base',
			[
				'label' => esc_html__( 'Base Color', 'ln-elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .casino-calculator .ln-row:not(.calculator-header) .ln-col' => 'background-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'calculator_frame_inner',
			[
				'label' => esc_html__( 'Box Color', 'ln-elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .casino-calculator .calculator-frame' => 'background-color: {{VALUE}}',
				],
			]
		);

        $this->add_control(
            'calculator_label_color',
            [
                'label' => esc_html__( 'Label Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'default' => '',
                'selectors' => [
                    '{{WRAPPER}} .calculator-box label' => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            'calculator_input_background_color',
            [
                'label' => esc_html__( 'Input Background Color', 'ln-elementor' ),
                'type' => Controls_Manager::COLOR,
                'default' => '',
                'selectors' => [
                    '{{WRAPPER}} .casino-calculator .calculator-frame .input-control' => 'background-color: {{VALUE}}',
                ],
            ]
        );

		$this->add_responsive_control(
			'calculator_max_width',
			[
				'label' => esc_html__( 'Max Width', 'ln-elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'devices' => [ 'desktop', 'laptop', 'tablet' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 5,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 465,
				],
				'laptop_default' => [
					'unit' => 'px',
					'size' => 465,
				],
				'tablet_default' => [
					'unit' => 'px',
					'size' => 465,
				],
				'selectors' => [
					'{{WRAPPER}} .casino-calculator' => 'max-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

        $this->end_controls_section();
    }

	protected function render() {
		$settings = $this->get_settings_for_display();
        $widget_id = $this->get_id();
        $header_title = $settings['calculator_header_title'];
        $header_title_tag = $settings['calculator_header_title_tag'];
        $header_description = $settings['calculator_header_description'];
		?>
        <form class="casino-calculator" id="casino-calculator-<?= $widget_id;?>" action="" method="post">
            <?php
            if( !empty($header_title) || !empty($header_description) ) {
            ?>
            <div class="ln-row calculator-header">
                <div class="ln-col">
                <?php
                if( !empty($header_title) ) {
                    echo '<'.$header_title_tag.' class="calc-header-title">'.$header_title.'</'.$header_title_tag.'>';
                }
                if( !empty($header_description) ) {
                    echo '<div class="calc-header-desc">'.$header_description.'</div>';
                }
                ?>
                </div>
            </div>
            <?php
            }
            ?>
            <div class="ln-row calculator-base">
                <div class="ln-col">
                    <div class="ln-inner-row">
                        <div class="calculator-frame">
                            <div class="calculator-box box-with-prefix">
                                <label>Deposit Amount ($)</label>
                                <div class="input-group">
                                    <span class="input-prefix">$</span>
                                    <input type="number" min="0" class="input-control" name="_deposit_amount" value="0"/>
                                </div>
                            </div>
                            <div class="calculator-box box-with-suffix">
                                <label>Bonus Percentage (%)</label>
                                <div class="input-group">
                                    <input type="number" min="0" class="input-control" name="_bonus_percentage" value="0"/>
                                    <span class="input-suffix">%</span>
                                </div>
                            </div>
                            <div class="calculator-box box-with-prefix">
                                <label>Maximum Bonus Amount ($)</label>
                                <div class="input-group">
                                    <span class="input-prefix">$</span>
                                    <input type="number" min="0" class="input-control" name="_max_bonus_amount" value="0"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ln-inner-row">
                        <div class="calculator-frame">
                            <div class="calculator-box">
                                <label>Wagering Requirement (x)</label>
                                <div class="input-group">
                                    <input type="number" min="0" class="input-control" name="_wagering_requirement" value="0"/>
                                </div>
                            </div>
                            <div class="calculator-box box-with-suffix">
                                <label>Game Contribution Rate (%)</label>
                                <div class="input-group">
                                    <input type="number" min="0" class="input-control" name="_game_contribution_rate" value="0"/>
                                    <span class="input-suffix">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ln-inner-row">
                        <div class="btn-wrapper">
                            <button type="submit" class="btn btn-calculator btn-calculate" id="btn-calculate"><span>Calculate</span></button>
                            <button type="reset" class="btn btn-calculator btn-clear" id="btn-clear"><span>Clear</span></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="ln-row calculator-result">
                <div class="ln-col">
                    <div class="ln-inner-row">
                        <div class="calculator-frame">
                            <h4 class="calculate-title">Result</h4>
                            <div class="table-wrapper calculator-result-table">
                                <div class="table-inner">
                                    <table class="table calculator-result-print">
                                        <thead>
                                            <tr>
                                                <td class="text-center">Description</td>
                                                <td class="text-center">Amount</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colspan="2">No calculation yet</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
		<?php
	}
}
