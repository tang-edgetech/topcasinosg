<?php
/**
 * Astra Child Theme functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Astra Child
 * @since 1.0.0
 */

/**
 * Define Constants
 */
define( 'CHILD_THEME_ASTRA_CHILD_VERSION', '1.0.'.time() );
define( 'THEME_ASSETS_IMAGE_DIRECTORY', get_stylesheet_directory_uri() . '/images' );
define( 'TEMP_MEDIA_IMAGE', THEME_ASSETS_IMAGE_DIRECTORY . '/images/img-media-temp.png' );

/**
 * Enqueue styles
 */
function child_enqueue_styles() {

	wp_enqueue_style( 'astra-child-theme-css', get_stylesheet_directory_uri() . '/style.css', array('astra-theme-css'), CHILD_THEME_ASTRA_CHILD_VERSION, 'all' );
	wp_enqueue_style( 'bootstrap', get_stylesheet_directory_uri() . '/css/bootstrap.min.css', array(), '5.3.8', 'all' );
	wp_enqueue_style( 'swiper-css', 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css', array(), '12.0.0', 'all' );
	wp_enqueue_style( 'custom', get_stylesheet_directory_uri() . '/css/custom.css', array(), CHILD_THEME_ASTRA_CHILD_VERSION, 'all' );

    if ( ! is_admin() ) {
        wp_deregister_script('jquery');
        wp_enqueue_script('jquery', get_stylesheet_directory_uri() . '/js/jquery-3.7.1.min.js', array(), '3.7.1', true);
    }
	wp_enqueue_script('bootstrap', get_stylesheet_directory_uri() . '/js/bootstrap.bundle.min.js', array(), '5.3.8', true);
	wp_enqueue_script('swiper-js', 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js', array(), '12.0.0', true);
	wp_enqueue_script('scripts', get_stylesheet_directory_uri() . '/js/scripts.js', array(), CHILD_THEME_ASTRA_CHILD_VERSION, true);
	if( is_singular('brand') ) {
		wp_enqueue_script('brand', get_stylesheet_directory_uri() . '/js/single-brand.js', array(), CHILD_THEME_ASTRA_CHILD_VERSION, true);
		wp_localize_script('brand', 'single_brand', array(
			'ajax_url' => admin_url('admin-ajax.php'),
			'brand_nonce' => wp_create_nonce('single_brand_nonce'),
			'current_id' => get_the_ID()
		));
	}
}
add_action( 'wp_enqueue_scripts', 'child_enqueue_styles', 15 );

add_action('wp', function() {
	global $elementor_mode;
	$elementor = \Elementor\Plugin::$instance;

	if ( $elementor->editor->is_edit_mode() || $elementor->preview->is_preview_mode() ) {
		$elementor_mode = 'editor-preview';
	}
	else {
		$elementor_mode = 'front-end';
	}
});

add_filter('acf/prepare_field/name=region', function($field) {

    $field['choices'] = [];
	$field['choices']['myr|MY'] = 'MY (Malaysia)';
	$field['choices']['sgd|SG'] = 'SG (Singapore)';
	$field['choices']['thb|TH'] = 'TH (Thailand)';
	$field['choices']['idr|ID'] = 'ID (Indonesia)';
	$field['choices']['vnd|VN'] = 'VN (Vietnam)';
	$field['choices']['php|PH'] = 'PH (Philippines)';
	$field['choices']['khr|KH'] = 'KH (Cambodia)';
	$field['choices']['mmk|MM'] = 'MM (Myanmar)';
	$field['choices']['lak|LA'] = 'LA (Laos)';
	$field['choices']['brl|BN'] = 'BN (Brunei (uses Brunei Dollar BND))';
	$field['choices']['usd|TL'] = 'TL (Timor-Leste (uses USD))';

    return $field;  
});

add_filter('acf/prepare_field/name=games', function($field) {
	$args = array(
		'post_type' => 'game',
		'post_status' => 'publish',
		'posts_per_page' => -1,
		'order'	=> 'asc',
		'orderby' => 'menu_order'
	);
	$games = new WP_Query($args);

    $field['choices'] = [];

	while( $games->have_posts() ) {
		$games->the_post();
		$id = get_the_ID();
		$title = get_the_title();
        $slug  = get_post_field( 'post_name', $id );
		$field['choices'][$slug] = $title;
	}
	WP_RESET_POSTDATA();

    return $field;  
});

function footer_error_log_modal() {
?>
<div class="error-dialog" id="error-dialog">
	<div class="error-dialog-inner">
		<div class="error-dialog-body">
			<button type="button" class="btn-close" data-dismiss="close"></button>
			<div class="error-dialog-print"></div>
		</div>
	</div>
</div>
<?php
}
add_action('wp_footer', 'footer_error_log_modal');

function single_brand_retrieving_data() {
	$response = array();
	if ( !wp_verify_nonce( $_POST['nonce'], 'single_brand_nonce' ) ) {
		$response['status'] = 2000;
		$response['message'] = 'Invalid security nonce!';
		echo json_encode($response, true);
		wp_die();
	}
	$target = $_POST['target'];
	$post_type = 'brand';
	$post_id = $_POST['post_id'];
	$post_id = (int)$post_id;

	$post = get_post($post_id);
	$start = isset($_POST['offset']) ? intval($_POST['offset']) : 6;
	$limit = 6;
	if( $target == 'providers'|| $target == 'licenses' ) {
		$limit = 5;
	}
	$end = $start + $limit;

	if( $post ) {
		$html = '';
		if( $target == 'payment-methods' ) {
			$payment_methods = get_field('introduction_payment_methods', $post_id);
			$total = count($payment_methods);
			if( $total > 6 ) {
				for ( $i = $start; $i < $end && $i < $total; $i++ ) {
					ob_start();
					$value = $payment_methods[$i];
        			get_template_part('template-parts/grid-element', 'payment-methods', ['value' => $value]);
					$html .= ob_get_clean();
				}
			}
		}
		else if( $target == 'providers' ) {
			$providers = get_field('additional_game_providers', $post_id);
			$total = count($providers);
			$response['providers'] = $total;
			if( $total > 10 ) {
				for ( $i = $start; $i < $end && $i < $total; $i++ ) {
					ob_start();
					$value = $providers[$i];
        			get_template_part('template-parts/grid-element', 'game-providers', ['value' => $value]);
					$html .= ob_get_clean();
				}
			}
		}
		else if( $target == 'licenses' ) {
			$licenses = get_field('additional_licensing', $post_id);
			$total = count($licenses);
			$response['abc'] = $total;
			if( $total > 5 ) {
				for ( $i = $start; $i < $end && $i < $total; $i++ ) {
					ob_start();
					$value = $licenses[$i];
        			get_template_part('template-parts/grid-element', 'licensing', ['value' => $value]);
					$html .= ob_get_clean();
				}
			}
		}
		else {
			$regions = get_field('introduction_region', $post_id);
			$total = count($regions);
			if( $total > 6 ) {
				for ( $i = $start; $i < $end && $i < $total; $i++ ) {
					ob_start();
					$value = $regions[$i]['value'];
        			get_template_part('template-parts/grid-element', 'flags', ['value' => $value]);
					$html .= ob_get_clean();
				}
			}
		}
		$response['html'] = $html;
		

		$response['status'] = 1000;
		$response['message'] = 'Successful!';
		$response['end'] = $end >= $total;
	}
	else {
		$response['status'] = 2000;
		$response['message'] = 'This brand is not exist!';
	}

	echo json_encode($response, true);
	wp_die();
}
add_action('wp_ajax_single_brand_retrieving_data', 'single_brand_retrieving_data');
add_action('wp_ajax_nopriv_single_brand_retrieving_data', 'single_brand_retrieving_data');

function generate_news_listing($post_type, $ppp) {
	if( $post_type == 'news' ) {
		$args_news = array(
			'post_type' => $post_type,
			'post_status' => 'publish',
			'posts_per_page' => $ppp,
			'order' => 'desc',
			'orderby' => 'date',
		);
		$news = new \WP_Query($args_news);
		ob_start();
		if( $news->have_posts() ) {
			while( $news->have_posts() ) {
				$news->the_post();
				$news_id = get_the_ID();
				$news_title = get_the_title();
				$news_permalink = get_permalink();
				$thumbnail = '';
				if( has_post_thumbnail() ) {
					$thumbnail = '<img src="'.get_the_post_thumbnail_url().'" class="img-fluid w-100"/>';
				}
				$news_desc = '';
				if( has_excerpt() ) {
					$news_desc = wp_trim_words(get_the_excerpt(), 20, '');
				}
				else {
					$news_desc = wp_trim_words(trim(strip_shortcodes(get_the_content())), 20, '');
				}
			?>
				<div class="swiper-slide">
					<div class="swiper-slide-inner">
						<div class="slide-upper">
							<div class="slide-thumbnail"><a href="<?= $news_permalink;?>" class="slide-link"><?= $thumbnail;?></a></div>
						</div>
						<div class="slide-lower">
							<h4 class="slide-title"><?= $news_title;?></h4>
							<div class="slide-desc"><?= $news_desc;?></div>
							<div class="slide-cta"><a href="<?= $news_permalink;?>" class="btn btn-outline">More Info</a></div>
						</div>
					</div>
				</div>
			<?php
			}
			WP_RESET_POSTDATA();
		}
		return ob_get_clean();
	}
	else if( $post_type == 'dummy' ) {
		ob_start();
		for( $i=0; $i<=$ppp; $i++ ) {
			$thumbnail = '';
			?>
			<div class="swiper-slide">
				<div class="swiper-slide-inner">
					<div class="slide-upper">
						<div class="slide-thumbnail"><a href="javascript:void(0)" class="slide-link"><?= $thumbnail;?></a></div>
					</div>
					<div class="slide-lower">
						<h4 class="slide-title">I’m the title, title am I</h4>
						<div class="slide-desc">How to Pick the Right Casino: Learn how to identify safe sites.</div>
						<div class="slide-cta"><a href="javascript:void(0)" class="btn btn-outline">More Info</a></div>
					</div>
				</div>
			</div>
		<?php
		}
		return ob_get_clean();
	}
}

function generate_rtp_slider_content($rtp, $region, $type, $ppp) {
	if( $rtp !== 'rtp' ) {
		return;
	}

	$thumbnail_top_high = THEME_ASSETS_IMAGE_DIRECTORY . 'thumbnail-top-high-rtp.jpg';
	$thumbnail_table_game = THEME_ASSETS_IMAGE_DIRECTORY . 'thumbnail-table-game-with-high-rtp.jpg';
	// region on hold
	if( $type == 'consistent' ) {
		$thumbnail = $thumbnail_table_game;
		$dummy_title = 'Blackjack Classic';
		$rate = '99.50%';
	}
	else if( $type == 'top' ) { // type also onhold
		$thumbnail = $thumbnail_top_high;
		$dummy_title = '';
		$rate = '98.00%';
	}
	
	if (str_starts_with($value, 'dummy-')) {
		$filter = str_replace('dummy-', '', $value);

		ob_start();
		for( $i=0; $i<=$ppp; $i++ ) {
			$thumbnail = '';
		?>
			<div class="swiper-slide">
				<div class="swiper-slide-inner">
					<div class="slide-upper">
						<div class="slide-thumbnail"><a href="javascript:void(0)" class="slide-link"><?= $thumbnail;?></a></div>
					</div>
					<div class="slide-lower">
						<div class="slide-content">
							<h4 class="slide-title">I’m the title, title am I</h4>
							<div class="slide-desc">How to Pick the Right Casino: Learn how to identify safe sites.</div>
							<div class="slide-rate"><?= $rate;?></div>
						</div>
						<div class="slide-cta"><a href="javascript:void(0)" class="btn btn-outline">Visit Site</a></div>
					</div>
				</div>
			</div>
		<?php
		}
		return ob_get_clean();
	}
	else {

	}
}

add_shortcode('topcasinosg_table_data', 'topcasinosg_table_data');
function topcasinosg_table_data($atts) {
	$atts = shortcode_atts( array(
		'type' => 'dummy'
	), $atts, 'topcasinosg_table_data' );
	ob_start();
	?>
	<div class="table-wrapper table-<?= $atts['type'];?>">
		<table class="table">
		<?php
		if( 'kamen-rider' == $atts['type'] ) {
		?>
			<thead>
				<tr>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td></td>
				</tr>
			</tbody>
		<?php
		}
		else if( 'bonus-claim' == $atts['type'] ) {
		?>
			<thead>
				<tr>
					<td valign="middle" class="data-col text-center data-brand">Brand</td>
					<td class="data-col text-center data-bonus-details">Options</td>
					<td class="data-col text-center data-buttons"></td>
				</tr>
			</thead>
			<tbody>
			<?php for($i=0; $i<=4; $i++) { ?>
				<tr>
					<td valign="middle" class="data-col text-center data-brand">
						<div class="data-col-inner"><img src="<?= home_url();?>/wp-content/uploads/2025/11/brand-logo-eu9.png"/><p>EU9</p></div>
					</td>
					<td valign="middle" class="data-col text-center data-bonus-details">
						150 FREE SPINS on Total Overdrive, Aztec Magic Megaways
					</td>
					<td valign="middle" class="data-col text-center data-buttons">
						<div class="btn-wrapper"><a href="javascript:void(0);" class="btn btn-solid bold">Claim Here</a></div>
					</td>
				</tr>
			<?php } ?>
			</tbody>
		<?php
		}
		else {
		?>
			<thead>
				<tr>
					<td valign="middle" class="data-col text-center data-brand">Brand</td>
					<td class="data-col text-center data-options">Options</td>
					<td class="data-col text-center data-processing-time">Processing Time</td>
				</tr>
			</thead>
			<tbody>
			<?php for($i=0; $i<=4; $i++) { ?>
				<tr>
					<td valign="middle" class="data-col text-center data-brand">
						<div class="data-col-inner"><img src="<?= home_url();?>/wp-content/uploads/2025/11/brand-logo-eu9.png"/><p>EU9</p></div>
					</td>
					<td valign="middle" class="data-col text-center data-options">
						<div class="data-col-inner">
							<div class="brand-demo">
							<?php for($j=0;$j<=4;$j++) { ?>
								<div class="brand-item"><img src="<?= home_url();?>/wp-content/uploads/2025/11/img-placeholder.png" class="img-fluid w-100"/></div>
							<?php } ?>
							</div>
						</div>
					</td>
					<td valign="middle" class="data-col text-center data-processing-time">
						<div class="data-col-inner"><p>Instant to 1 Hour</p></div>
					</td>
				</tr>
			<?php } ?>
			</tbody>
		<?php
		}
		?>
		</table>
	</div>
	<?php
	return ob_get_clean();
}