(function() {
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

  var game_time = 15;
  var endtime;

  function start_countdown(finished) {
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
      $number_elem.html(game_time);
      var start_time = new Date();
      var interval_key = setInterval(function() {
        var cur_time = new Date();
        var diff = cur_time - start_time;
        var left = game_time * 1000 - diff;
        if (left <= 0) {
          left = 0;
        }
        $number_elem.text(parseInt(left / 100) / 10);
        if (left == 0) {
          clearInterval(interval_key);
          $start_btn.data('started', false);
          $start_btn.attr('disabled', false);
          $start_btn.removeClass('disable');
          endtime = new Date();
          finished && finished();
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


  function save_result() {
    var click = $('#cow img').data('click');
    $.get(constants.base + '/save', { click: click }, function() {
    });
  }

  function fetch_rank() {
    function _build(row) {
      return '<td>' + row[0] + '</td><td class="nickname">' + row[1] + '</td><td>' + row[2] + '</td><td>' + row[3] + '</td>';
    }

    $.get(constants.base + '/rank', function(rows) {
      var i;
      var $tbody = $('#rank table tbody');
      $tbody.empty();
      var result = '';
      var self = rows[0];
      result += '<tr class="self">' + _build(self) + '</tr>';
      rows = rows.slice(1);
      for (i = 0; i < rows.length; i++) {
        result += '<tr>' + _build(rows[i]) + '</tr>';
      }
      $tbody.html(result);
    });
  }

  var Popup = (function() {
    var $cover = $('.cover');

    // event bind
    function close(e) {
      if (+new Date() - endtime <= 2000) {
        return;
      }
      e && e.preventDefault();
      $('.popup').hide();
      $cover.hide();
    }

    $('body').on('mousedown touchstart', 'a.close', close);
    $cover.on('mousedown touchstart', close);

    var show_cong_popup = function() {
      var text = "恭喜你！<br /> 本次共挤奶click次！获得奶棒bang根！<br /> 点击主页面 ”我的名次“ 查看排行榜吧~";
      var click = $('#cow img').data('click');
      var $popup = $('#cong');
      $popup.find('p').html(text.replace('click', click).replace('bang', parseInt(click / 8 * 1.2)))

      $('.popup').hide();
      $cover.show();
      $popup.show();
    };

    var show_popup = function(id, callback) {
      return function(e) {
        e && e.preventDefault();
        e && e.stopPropagation();
        $('.popup').hide();
        $cover.show();
        $('#' + id).show();
        callback && callback();
      }
    };

    var bind_action = function($elem, id, callback) {
      $elem.on('mousedown touchstart', show_popup(id, callback));
    };

    return {
      show_cong_popup: show_cong_popup,
      bind_action: bind_action
    }
  })();


  $(function() {
    // 判断用户是否已经授权
    var code = get_code();
    var user = null;
    $.get(constants.base + '/users/get?code=' + (code || ''), function(result) {
      if (result.ret == 1 && result.url) {
        window.location.href = window.location.origin + constants.base + result.url;
      } else if (result.user) {
        user = result.user;
      }
    });

//    $(window).on('resize', function() {
//        var width = $(window).width();
//        var height = 1.2 * width;
//        $('div.container').css('min-height', height);
//    });
//    $(window).resize();

    start_countdown(function() {
      Popup.show_cong_popup();
      save_result();
    });

    click_cow(update_click_count);

    Popup.bind_action($('button.rule'), 'rule');
    Popup.bind_action($('button.rank'), 'rank', fetch_rank);

    // statistic
    $.get(constants.base + '/stat/update_uv_pv', function() {});
  });

})();
