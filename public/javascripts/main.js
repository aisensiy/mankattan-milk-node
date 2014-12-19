function get_code() {
  var search = window.location.search.slice(1);
  var result = {};
  var pairs = search.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var pair_array = pair.split('=');
    result[decodeURIComponent(pair_array[0])] = decodeURIComponent(pair_array[1]);
  }
  return result['code'];
}

function start_countdown() {
    var $number_elem = $('.number');
    var $start_btn = $('.game_start');
    $start_btn.on('click', function() {
        if ($start_btn.data('started')) {
            return;
        }
        $start_btn.data('started', true);
        $start_btn.attr('disabled', true);
        $start_btn.addClass('disable');

        // count reset
        $("#cow img").data('click', 0);
        $(".click div").html(0);
        $(".cup div").html(0);
        $(".bang div").html(0);

        // count_down
        $number_elem.html(15);
        var start_time = new Date();
        var interval_key = setInterval(function() {
            var cur_time = new Date();
            var diff = cur_time - start_time;
            var left = 15000 - diff;
            if (left <= 0) {
                left = 0;
            }
            $number_elem.text(parseInt(left / 100) / 10);
            if (left == 0) {
                clearInterval(interval_key);
                $start_btn.data('started', false);
                $start_btn.attr('disabled', true);
                $start_btn.removeClass('disable');
            }
        }, 50);
    });
}

function update_click_count(click_count) {
    var $start_btn = $('.game_start');
    if (!$start_btn.data('started')) {
        return;
    }

    // var click_count = $("#cow img").data('click');
    var $click = $(".click div");
    var $cup = $(".cup div");
    var $bang = $(".bang div");

    $click.html(click_count);
    $cup.html(parseInt(click_count / 8));
    $bang.html(parseInt(click_count / 8) * 12 / 10);
}

function click_cow(callback) {
    function handler() {
        var $start_btn = $('.game_start');
        if (!$start_btn.data('started')) {
            return;
        }

        $(this).data('click', 1 + parseInt($(this).data('click')));
        // console.log($(this).data('click'));

        // update count
        callback && callback($(this).data('click'));

        // animation
        $(this).css({transform: 'scale(0.8)'});
        var self = this;
        setTimeout(function () {
            $(self).css({transform: 'scale(1.0)'});
        }, 800);
    }

    // $('#cow img').click(handler);
    $('#cow img').on('mousedown touchstart', handler);
}

$(function() {
//  var code = get_code();
//  var user = null;
//  $.get('/users/get?code=' + (code || ''), function(result) {
//    if (result.ret == 1 && result.url) {
//      window.location.href = window.location.origin + result.url;
//    } else if (result.user) {
//      user = result.user;
//      $('body').html(user.nickname);
//    }
//  });
//    $(window).on('resize', function() {
//        var width = $(window).width();
//        var height = 1.2 * width;
//        $('div.container').css('min-height', height);
//    });
//    $(window).resize();

    start_countdown();
    click_cow(update_click_count);
});
