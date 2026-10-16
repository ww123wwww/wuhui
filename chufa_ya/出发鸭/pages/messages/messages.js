const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    chats: []
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.loadChatList();
  },

  onShow() {
    this.loadChatList();
  },

  loadChatList() {
    const userId = wx.getStorageSync('userId') || 1;

    api.getChatList(userId).then(res => {
      if (res.code === 200) {
        const chats = res.data.map(item => ({
          id: item.id,
          userId: item.userId,
          avatar: item.avatarUrl,
          name: item.nickname,
          time: this.formatTime(item.lastTime),
          preview: item.lastMessage,
          unread: item.unreadCount || 0,
          placeholderIcon: ''
        }));
        this.setData({
          chats: chats
        });
      }
    }).catch(err => {
      console.error('获取聊天列表失败', err);
    });
  },

  formatTime(timeStr) {
    if (!timeStr) return '';
    
    const now = new Date();
    const time = new Date(timeStr);
    const diff = now.getTime() - time.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return weekDays[time.getDay()];
    } else {
      return `${time.getMonth() + 1}-${time.getDate()}`;
    }
  },

  goToChat(e) {
    const chat = e.currentTarget.dataset.chat;
    wx.navigateTo({
      url: `/pages/chat/chat?userId=${chat.userId}&userName=${encodeURIComponent(chat.name)}&avatarUrl=${encodeURIComponent(chat.avatar || '')}`
    });
  }
});