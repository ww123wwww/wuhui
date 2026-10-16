const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    targetUserId: null,
    targetUserName: '',
    targetUserAvatar: '',
    currentUserAvatar: '',
    inputValue: '',
    messages: [],
    scrollTop: 0
  },

  onLoad(options) {
    const userName = decodeURIComponent(options.userName || '匿名用户');
    const avatarUrl = decodeURIComponent(options.avatarUrl || '');

    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20,
      targetUserId: options.userId,
      targetUserName: userName,
      targetUserAvatar: avatarUrl
    });

    wx.setNavigationBarTitle({
      title: userName
    });

    this.loadCurrentUserAvatar();
    this.loadMessages();
  },

  loadCurrentUserAvatar() {
    const userId = wx.getStorageSync('userId') || 1;

    api.getUserInfo(userId).then(res => {
      if (res.code === 200) {
        this.setData({
          currentUserAvatar: res.data.avatarUrl || ''
        });
      }
    }).catch(err => {
      console.error('获取当前用户头像失败', err);
    });
  },

  onShow() {
    this.loadCurrentUserAvatar();
    this.loadMessages();
  },

  loadMessages() {
    const userId = parseInt(wx.getStorageSync('userId') || 1);
    const targetUserId = parseInt(this.data.targetUserId);

    api.getChatMessages(userId, targetUserId).then(res => {
      if (res.code === 200) {
        const messages = res.data.map(item => ({
          id: item.id,
          content: item.content,
          isSelf: item.senderId === userId,
          senderId: item.senderId,
          receiverId: item.receiverId,
          sendTime: item.sendTime
        }));
        this.setData({
          messages: messages
        }, () => {
          setTimeout(() => {
            this.scrollToBottom();
          }, 300);
        });
      }
    }).catch(err => {
      console.error('获取聊天消息失败', err);
    });
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  sendMessage() {
    const content = this.data.inputValue.trim();
    if (!content) return;

    const userId = parseInt(wx.getStorageSync('userId') || 1);
    const targetUserId = parseInt(this.data.targetUserId);

    api.sendMessage(userId, targetUserId, content).then(res => {
      if (res.code === 200) {
        this.setData({
          inputValue: '',
          messages: [...this.data.messages, {
            id: res.data.id,
            content: content,
            isSelf: true,
            senderId: userId,
            receiverId: targetUserId,
            sendTime: res.data.sendTime
          }]
        }, () => {
          setTimeout(() => {
            this.scrollToBottom();
          }, 300);
        });
      } else {
        wx.showToast({
          title: '发送失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('发送消息失败', err);
      wx.showToast({
        title: '发送失败',
        icon: 'none'
      });
    });
  },

  scrollToBottom() {
    this.setData({
      scrollTop: 99999
    });
  },

  goBack() {
    wx.switchTab({
      url: '/pages/messages/messages'
    });
  }
});