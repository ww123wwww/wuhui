const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    detail: null,
    loading: true,
    likeCount: 0,
    isLiked: false,
    collectCount: 0,
    isCollected: false,
    isFollowing: false,
    isCurrentUser: false,
    authorId: null,
    isSavedToTrip: false,
    contentType: '',
    showAuthorModal: false
  },

  onLoad(options) {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });

    if (options.id) {
      this.loadContentDetail(options.id);
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      wx.navigateBack();
    }
  },

  loadContentDetail(id) {
    this.setData({ loading: true });

    api.getContentDetail(id).then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        const response = res.data;
        const detail = response.content;
        const currentUserId = wx.getStorageSync('userId') || 1;
        let imageList = [];
        if (detail.imageList) {
          try {
            imageList = typeof detail.imageList === 'string' ? JSON.parse(detail.imageList) : detail.imageList;
          } catch (e) {
            imageList = [];
          }
        }
        let formattedPublishTime = '';
        if (detail.publishTime) {
          formattedPublishTime = this.formatDate(detail.publishTime);
        }
        
        this.setData({
          detail: detail,
          publishTime: formattedPublishTime,
          likeCount: detail.likeCount || 0,
          collectCount: detail.collectCount || 0,
          isLiked: response.liked || false,
          isCollected: response.collected || false,
          isFollowing: response.following || false,
          isCurrentUser: currentUserId === detail.userId,
          authorId: detail.userId,
          imageList: imageList,
          contentType: detail.contentType || ''
        });

        // 检查是否已保存到行程
        this.checkTripSaved();
      } else {
        wx.showToast({
          title: res.message || '获取详情失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('获取游记详情失败', err);
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    });
  },

  goBack() {
    wx.navigateBack();
  },

  onLike() {
    if (!this.data.detail) return;

    const userId = wx.getStorageSync('userId') || 1;
    const contentId = this.data.detail.id;

    api.likeContent(userId, contentId, this.data.contentType).then(res => {
      if (res.code === 200) {
        const isLiked = res.data.liked;
        this.setData({
          isLiked: isLiked,
          likeCount: isLiked ? this.data.likeCount + 1 : this.data.likeCount - 1
        });
        wx.showToast({
          title: isLiked ? '点赞成功' : '取消点赞成功',
          icon: 'success'
        });
        app.globalData.shouldRefreshIndex = true;
        app.globalData.shouldRefreshProfile = true;
      }
    }).catch(err => {
      console.error('点赞失败', err);
    });
  },

  onCollect() {
    if (!this.data.detail) return;

    const userId = wx.getStorageSync('userId') || 1;
    const contentId = this.data.detail.id;

    api.collectContent(userId, contentId, this.data.contentType).then(res => {
      if (res.code === 200) {
        const isCollected = res.data.liked;
        this.setData({
          isCollected: isCollected,
          collectCount: isCollected ? this.data.collectCount + 1 : this.data.collectCount - 1
        });
        wx.showToast({
          title: isCollected ? '收藏成功' : '取消收藏成功',
          icon: 'success'
        });
        app.globalData.shouldRefreshIndex = true;
        app.globalData.shouldRefreshProfile = true;
      }
    }).catch(err => {
      console.error('收藏失败', err);
    });
  },

  onFollow() {
    if (!this.data.authorId) return;

    const userId = wx.getStorageSync('userId') || 1;
    const authorId = this.data.authorId;

    api.followUser(userId, authorId).then(res => {
      if (res.code === 200) {
        const isFollowing = res.data.following;
        this.setData({
          isFollowing: isFollowing
        });
        wx.showToast({
          title: isFollowing ? '关注成功' : '取消关注成功',
          icon: 'success'
        });
        app.globalData.shouldRefreshProfile = true;
      }
    }).catch(err => {
      console.error('关注操作失败', err);
    });
  },

  saveToTrip() {
    if (!this.data.detail) return;

    const userId = wx.getStorageSync('userId') || 1;
    const contentId = this.data.detail.id;

    if (this.data.isSavedToTrip) {
      // 已保存，执行取消保存
      api.removeTrip(userId, contentId).then(res => {
        if (res.code === 200) {
          this.setData({ isSavedToTrip: false });
          wx.showToast({ title: '已取消保存', icon: 'success' });
          app.globalData.shouldRefreshTrip = true;
        }
      }).catch(err => {
        console.error('取消保存失败', err);
        wx.showToast({ title: '操作失败', icon: 'none' });
      });
    } else {
      // 未保存，执行保存
      api.saveToTrip(userId, contentId).then(res => {
        if (res.code === 200) {
          this.setData({ isSavedToTrip: true });
          wx.showToast({ title: '已保存到行程', icon: 'success' });
          app.globalData.shouldRefreshTrip = true;
        }
      }).catch(err => {
        console.error('保存行程失败', err);
        wx.showToast({ title: '保存失败', icon: 'none' });
      });
    }
  },

  checkTripSaved() {
    if (!this.data.detail) return;
    const userId = wx.getStorageSync('userId') || 1;
    const contentId = this.data.detail.id;

    api.checkTripSaved(userId, contentId).then(res => {
      if (res.code === 200) {
        this.setData({ isSavedToTrip: res.data.saved });
      }
    });
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  showAuthorModal() {
    if (this.data.isCurrentUser) return;
    this.setData({
      showAuthorModal: true
    });
  },

  preventBubble() {
    // 阻止事件冒泡
  },

  hideAuthorModal() {
    this.setData({
      showAuthorModal: false
    });
  },

  handleFollow() {
    this.onFollow();
  },

  goToChat() {
    const authorId = this.data.detail.userId;
    const authorName = this.data.detail.nickname || '匿名用户';
    const authorAvatar = this.data.detail.avatarUrl || '';
    this.setData({
      showAuthorModal: false
    });
    wx.navigateTo({
      url: `/pages/chat/chat?userId=${authorId}&userName=${encodeURIComponent(authorName)}&avatarUrl=${encodeURIComponent(authorAvatar)}`
    });
  }
});