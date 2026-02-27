(function($) {
    var isMobile = false, isTablet = false, isDesktop = false;
    isMobile = isTablet = isDesktop = false;
    var container = null, type = null;

    function calculate_sidebar_position($type, $container) {
        var $fullwidth = $('body').width(),
            $sidebar = $('.page-template-page-elementor-template-sidebar #secondary');
        if( $type === 'container' ) {
            const offset = (($fullwidth - $container) / 2)*-1;
            $sidebar.css({'transform': 'translateX('+offset+'px)'});
        }
        else {
            $sidebar.removeAttr('style');
        }
    }

    $(window).on('resize',function() {
        var $sidebar = $('.page-template-page-elementor-template-sidebar #content #secondary');
        if( $sidebar[0] ) {
            $(window).bind('scroll', function() {
                if ($(this).scrollTop() > 0) {
                    $('body').addClass('scrolled');
                } else {
                    $('body').removeClass('scrolled');
                }
            });

            $sidebar.each(function() {
                if( window.matchMedia("(min-width: 768px)").matches && window.matchMedia("(max-width: 1199px)").matches ) {
                    container = 720;
                    type = 'container'
                }
                else if( window.matchMedia("(min-width: 1200px)").matches && window.matchMedia("(max-width: 1599px)").matches ) {
                    container = 1140;
                    type = 'container'
                }
                else if( window.matchMedia("(min-width: 1600px)").matches ) {
                    container = 1270;
                    type = 'container'
                }
                else {
                    container = '100%';
                    type = 'full';
                }
                calculate_sidebar_position(type, container);
            });
        }
    }).trigger('resize');

    $(document).on('click', '.error-dialog .btn-close', function(e) {
        e.preventDefault();
        var $this = $(this),
            $parents = $this.parents('.error-dialog');
        if( $parents.hasClass('show') ) {
            $parents.removeClass('show');
            setTimeout(function() {
                $parents.hide();
            }, 500);
        }
    });
})(jQuery);