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
    var $elem = $('.game_start').on('click', function() {
        if ($elem.data('started')) {
            return;
        }
        $elem.data('started', true);
        $number_elem.html(15);
        var start_time = new Date();
        var interval_key = setInterval(function() {
            var cur_time = new Date();
            var diff = cur_time - start_time;
            var left = 15000 - diff;
            console.log(left);
            if (left <= 0) {
                left = 0;
            }
            $number_elem.text(parseInt(left / 100) / 10);
            if (left == 0) {
                clearInterval(interval_key);
                $elem.data('started', false);
            }
        }, 50);
    });
}

function click_cow() {
    $('#cow img').click(function() {
        console.log('click cow!');
        $(this).css({transform: 'scale(0.8)'});
        var self = this;
        setTimeout(function() {
            $(self).css({transform: 'scale(1.0)'});
        }, 800);
    });
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
    $(window).on('resize', function() {
        var width = $(window).width();
        var height = 1.2 * width;
        $('div.container').css('min-height', height);
    });
    $(window).resize();

    start_countdown();
    click_cow();
});
