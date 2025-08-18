<?php
/**
 * 
 * Template name: TCS - Page Template Full Width (Sidebar)
 * 
 */

get_header();
?>
<main id="main" class="site-main site-full-width">
	<div class="main-container">
        <div class="content-area primary" id="primary">
            <?php
            while( have_posts() ) {
                the_post();
                the_content();
            }
            ?>
        </div>
        <?php
        get_sidebar();
        ?>
    </div>
</main>
<?php
get_footer();
?>