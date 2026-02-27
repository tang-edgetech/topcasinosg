<?php
$brand_title = get_the_title();
$brand_id = get_the_ID();
$brand_thumbnail = get_the_post_thumbnail_url();
$introduction = get_field('introduction');
$brand_rating = $introduction['rating'];
$brand_safe_index = $introduction['safe_index'];
$brand_site_link = $introduction['site_link'];
$brand_region = $introduction['region'];
$brand_payments = $introduction['payment_methods'];
if ($brand_rating >= 0 && $brand_rating < 4) {
    $main_class = 'high';
    $brand_risk = 'High Risk';
    $brand_risk_icon = '<img src="' . THEME_ASSETS_IMAGE_DIRECTORY . '/icons/icon-risk-status-high.png" class="img-fluid w-100"/>';
} elseif ($brand_rating >= 4 && $brand_rating < 8 ) {
    $main_class = 'moderate';
    $brand_risk = 'Moderate Risk';
    $brand_risk_icon = '<img src="' . THEME_ASSETS_IMAGE_DIRECTORY . '/icons/icon-risk-status-moderate.png" class="img-fluid w-100"/>';
} elseif ( $brand_rating >= 8) {
    $main_class = 'low';
    $brand_risk = 'Low Risk';
    $brand_risk_icon = '<img src="' . THEME_ASSETS_IMAGE_DIRECTORY . '/icons/icon-risk-status-low.png" class="img-fluid w-100"/>';
}
$text_rating = 'text-'.$main_class;
$bg_rating = 'bg-'.$main_class;
$brand_currencies = $introduction['currency'];
$brand_rtp = $introduction['rtp'];
$brand_payout_speed = $introduction['payout_speed'];
$brand_payout_speed_prefix = $introduction['payout_speed_prefix'];
$payout_speed = '';
if( !empty($brand_payout_speed) ) {
    if( $brand_payout_speed_prefix == 'less' ) {
        $payout_speed = '<i class="fas fa-less-than-equal"></i>';
    }
    else {
        $payout_speed = '<i class="fas fa-greater-than-equal"></i>';
    }
    $payout_speed .= $brand_payout_speed;
}
?>
<main class="main main-brand brand-<?= $main_class.'-risk';?>">
    <div class="ln-row">
        <div class="brand-sidebar">
            <div class="brand-sidebar-inner">
                <div class="brand-thumbnail">
                <?php
                if( has_post_thumbnail() ) {
                    echo '<img src="'.$brand_thumbnail.'" class="img-fluid w-100"/>';
                }
                ?>
                </div>
                <div class="brand-rating">
                    <div class="grid grid-brand-rating">
                        <div class="grid-item grid-item-rating">
                            <div class="grid-item-inner">
                                <div class="brand-label label-title">Rating</div>
                                <div class="brand-value"><?= $brand_rating;?><sub>/10</sub></div>
                            </div>
                        </div>
                        <div class="grid-item grid-item-index">
                            <div class="grid-item-inner">
                                <div class="brand-label label-title">Safe Index</div>
                                <div class="brand-value"><?= $brand_safe_index;?><sub>/100</sub></div>
                            </div>
                        </div>
                        <div class="grid-item grid-item-risk">
                            <div class="grid-item-inner">
                                <div class="brand-label label-title">Status</div>
                                <div class="brand-value"><?= $brand_risk;?></div>
                            </div>
                            <div class="icon risk-icon"><?= $brand_risk_icon;?></div>
                        </div>
                        <div class="grid-item grid-item-cta">
                                <div class="grid-item-inner">
                                <div class="brand-label label-title"></div>
                            </div>
                            <div class="brand-value"><a href="javascript:void(0)" class="btn btn-solid"><span>Visit Site</span></a></div>
                        </div>
                    </div>
                </div>
                <div class="brand-additional">
                    <div class="brand-row">
                        <?php
                        if( !empty($brand_region) ) {
                        ?>
                        <div class="brand-col col-region">
                            <div class="brand-label label-text">
                                Region
                                <a href="javascript:void(0)" class="btn btn-underline btn-small btn-see-all" data-target="region">See All</a>
                            </div>
                            <div class="brand-value">
                                <div class="grid grid-region">
                                    <?php
                                    $r = 0;
                                    foreach( $brand_region as $index => $key ) {
                                        if( $r <= 5 ) {
                                            list($brand_currency, $brand_flag_code) = explode('|', $key['value']);
                                            echo '<div class="grid-item" data-currency="'.$brand_currency.'" data-country="'.$brand_flag_code.'"><img src="' . THEME_ASSETS_IMAGE_DIRECTORY . '/flags/' . $brand_flag_code . '.svg" class="img-fluid w-100"/></div>';
                                            $r++;
                                        }
                                    }
                                    ?>
                                </div>
                            </div>
                            <div class="error"></div>
                        </div>
                        <?php
                        }

                        if( !empty($brand_payments) ) {
                        ?>
                        <div class="brand-col col-payments">
                            <div class="brand-label label-text">
                                Payment Methods
                                <a href="javascript:void(0)" class="btn btn-underline btn-small btn-see-all" data-target="payment-methods">See All</a>
                            </div>
                            <div class="brand-value">
                                <div class="grid grid-payment-methods">
                                    <?php
                                    $taxonomy = 'payment-method';
                                    $p = 0;
                                    foreach( $brand_payments as $index => $payment_id ) {
                                        if( $p <= 5 ) {
                                            $payment_logo = get_field('logo', $taxonomy . '_' . $payment_id);
                                            echo '<div class="grid-item"><img src="' . $payment_logo['url'] . '" class="img-fluid w-100"/></div>';
                                            $p++;
                                        }
                                    }
                                    ?>
                                </div>
                            </div>
                            <div class="error"></div>
                        </div>
                        <?php
                        }

                        if( !empty($brand_currencies) || !empty($brand_rtp) || !empty($brand_payout_speed)  ) {
                        ?>
                        <div class="brand-col col-additional">
                            <div class="grid grid-additional-info">
                            <?php
                                if( !empty($brand_currencies) ) {
                            ?>
                                <div class="grid-item">
                                    <div class="brand-label label-text">Currencies</div>
                                    <div class="brand-value"><?= $brand_currencies;?></div>
                                </div>
                            <?php
                                }
                                if( !empty($brand_rtp) ) {
                            ?>
                                <div class="grid-item">
                                    <div class="brand-label label-text">RTP</div>
                                    <div class="brand-value"><?= $brand_rtp;?></div>
                                </div>
                            <?php
                                }
                                if( !empty($brand_payout_speed) ) {
                            ?>
                                <div class="grid-item">
                                    <div class="brand-label label-text">Payout Speed</div>
                                    <div class="brand-value"><?= $payout_speed;?></div>
                                </div>
                            <?php
                                }
                            ?>
                            </div>
                        </div>
                        <?php
                        }
                        ?>
                    </div>
                </div>
            </div>
        </div>
