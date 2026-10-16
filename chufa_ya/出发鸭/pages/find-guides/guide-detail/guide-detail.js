const app = getApp();
const api = require('../../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    detail: null,
    loading: true,
    imageList: [],
    isLiked: false,
    isCollected: false,
    isFollowing: false,
    isCurrentUser: false,
    isSavedToTrip: false,
    showAuthorModal: false,
    authorId: null,
    authorBio: '',
    authorFollowCount: 0,
    authorFansCount: 0,
    contentType: ''
  },

  onLoad(options) {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });

    if (options.id) {
      this.loadGuideDetail(options.id);
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      wx.navigateBack();
    }
  },

  loadGuideDetail(id) {
    this.setData({ loading: true });

    api.getContentDetail(id).then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        const responseData = res.data;
        const detail = responseData.content || responseData;
        let imageList = [];
        if (detail.imageList) {
          try {
            imageList = typeof detail.imageList === 'string' ? JSON.parse(detail.imageList) : detail.imageList;
          } catch (e) {
            imageList = [];
          }
        }
        const currentUserId = wx.getStorageSync('userId') || 1;
        this.setData({
          detail: detail,
          imageList: imageList,
          isLiked: responseData.liked || false,
          isCollected: responseData.collected || false,
          isFollowing: responseData.following || false,
          isCurrentUser: currentUserId === detail.userId,
          authorId: detail.userId,
          contentType: detail.contentType || 'travelogue'
        });

        // 获取作者信息
        if (detail.userId) {
          this.loadAuthorInfo(detail.userId);
        }

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
      console.error('获取攻略详情失败', err);
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    });
  },

  // 加载作者信息
  loadAuthorInfo(authorId) {
    api.getUserInfo(authorId).then(res => {
      if (res.code === 200 && res.data) {
        const userInfo = res.data;
        this.setData({
          authorBio: userInfo.bio || '旅行爱好者',
          authorFollowCount: userInfo.followCount || 0,
          authorFansCount: userInfo.fansCount || 0
        });
      }
    });
  },

  goBack() {
    wx.navigateBack();
  },

  // 显示作者弹窗
  showAuthorModal() {
    if (this.data.isCurrentUser) return;
    this.setData({ showAuthorModal: true });
  },

  // 阻止事件冒泡
  preventBubble() {
    // 阻止事件冒泡
  },

  // 隐藏作者弹窗
  hideAuthorModal() {
    this.setData({ showAuthorModal: false });
  },

  // 处理关注（弹窗中）
  handleFollow() {
    this.toggleFollow();
  },

  // 跳转到聊天页面
  goToChat() {
    const authorId = this.data.authorId;
    const authorName = this.data.detail.nickname || '匿名用户';
    const authorAvatar = this.data.detail.avatarUrl || '';
    this.setData({ showAuthorModal: false });
    wx.navigateTo({
      url: `/pages/chat/chat?userId=${authorId}&userName=${encodeURIComponent(authorName)}&avatarUrl=${encodeURIComponent(authorAvatar)}`
    });
  },

  toggleLike() {
    if (!this.data.detail) return;
    const userId = wx.getStorageSync('userId') || 1;
    const contentId = this.data.detail.id;
    const contentType = this.data.contentType;

    api.likeContent(userId, contentId, contentType).then(res => {
      if (res.code === 200) {
        const isLiked = res.data.liked;
        this.setData({
          isLiked: isLiked,
          'detail.likeCount': isLiked ? (this.data.detail.likeCount || 0) + 1 : (this.data.detail.likeCount || 0) - 1
        });
        wx.showToast({
          title: isLiked ? '点赞成功' : '取消点赞',
          icon: 'success'
        });
        app.globalData.shouldRefreshIndex = true;
        app.globalData.shouldRefreshProfile = true;
      }
    }).catch(err => {
      console.error('点赞失败', err);
    });
  },

  toggleCollect() {
    if (!this.data.detail) return;
    const userId = wx.getStorageSync('userId') || 1;
    const contentId = this.data.detail.id;
    const contentType = this.data.contentType;

    api.collectContent(userId, contentId, contentType).then(res => {
      if (res.code === 200) {
        const isCollected = res.data.liked;
        this.setData({
          isCollected: isCollected,
          'detail.collectCount': isCollected ? (this.data.detail.collectCount || 0) + 1 : (this.data.detail.collectCount || 0) - 1
        });
        wx.showToast({
          title: isCollected ? '收藏成功' : '取消收藏',
          icon: 'success'
        });
        app.globalData.shouldRefreshIndex = true;
        app.globalData.shouldRefreshProfile = true;
      }
    }).catch(err => {
      console.error('收藏失败', err);
    });
  },

  toggleFollow() {
    if (!this.data.authorId) return;
    const userId = wx.getStorageSync('userId') || 1;

    api.followUser(userId, this.data.authorId).then(res => {
      if (res.code === 200) {
        const isFollowing = res.data.following;
        this.setData({ isFollowing });
        wx.showToast({
          title: isFollowing ? '关注成功' : '取消关注',
          icon: 'success'
        });
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

  onShareAppMessage() {
    return {
      title: this.data.detail ? this.data.detail.title : '出发鸭 - 精彩攻略',
      path: '/pages/find-guides/guide-detail/guide-detail?id=' + (this.data.detail ? this.data.detail.id : '')
    };
  }
});
