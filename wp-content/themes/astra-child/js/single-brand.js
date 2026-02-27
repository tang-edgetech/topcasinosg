$(document).ready(function() {
    $(document).on('click', '.btn-see-all', function(e) {
        e.preventDefault();
        var $this = $(this),
            $target = $this.attr('data-target');
        if( $target !== null ) {
            var $offset = 6;
            if( $target == 'providers' ) {
                $offset = 10;
            }
            else if( $target == 'licenses' ) {
                $offset = 5;
            }
            var $error = $('.grid.grid-'+$target).siblings('.error');
            $.ajax({
                url: single_brand.ajax_url,
                type: "POST",
                data: {
                    action: 'single_brand_retrieving_data',
                    nonce: single_brand.brand_nonce,
                    target: $target,
                    post_id: single_brand.current_id,
                    offset: $offset
                },
                success: function(data) {
                    var $response = JSON.parse(data);
                    if( $response.status == 1000 || $response.status == 2000 ) {
                        if( $response.status == 1000 ) {
                            $('.grid.grid-'+$target).append($response.html);
                            $offset = $offset+6;
                            if( $response.end === true ) {
                                $this.remove();
                            }
                        }
                        if( $response.status == 2000 ) {
                            $error.addClass('error').html($response.message);
                            $error.fadeIn();
                        }
                    }
                    else {
                        $error.addClass('failed').html("There is an error occurred! Please try again later.");
                    }
                    $error.fadeIn();
                },
                error: function(xhr) {
                    $error.addClass('failed').html("Something went wrong unexpectedly!");
                    display_error($error);
                }
            });
        }
    });
    function display_error($error) {
        $error.fadeIn();
        setTimeout(function() {
            $error.fadeOut().removeClass('success failed').html("");
        }, 5000);
    }
});