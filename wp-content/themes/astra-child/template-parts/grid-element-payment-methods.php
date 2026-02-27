<?php
$value = $args['value'];
$taxonomy = 'payment-method';
$payment_logo = get_field('logo', $taxonomy . '_' . (int)$value);
?>
<div class="grid-item" data-item="<?= $value;?>"><img src="<?= $payment_logo['url'];?>" class="img-fluid w-100"></div>