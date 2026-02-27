<?php
/**
 * Template name: Testing
 * 
 * 
 */

get_header(); ?>

<?php if ( astra_page_layout() === 'left-sidebar' ) { ?>

	<?php get_sidebar(); ?>

<?php } ?>

	<div id="primary" <?php astra_primary_class(); ?>>

		<?php astra_primary_content_top(); ?>

		<?php 
		// astra_content_page_loop(); 
        $options = [];
        $value = '';
        $informative = get_field( 'informative_types', 'option' );

        if( !empty($informative) ) {
            foreach( $informative as $row ) {
                $label = $row['label'];
                $type = $row['type'];
                if( $type == 'custom' ) {
                    $value = $row['custom_key'];
                }
                else {
                    if( $type == 'object' ) {
                        $value = $row['object_key']->post_name;
                    }
                }
                $options[$value] = $label;
            }
        }
        var_dump($options);
		?>

		<?php astra_primary_content_bottom(); ?>

	</div><!-- #primary -->

<?php if ( astra_page_layout() === 'right-sidebar' ) { ?>

	<?php get_sidebar(); ?>

<?php } ?>

<?php get_footer(); ?>