<?php
$body = get_field('body');
$body_intro = $body['introduction'];
$games = get_field('games');
?>
        <div class="brand-content">
            <?php if( !empty($body_intro) ) { ?>
            <div class="grid grid-child-1 grid-intro">
                <div class="brand-col">
                    <div class="text-editor"><?= $body_intro;?></div>
                </div>
            </div>
            <?php } ?>
            <div class="grid grid-child-2 grid-extra">
                <?php
                $bonuses = get_field('bonuses');
                if( !empty($bonuses['data']) ) {
                ?>
                <div class="brand-col brand-bonuses">
                    <h3 class="brand-item brand-title">Bonuses</h3>
                    <div class="brand-item brand-body">
                    <?php
                    echo '<div class="grid grid-shade-box grid-bonuses">';
                        foreach( $bonuses['data'] as $bonus ) {
                            $label = $bonus['label'];
                            $content = $bonus['content'];
                            $link = $bonus['link'];
                            $target = ( $link['target'] ) ? ' target="'.$link['target'].'" ' : '';
                            echo '<div class="grid-item">';
                                echo '<div class="grid-item-inner">';
                                    echo '<div class="box-header"><p>'.$label.'</p></div>';
                                    echo '<div class="box-body">';
                                        echo '<div class="box-body-inner">';
                                            echo '<div class="box-desc">'.$content.'</div>';
                                            echo '<div class="box-link"><a href="'.$link['url'].'"'.$target.'><span class="d-none hide">Go To</span><img src="'.THEME_ASSETS_IMAGE_DIRECTORY.'/icons/icon-go-to.png" class="img-fluid w-100"/></a></div>';
                                        echo '</div>';
                                    echo '</div>';
                                echo '</div>';
                            echo '</div>';
                        }
                    echo '</div>';
                    ?>
                    </div>
                </div>
                <?php
                }
                $vip_benefit = get_field('vip_benefit');
                ?>
                <div class="brand-col brand-benefit">
                    <h3 class="brand-item brand-title">VIP Benefit</h3>
                    <div class="brand-item brand-body">
                    <?php
                    echo '<div class="grid grid-shade-box grid-benefits">';
                        foreach( $vip_benefit['data'] as $benefit ) {
                            $label = $benefit['label'];
                            $content = $benefit['content'];
                            $link = $benefit['link'];
                            $target = ( $link['target'] ) ? ' target="'.$link['target'].'" ' : '';
                            echo '<div class="grid-item">';
                                echo '<div class="grid-item-inner">';
                                    echo '<div class="box-header"><p>'.$label.'</p></div>';
                                    echo '<div class="box-body">';
                                        echo '<div class="box-body-inner">';
                                            echo '<div class="box-desc">'.$content.'</div>';
                                            echo '<div class="box-link"><a href="'.$link['url'].'"'.$target.'><span class="d-none hide">Go To</span><img src="'.THEME_ASSETS_IMAGE_DIRECTORY.'/icons/icon-go-to.png" class="img-fluid w-100"/></a></div>';
                                        echo '</div>';
                                    echo '</div>';
                                echo '</div>';
                            echo '</div>';
                        }
                    echo '</div>';
                    ?>
                    </div>
                </div>
                <?php
                if( !empty($games) ) {
                    $game_list = [];
                    foreach( $games as $game ) {
                        $game_list[] = $game['value'];
                    }
                ?>
                <div class="brand-col brand-games">
                    <h3 class="brand-item brand-title">Games</h3>
                    <div class="brand-item brand-body">
                    <?php
                    $args_games = array(
                        'post_type' => 'game',
                        'post_status' => 'publish',
                        'posts_per_page' => -1,
                        'order' => 'asc',
                        'orderby' => 'menu_order'
                    );
                    $display_games = new WP_Query($args_games);
                    if( $display_games->have_posts() ) {
                        echo '<div class="grid grid-games-availability">';
                        while( $display_games->have_posts() ) {
                            $display_games->the_post();
                            $game_id = get_the_ID();
                            $game_title = get_the_title();
                            $game_slug = get_post_field('post_name', $game_id);
                            $game_thumbnail_url = home_url() . '/wp-content/uploads/2025/11/img-media-temp.png';
                            if( has_post_thumbnail() ) {
                                $game_thumbnail_url = get_the_post_thumbnail_url();
                            }
                            $game_thumbnail = '<div class="game-icon"><img src="'.$game_thumbnail_url.'" class="img-fluid w-100 h-100"/></div>';

                            $is_available = in_array($game_slug, $game_list);
                            $game_class = $is_available ? ' active' : '';
                            echo '<div class="grid-item grid-item-'.$game_slug.$game_class.'">';
                                echo '<div class="grid-item-inner">';
                                    echo '<div class="game-col game-title">'.$game_thumbnail.' <p>'.$game_title.'</p></div>';
                                    if( $is_available ) {
                                        echo '<div class="game-col game-tick"><img src="'.THEME_ASSETS_IMAGE_DIRECTORY.'/icons/icon-tick-success.png"/></div>';
                                    }
                                echo '</div>';
                            echo '</div>';
                        }
                        WP_RESET_POSTDATA();
                        echo '</div>';
                    }
                    ?>
                    </div>
                </div>
                <?php
                }
                $additional = get_field('additional');
                $brand_providers = $additional['game_providers'];
                $brand_licenses = $additional['licensing'];
                if( !empty($brand_providers) || !empty($brand_licenses) ) {
                ?>
                <div class="brand-col brand-others">
                    <?php
                    if( !empty($brand_providers) ) {
                    ?>
                    <div class="brand-item brand-body">
                        <div class="brand-label label-heading">
                            Game Providers
                            <a href="javascript:void(0)" class="btn btn-underline btn-small btn-see-all" data-target="providers">See All</a>
                        </div>
                        <div class="brand-value">
                            <div class="grid grid-container-box grid-providers">
                                <?php
                                $pr=0;
                                foreach( $brand_providers as $index => $provider_id ) {
                                    if( $pr < 10 ) {
                                        $thumbnail = TEMP_MEDIA_IMAGE;
                                        if( has_post_thumbnail($provider_id) ) {
                                            $thumbnail = get_the_post_thumbnail_url($provider_id);
                                        }
                                        echo '<div class="grid-item"><img src="' . $thumbnail . '" class="img-fluid w-100"/></div>';
                                        $pr++;
                                    }
                                }
                                ?>
                            </div>
                        </div>
                        <div class="error"></div>
                    </div>
                    <?php
                    }
                    if( !empty($brand_licenses) ) {
                    ?>
                    <div class="brand-item brand-body">
                        <div class="brand-label label-heading">
                            Licenses
                            <a href="javascript:void(0)" class="btn btn-underline btn-small btn-see-all" data-target="licenses">See All</a>
                        </div>
                        <div class="brand-value">
                            <div class="grid grid-container-box grid-licenses">
                                <?php
                                $l = 0;
                                foreach( $brand_licenses as $index => $license_id ) {
                                    if( $l < 5 ) {
                                        $thumbnail = TEMP_MEDIA_IMAGE;
                                        if( has_post_thumbnail($license_id) ) {
                                            $thumbnail = get_the_post_thumbnail_url($license_id);
                                        }
                                        echo '<div class="grid-item"><img src="' . $thumbnail . '" class="img-fluid w-100"/></div>';
                                        $l++;
                                    }
                                }
                                ?>
                            </div>
                        </div>
                        <div class="error"></div>
                    </div>
                    <?php 
                    }
                    ?>
                </div>
                <?php
                }

                $comparison = get_field('comparison');
                $positive = $comparison['positive'];
                $negative = $comparison['negative'];
                if( !empty($positive) || !empty($negative) ) {
                ?>
                <div class="brand-col brand-comparison">
                    <h3 class="brand-item brand-title">Comparison</h3>
                    <div class="brand-item brand-body">
                        <div class="grid grid-child-2 grid-comparison">
                        <?php
                        if( !empty($positive) ) {
                            echo '<div class="grid-item grid-item-positive">';
                                echo '<div class="grid-item-inner">';
                                    echo '<h4 class="brand-item brand-title">Positive</h4>';
                                    echo '<div class="brand-item brand-body">';
                                        echo '<div class="icon-list">';
                                        foreach( $positive as $value ) {
                                            $label = $value['label'];
                                            echo '<div class="icon-list-item">';
                                                echo '<div class="icon-list-icon"><img src="'.THEME_ASSETS_IMAGE_DIRECTORY.'/icons/icon-tick-success.png" class="img-fluid w-100"/></div>';
                                                echo '<div class="icon-list-text">'.$label.'</div>';
                                            echo '</div>';
                                        }
                                        echo '</div>';
                                    echo '</div>';
                                echo '</div>';
                            echo '</div>';
                        }
                        if( !empty($negative) ) {
                            echo '<div class="grid-item grid-item-negative">';
                                echo '<div class="grid-item-inner">';
                                    echo '<h4 class="brand-item brand-title">Negative</h4>';
                                    echo '<div class="brand-item brand-body">';
                                        echo '<div class="icon-list">';
                                        foreach( $negative as $value ) {
                                            $label = $value['label'];
                                            echo '<div class="icon-list-item">';
                                                echo '<div class="icon-list-icon"><img src="'.THEME_ASSETS_IMAGE_DIRECTORY.'/icons/icon-times-error.png" class="img-fluid w-100"/></div>';
                                                echo '<div class="icon-list-text">'.$label.'</div>';
                                            echo '</div>';
                                        }
                                        echo '</div>';
                                    echo '</div>';
                                echo '</div>';
                            echo '</div>';
                        }
                        ?>
                        </div>
                    </div>
                </div>
                <?php
                }
                ?>
            </div>
        </div>
    </div>
</main>