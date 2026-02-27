<?php
$post_id = $args['value'];
$logo = THEME_ASSETS_IMAGE_DIRECTORY . '/img-media-temp.png';
if( has_post_thumbnail($post_id) ) {
    $logo = get_the_post_thumbnail_url($post_id);
}
?>
<div class="grid-item" data-item="<?= $value;?>"><img src="<?= $logo;?>" class="img-fluid w-100"></div>