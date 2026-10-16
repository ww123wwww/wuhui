const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    isFav: false,
    isLiked: false,
    isJoined: false,
    isFollowing: false,
    isCurrentUser: false,
    showAuthorModal: false,
    authorId: null,
    authorBio: '',
    authorFollowCount: 0,
    authorFansCount: 0,
    activityId: null,
    loading: true,
    likeCount: 0,
    collectCount: 0,

    buddy: {
      image: '',
      tags: '旅行搭子',
      title: '',
      avatar: '',
      name: '',
      location: '',
      date: '',
      people: '',
      status: '',
      desc: '',
      itinerary: []
    }
  },

  onLoad(options) {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20,
      activityId: options.id
    });
    if (options.id) {
      this.loadDetail(options.id);
    }
  },

  // 加载活动详情
  loadDetail(id) {
    this.setData({ loading: true });
    const currentUserId = wx.getStorageSync('userId') || 1;

    api.getActivityDetail(id).then(res => {
      if (res.code === 200 && res.data) {
        const item = res.data;
        const statusText = item.status === 1 ? '已满停止招募' : '招募中';
        const joinNum = item.joinNum || 0;
        const totalNum = item.totalNum || 0;
        const missing = totalNum - joinNum;
        const peopleText = missing > 0 ? `缺${missing}人 (${totalNum}人行)` : '已满员';

        // 解析详情中的行程安排
        const itinerary = this.parseItinerary(item.detail || '');

        const authorId = item.userId;
        const isCurrentUser = authorId === currentUserId;

        this.setData({
          buddy: {
            image: item.coverImg || '',
            tags: '旅行搭子',
            title: item.title || '',
            avatar: item.avatarUrl || '',
            name: item.nickname || '匿名用户',
            location: item.address || '',
            date: (item.startDate || '') + (item.endDate ? ' - ' + item.endDate : ''),
            people: peopleText,
            status: statusText,
            desc: item.detail || '',
            itinerary: itinerary
          },
          authorId: authorId,
          isCurrentUser: isCurrentUser,
          isJoined: item.joined || false,
          isLiked: item.liked || false,
          isFav: item.collected || false,
          likeCount: item.likeCount || 0,
          collectCount: item.collectCount || 0,
          loading: false
        });

        // 如果不是当前用户，获取关注状态和作者信息
        if (!isCurrentUser && authorId) {
          this.loadFollowStatus(authorId);
          this.loadAuthorInfo(authorId);
        }
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '活动不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    }).catch(err => {
      console.error('加载详情失败', err);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  // 加载关注状态
  loadFollowStatus(authorId) {
    const userId = wx.getStorageSync('userId') || 1;
    api.getFollowStatus(userId, authorId).then(res => {
      if (res.code === 200) {
        this.setData({ isFollowing: res.data.following });
      }
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
    this.onFollow();
  },

  // 跳转到聊天页面
  goToChat() {
    const authorId = this.data.authorId;
    const authorName = this.data.buddy.name || '匿名用户';
    const authorAvatar = this.data.buddy.avatar || '';
    this.setData({ showAuthorModal: false });
    wx.navigateTo({
      url: `/pages/chat/chat?userId=${authorId}&userName=${encodeURIComponent(authorName)}&avatarUrl=${encodeURIComponent(authorAvatar)}`
    });
  },

  // 解析行程安排（从详情文本中提取 Day 信息）
  parseItinerary(detail) {
    const lines = detail.split('\n');
    const itinerary = [];
    let currentDay = null;
    let currentTitle = '';

    for (const line of lines) {
      const trimmed = line.trim();
      // 匹配 Day1、Day 1、Day1~3 等格式
      const dayMatch = trimmed.match(/^Day\s*(\d+[\-~]?\d*)[：:]\s*(.*)/i);
      if (dayMatch) {
        if (currentDay) {
          itinerary.push({ day: currentDay, title: currentTitle });
        }
        currentDay = 'Day ' + dayMatch[1];
        currentTitle = dayMatch[2] || '';
      } else if (currentDay && trimmed) {
        currentTitle += (currentTitle ? ' ' : '') + trimmed;
      }
    }
    if (currentDay) {
      itinerary.push({ day: currentDay, title: currentTitle });
    }

    // 如果没解析到行程，返回默认提示
    if (itinerary.length === 0) {
      return [{ day: '详情', title: '请查看活动介绍了解行程安排' }];
    }
    return itinerary;
  },

  goBack() {
    wx.navigateBack();
  },

  // 关注/取消关注
  onFollow() {
    if (!this.data.authorId) return;

    const userId = wx.getStorageSync('userId') || 1;
    api.followUser(userId, this.data.authorId).then(res => {
      if (res.code === 200) {
        const isFollowing = res.data.following;
        this.setData({ isFollowing: isFollowing });
        // 设置刷新标记，通知个人中心页面刷新关注数
        app.globalData.shouldRefreshProfile = true;
        wx.showToast({
          title: isFollowing ? '关注成功' : '取消关注成功',
          icon: 'success'
        });
      } else {
        wx.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    }).catch(err => {
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  toggleLike() {
    if (!this.data.activityId) return;

    api.likeActivity(this.data.activityId).then(res => {
      if (res.code === 200) {
        const liked = res.data;
        const likeCount = liked ? this.data.likeCount + 1 : this.data.likeCount - 1;
        this.setData({
          isLiked: liked,
          likeCount: likeCount
        });
        wx.showToast({
          title: liked ? '已点赞' : '取消点赞',
          icon: 'none'
        });
      } else {
        wx.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    }).catch(err => {
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  toggleFav() {
    if (!this.data.activityId) return;

    api.collectActivity(this.data.activityId).then(res => {
      if (res.code === 200) {
        const collected = res.data;
        const collectCount = collected ? this.data.collectCount + 1 : this.data.collectCount - 1;
        this.setData({
          isFav: collected,
          collectCount: collectCount
        });
        wx.showToast({
          title: collected ? '已收藏' : '取消收藏',
          icon: 'none'
        });
      } else {
        wx.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    }).catch(err => {
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  joinActivity() {
    if (!this.data.activityId) return;

    // 如果已加入，退出活动
    if (this.data.isJoined) {
      wx.showModal({
        title: '退出活动',
        content: '确定要退出「' + this.data.buddy.title + '」吗？',
        success: (res) => {
          if (res.confirm) {
            api.quitActivity(this.data.activityId).then(res => {
              if (res.code === 200) {
                wx.showToast({ title: '退出成功', icon: 'success' });
                // 设置刷新标记，通知个人中心页面刷新
                app.globalData.shouldRefreshProfile = true;
                // 重新加载详情刷新状态
                this.loadDetail(this.data.activityId);
              } else {
                wx.showToast({ title: res.message || '退出失败', icon: 'none' });
              }
            }).catch(err => {
              wx.showToast({ title: '退出失败', icon: 'none' });
            });
          }
        }
      });
      return;
    }

    wx.showModal({
      title: '加入活动',
      content: '确定要加入「' + this.data.buddy.title + '」吗？',
      success: (res) => {
        if (res.confirm) {
          api.joinActivity(this.data.activityId).then(res => {
            if (res.code === 200) {
              wx.showToast({ title: '加入成功', icon: 'success' });
              // 设置刷新标记，通知个人中心页面刷新
              app.globalData.shouldRefreshProfile = true;
              // 重新加载详情刷新状态
              this.loadDetail(this.data.activityId);
            } else {
              wx.showToast({ title: res.message || '加入失败', icon: 'none' });
            }
          }).catch(err => {
            wx.showToast({ title: '加入失败', icon: 'none' });
          });
        }
      }
    });
  }
});
