document.addEventListener("DOMContentLoaded", function () {
    console.log('After load');
    var $text_collapsible_editor = $('.elementor-widget-text-collapsible-editor');
    $text_collapsible_editor.each(function() {
        var $widget = $(this),
            $button = $widget.find('button.collapsible-text-button');
        $button.on('click', function(e) {
            e.preventDefault();
            var $this = $(this),
                $parent = $this.parents('.ln-collapsible-editor'),
                $icon = $this.find('i'),
                $expand_icon = $this.attr('data-icon-expand'),  
                $collapse_icon = $this.attr('data-icon-collapse');
            $this.prop('disabled', true);
            setTimeout(() => $this.prop('disabled', false), 350);
            $parent.toggleClass('show');
        });
    });

    $('.ln-informative-swiper .informative-swiper').each(function(index) {
        const $this = $(this);

        var $ppp = $this.attr('data-slides-desktop'),
            $ppp_laptop = $this.attr('data-slides-laptop'),
            $ppp_tablet = $this.attr('data-slides-tablet'),
            $ppp_mobile = $this.attr('data-slides-mobile'),
            $loop = ($this.data('loop') == true || $this.data('loop') == 'yes'),
            $speed = Number($this.data('speed')) || 300,
            $autoplay = ($this.data('autoplay') == true || $this.data('autoplay') == 'yes'),
            $autoplay_timeout = Number($this.data('autoplay-timeout')) || 3000;
        let swiperOptions = {
            loop: $loop,
            spaceBetween: 20,
            slidesPerView: $ppp_mobile,
            navigation: {
                nextEl: $this.parents('.ln-informative-swiper').find('.ln-informative-nav-next')[0],
                prevEl: $this.parents('.ln-informative-swiper').find('.ln-informative-nav-prev')[0],
            },
            speed: $speed,
            breakpoints: {
                0: { slidesPerView: $ppp_mobile },
                768: { slidesPerView: $ppp_tablet },
                1200: { slidesPerView: $ppp_laptop },
                1600: { slidesPerView: $ppp },
            }
        };
        if( $autoplay ) {
            swiperOptions.autoplay = {
                delay: $autoplay_timeout,
                disableOnInteraction: false,
            };
        }
        new Swiper($this[0], swiperOptions);
    });
    
    $('.elementor-widget-ln-gallery_swiper .ln-gallery-swiper').each(function(index) {
        const $this = $(this);

        // Assign a unique class or ID for each Swiper container
        var $ppp = $this.attr('data-slides-desktop'),
            $ppp_laptop = $this.attr('data-slides-laptop'),
            $ppp_tablet = $this.attr('data-slides-tablet'),
            $ppp_mobile = $this.attr('data-slides-mobile'),
            $loop = ($this.data('loop') == true || $this.data('loop') == 'yes'),
            $speed = Number($this.data('speed')) || 300,
            $autoplay = ($this.data('autoplay') == true || $this.data('autoplay') == 'yes'),
            $autoplay_timeout = Number($this.data('autoplay-timeout'));
        console.log('Speed = '+$speed, 'Delay = '+$autoplay_timeout);
        let swiperOptions = {
            loop: $loop,
            spaceBetween: 20,
            slidesPerView: $ppp_mobile,
            navigation: {
                nextEl: $this.parents('.ln-informative-swiper').find('.ln-informative-nav-next')[0],
                prevEl: $this.parents('.ln-informative-swiper').find('.ln-informative-nav-prev')[0],
            },
            speed: $speed,
            breakpoints: {
                0: { slidesPerView: $ppp_mobile },
                768: { slidesPerView: $ppp_tablet },
                1200: { slidesPerView: $ppp_laptop },
                1600: { slidesPerView: $ppp },
            }
        };
        if( $autoplay ) {
            swiperOptions.autoplay = {
                delay: $autoplay_timeout,
                disableOnInteraction: false,
            };
        }
        console.log(swiperOptions);
        new Swiper($this[0], swiperOptions);
    });

    $('.elementor-widget-ln-casino-calculator .casino-calculator').each(function(index, element) {
        var $this = $(this);
        $this.on('reset', function() {
            const $form = $(this);
            setTimeout(() => {
                $this.find('.calculator-result .table tbody').html(`
                    <tr><td colspan="2">No calculation yet</td></tr>
                `);
            }, 100);
        });

        $this.on('submit', function(e) {
            e.preventDefault(); // prevent form from reloading page

            const $form = $(this);
            const deposit = parseFloat($form.find('[name="_deposit_amount"]').val()) || 0;
            const bonusPercent = parseFloat($form.find('[name="_bonus_percentage"]').val()) || 0;
            const maxBonus = parseFloat($form.find('[name="_max_bonus_amount"]').val()) || 0;
            const wagering = parseFloat($form.find('[name="_wagering_requirement"]').val()) || 0;
            const gameRate = parseFloat($form.find('[name="_game_contribution_rate"]').val()) || 0;

            // Basic calculations
            let bonusAmount = (deposit * bonusPercent) / 100;
            if (maxBonus > 0 && bonusAmount > maxBonus) bonusAmount = maxBonus;

            const totalBalance = deposit + bonusAmount;
            const wageringAmount = bonusAmount * wagering;
            const effectiveWagering = (gameRate > 0) ? (wageringAmount / (gameRate / 100)) : 0;

            // Display results
            const $tbody = $form.find('.calculator-result table tbody');
            $tbody.html(`
            <tr>
                <td>Deposit Amount</td>
                <td class="text-right">$${deposit.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Bonus Amount (${bonusPercent}%)</td>
                <td class="text-right">$${bonusAmount.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Total Balance</td>
                <td class="text-right">$${totalBalance.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Wagering Requirement (x${wagering})</td>
                <td class="text-right">$${wageringAmount.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Effective Wagering (at ${gameRate}% game contribution)</td>
                <td class="text-right">$${effectiveWagering.toFixed(2)}</td>
            </tr>
            `);
        });

    });
});