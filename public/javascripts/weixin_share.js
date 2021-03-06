// 初始化WeixinApi，等待分享
WeixinApi.ready(function(Api) {

  // 微信分享的数据
  var wxData = {
    "appId": constants.app_id, // 服务号可以填写appId
    "imgUrl" : 'http://mankattan.mathartworld.com' + constants.base + '/images/niu-small.png',
    "link" : 'http://mankattan.mathartworld.com' + constants.base,
    "desc" : '参与曼可顿挤奶手挑战，赢取新品美味————超级奶棒，上不封顶，手速越快赢越多哦！',
    "title" : "曼可顿超级挤奶手等你来战！"
  };

  // 分享的回调
  var wxCallbacks = {
    // 收藏操作不执行回调，默认是开启(true)的
    favorite : false,

    // 分享操作开始之前
    ready : function() {
      // 你可以在这里对分享的数据进行重组
    },
    // 分享被用户自动取消
    cancel : function(resp) {
      // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
    },
    // 分享失败了
    fail : function(resp) {
      // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
    },
    // 分享成功
    confirm : function(resp) {
      // 分享成功了，我们是不是可以做一些分享统计呢？
      $.get(constants.base + '/stat/update_share', function() {});
    },
    // 整个分享过程结束
    all : function(resp,shareTo) {
      // 如果你做的是一个鼓励用户进行分享的产品，在这里是不是可以给用户一些反馈了？
    }
  };

  // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
  Api.shareToFriend(wxData, wxCallbacks);

  // 点击分享到朋友圈，会执行下面这个代码
  Api.shareToTimeline(wxData, wxCallbacks);

  // 点击分享到腾讯微博，会执行下面这个代码
  Api.shareToWeibo(wxData, wxCallbacks);

  // iOS上，可以直接调用这个API进行分享，一句话搞定
  Api.generalShare(wxData,wxCallbacks);
});

WeixinApi.ready(function(Api) {
  // 隐藏
  // Api.hideOptionMenu();

  // 显示
  // Api.showOptionMenu();
});
