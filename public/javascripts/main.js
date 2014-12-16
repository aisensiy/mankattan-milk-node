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

$(function() {
  var code = get_code();
  var user = null;
  $.ajax('/users/get?code=' + code, function(result) {
    if (result.ret == 1 && result.url) {
      window.location.href = window.location.origin + result.url;
    } else if (result.user) {
      user = result.user;
      $('body').html(user.nickname);
    }
  });
});
