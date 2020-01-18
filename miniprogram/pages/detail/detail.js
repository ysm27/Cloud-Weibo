const db = wx.cloud.database();
const App = getApp();
import { formatTime } from '../../utils/utils';

Page({
  data: {
    topic: [],
    id: '',
    fullScreen: false,
    userInfo: {},
    replies: [],
    message: ''
  },
  onLoad: function (options) {
    this.getTopics(options.id);
    this.getUserInfo();
    this.getReplies(options.id);
  },
  getUserInfo: function() {
    let userInfo = App.globalData.userInfo;
    if(userInfo.nickName) {
      this.setData({ userInfo })
    }
  },
  getTopics: function(id) {
    db.collection('topic').doc(id).get({
      success: res => {
        let topic = res.data;
        this.setData({ topic, id })
      }
    })
  },
  getReplies: function(id) {
    db.collection('reply').orderBy('createTime', 'desc').where({
      topic_id: id
    }).get({
      success: res => {
        this.setData({ replies: res.data, id })
      }
    })
  },
  handlePreviewImage: function (e) {
    let url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },
  handlePreviewVideo: function (e) {
    let id = e.currentTarget.dataset.id;
    let videoCtx = wx.createVideoContext(id);
    let fullScreen = this.data.fullScreen;
    if(fullScreen){
      videoCtx.pause();
      videoCtx.exitFullScreen();
      this.setData({ fullScreen: false })
    }else{
      videoCtx.requestFullScreen();
      videoCtx.play();
      this.setData({ fullScreen: true })
    }
  },
  onGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      App.getUserInfo((res)=>{
        this.setData({
          userInfo: res.userInfo
        })
      })
    }
  },
  handleChange: function(e) {
    this.setData({ message: e.detail.value });
  },
  handleSubmit: function() {
    let date = new Date();
    let date_display = formatTime(date);
    let userInfo = App.globalData.userInfo;
    let createTime = db.serverDate();
    let content = this.data.message;
    let topic_id = this.data.id;
    let replies = this.data.replies;

    if(!content) {
      wx.showToast({
        title: '评论不能为空',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '上传中',
      mask: true
    })

    db.collection('reply').add({
      data: {
        date_display,
        userInfo,
        createTime,
        content,
        topic_id,
      },
      success: res => {
        wx.showToast({
          title: '评论成功'
        })
        replies.unshift({ content, userInfo, date_display, topic_id, createTime})
        this.setData({ replies, message: '' });
        this.incReply(topic_id);
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  incReply: function(topic_id) {
    wx.cloud.callFunction({
      name: 'incReply',
      data: {
        topic_id: topic_id
      },
      success: res => {
        console.log('[云函数] [addReply] user openid: ', res.result)
      },
      fail: err => {
        console.error('[云函数] [addReply] 调用失败', err)
      }
    })
  }
})