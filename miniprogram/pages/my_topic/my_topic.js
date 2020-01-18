const db = wx.cloud.database();
const App = getApp();

Page({
  data: {
    topics: [],
  },
  onShow: function() {
    this.getTopics();
  },
  getTopics: function(cb) {
    db.collection('topic').orderBy('createTime', 'desc').where({
      _openid: App.globalData.openid
    }).get({
      success: res => {
        let topics = res.data;
        this.setData({ topics });
        typeof cd === 'function' && cb();
      },
      fail: err => {
        wx.showToast({
          title: '查询记录失败',
          icon: 'none'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  onPullDownRefresh: function() {
    this.getTopics(()=>{
      wx.stopPullDownRefresh()
    })
  }
})