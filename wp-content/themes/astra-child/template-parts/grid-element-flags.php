<?php
$value = $args['value'];
$value = explode('|', $value);
$currency = $value[0];
$country = $value[1];
?>
<div class="grid-item" data-currency="<?= $currency;?>" data-country="<?= $country;?>"><img src="<?= THEME_ASSETS_IMAGE_DIRECTORY;?>/flags/<?= strtolower($country);?>.svg" class="img-fluid w-100"></div>