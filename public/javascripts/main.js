$.ajax('/users/get', function(result) {
  $('body').html(JSON.stringify(result));
});
