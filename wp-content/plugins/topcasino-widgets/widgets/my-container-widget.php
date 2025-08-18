<?php
class MyContainer_Widget extends \Elementor\Widget_Container {
    public function get_name() {
        return 'topcasinosg-container';
    }

    public function get_title() {
        return __( 'TopCasino Container', 'topcasinosg_widgets' );
    }

    public function get_icon() {
        return 'eicon-container';
    }

    public function get_categories() {
        return [ 'basic' ];
    }

    protected function render() {
        echo '<div class="topcasino-container">';
        $this->render_children(); // allow inner widgets
        echo '</div>';
    }
}
