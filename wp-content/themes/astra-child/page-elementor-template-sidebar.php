<?php
/**
 * Template name: Elementor Template (With Sidebar)
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
		get_template_part( 'template-parts/elementor-template', 'full-width' );
		?>

		<?php astra_primary_content_bottom(); ?>

	</div><!-- #primary -->


	<?php get_sidebar(); ?>

<?php get_footer(); ?>