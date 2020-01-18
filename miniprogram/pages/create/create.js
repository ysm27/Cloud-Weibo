const App = getApp();
import { formatTime } from '../../utils/utils';
const db = wx.cloud.database();

Page({
  data: {
    content: '',
    imageUrl: '',
    videoUrl: ''
  },
  handleInput: function(e) {
    let content = e.detail.value;
    this.setData({
      content
    })
  },
  handleUpload: function() {
    let that = this;
    let itemListType = ['image', 'video'];
    wx.showActionSheet({
      itemList: ['图片', '视频'],
      success: res => {
        let type = itemListType[res.tapIndex];
        if(type === 'image') {
          wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success (res) {
              const tempFilePaths = res.tempFilePaths[0];
              let imageUrl = tempFilePaths;
              that.uploadFile(type,imageUrl)
            }
          })
        }else{
          wx.chooseVideo({
            sourceType: ['album', 'camera'],
            maxDuration: 15,
            camera: 'back',
            success: res => {
              let videoUrl = res.tempFilePath;
              this.uploadFile(type, videoUrl);
            }
          })
        }
      }
    })
  },
  uploadFile: function(type,filePath) {
    let openid = App.globalData.openid;
    let timestamp = Date.now();
    let postfix = filePath.match(/\.[^.]+?$/)[0];
    let cloudPath = `${openid}_${timestamp}_${postfix}`;
    wx.showLoading({
      title: '正在上传',
      mask: true
    })
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        if(type === 'image') {
          this.setData({ imageUrl: res.fileID })
        }else{
          this.setData({ videoUrl: res.fileID })
        }
      },
      fail: res => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  handleSubmit: function() {
    let content = this.data.content;
    let imageUrl = this.data.imageUrl;
    let videoUrl = this.data.videoUrl;
    let date = new Date();
    let date_display = formatTime(date);
    let createTime = db.serverDate();
    let userInfo = App.globalData.userInfo;
    if(!content && !imageUrl && !videoUrl) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '上传中',
      mask: true
    })
    db.collection('topic').add({
      data: {
        content,
        imageUrl,
        videoUrl,
        date_display,
        createTime,
        userInfo
      },
      success: res => {
        let url = '/pages/index/index';
        wx.redirectTo({
          url: url,
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }
})