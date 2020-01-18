App({
  onLaunch: function () {
    this.cloudInit();
    this.getUserInfo();
  },
  cloudInit: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true
      })
    }
  },
  getUserInfo: function(cb) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.getOpenid();
              this.globalData.userInfo = res.userInfo;
              typeof cb === 'function' && cb(res);
            }
          })
        }else{
          console.log('用户未授权');
        }
      }
    })
  },
  getOpenid: function() {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        this.globalData.openid = res.result.openid;
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  globalData: {
    userInfo: {},
    openid: '',
  }
})