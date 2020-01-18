const App = getApp();

Page({
  data: {
    userInfo: {}
  },
  onLoad: function (options) {
    this.getUserInfo()
  },
  getUserInfo: function() {
    let userInfo = App.globalData.userInfo;
    if(userInfo.nickName) {
      this.setData({
        userInfo
      })
    }
  },
  onGetUserInfo: function(e) {
    if(e.detail.userInfo) {
      let userInfo = e.detail.userInfo;
      App.globalData.userInfo = userInfo;
      App.getUserInfo((res) => {
        this.setData({
          userInfo: res.userInfo
        })
      })
    }
  }
})