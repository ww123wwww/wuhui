const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    currentTab: 'publish',
    tabs: [
      { id: 'publish', name: '我的发布' },
      { id: 'liked', name: '赞过' },
      { id: 'favorites', name: '我的收藏' },
      { id: 'events', name: '我的活动' }
    ],
    userInfo: null,
    leftPosts: [],
    rightPosts: [],
    allPosts: [],
    likedPosts: [],
    favoritePosts: [],
    joinedActivities: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    activeMenuPostId: null
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.loadUserInfo();
    this.loadUserContentList();
  },

  onShow() {
    this.loadUserInfo();
    const shouldRefresh = app.globalData.shouldRefreshProfile || false;
    if (shouldRefresh) {
      app.globalData.shouldRefreshProfile = false;
      this.setData({ page: 1, hasMore: true, leftPosts: [], rightPosts: [], allPosts: [], likedPosts: [], favoritePosts: [], joinedActivities: [] });
      if (this.data.currentTab === 'publish') {
        this.loadUserContentList();
      } else if (this.data.currentTab === 'liked') {
        this.loadLikedList();
      } else if (this.data.currentTab === 'favorites') {
        this.loadFavoriteList();
      } else if (this.data.currentTab === 'events') {
        this.loadJoinedActivities();
      }
    }
  },

  loadUserInfo() {
    const userId = wx.getStorageSync('userId') || 1;

    api.getUserInfo(userId).then(res => {
      if (res.code === 200) {
        const userInfo = res.data;
        // 确保关注数和粉丝数有默认值0
        userInfo.followCount = userInfo.followCount || 0;
        userInfo.fansCount = userInfo.fansCount || 0;
        this.setData({ userInfo });
      }
    }).catch(err => {
      console.error('获取用户信息失败', err);
    });
  },

  loadUserContentList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const userId = wx.getStorageSync('userId') || 1;

    api.getUserContentList(userId, this.data.page, this.data.pageSize).then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        const list = res.data.list || [];
        this.processUserContentList(list);
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('获取用户内容列表失败', err);
    });
  },

  refreshUserContentList() {
    this.setData({ page: 1, hasMore: true, allPosts: [], leftPosts: [], rightPosts: [], likedPosts: [], favoritePosts: [] });
    this.loadUserContentList();
    this.loadUserInfo();
  },

  loadLikedList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const userId = wx.getStorageSync('userId') || 1;

    api.getUserLikeList(userId, this.data.page, this.data.pageSize).then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        const list = res.data.list || [];
        this.processLikedList(list);
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('获取赞过列表失败', err);
    });
  },

  loadFavoriteList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const userId = wx.getStorageSync('userId') || 1;

    api.getUserCollectionList(userId, this.data.page, this.data.pageSize).then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        const list = res.data.list || [];
        this.processFavoriteList(list);
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('获取收藏列表失败', err);
    });
  },

  loadJoinedActivities() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    api.getJoinedActivities(this.data.page, this.data.pageSize).then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        const list = res.data.list || [];
        this.processJoinedActivities(list);
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('获取已加入活动列表失败', err);
    });
  },

  processJoinedActivities(list) {
    const activities = list.map(item => {
      const statusText = item.status === 1 ? '已满员' : '招募中';
      const joinNum = item.joinNum || 0;
      const totalNum = item.totalNum || 0;

      return {
        id: item.activityId,
        title: item.title || '',
        coverImg: item.coverImg || '',
        address: item.address || '',
        date: (item.startDate || '') + (item.endDate ? ' - ' + item.endDate : ''),
        people: `${joinNum}/${totalNum}人`,
        status: item.status,
        statusText: statusText
      };
    });

    let allActivities;
    if (this.data.page === 1) {
      allActivities = activities;
    } else {
      allActivities = [...this.data.joinedActivities, ...activities];
    }

    this.setData({
      joinedActivities: allActivities,
      hasMore: activities.length >= this.data.pageSize
    });
  },

  processLikedList(list) {
    let allLikedPosts;
    if (this.data.page === 1) {
      allLikedPosts = list;
    } else {
      allLikedPosts = [...this.data.likedPosts, ...list];
    }

    this.setData({ likedPosts: allLikedPosts });
    this.distributePosts(allLikedPosts);
  },

  processFavoriteList(list) {
    let allFavoritePosts;
    if (this.data.page === 1) {
      allFavoritePosts = list;
    } else {
      allFavoritePosts = [...this.data.favoritePosts, ...list];
    }

    this.setData({ favoritePosts: allFavoritePosts });
    this.distributePosts(allFavoritePosts);
  },

  processUserContentList(list) {
    if (this.data.page === 1) {
      this.setData({ allPosts: list });
    } else {
      this.setData({ allPosts: [...this.data.allPosts, ...list] });
    }

    this.distributePosts(this.data.allPosts);
  },

  distributePosts(posts) {
    const allPosts = posts.map((post, index) => {
      let imgHeight = 300 + (index % 3) * 50;
      let imageUrl = post.coverUrl;
      if (!imageUrl && post.imageList) {
        try {
          const imgArr = typeof post.imageList === 'string' ? JSON.parse(post.imageList) : post.imageList;
          imageUrl = imgArr[0] || '';
        } catch (e) {
          imageUrl = '';
        }
      }
      return {
        id: post.id,
        image: imageUrl || '',
        title: post.title || '无标题',
        likes: post.likes || '0',
        liked: post.liked || false,
        imgHeight: imgHeight,
        contentType: post.contentType || 'note'
      };
    });

    const left = [];
    const right = [];
    let leftHeight = 0;
    let rightHeight = 0;

    allPosts.forEach(post => {
      if (leftHeight <= rightHeight) {
        left.push(post);
        leftHeight += post.imgHeight;
      } else {
        right.push(post);
        rightHeight += post.imgHeight;
      }
    });

    this.setData({ leftPosts: left, rightPosts: right, hasMore: allPosts.length >= this.data.pageSize });
  },

  switchTab(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ currentTab: id, page: 1, hasMore: true, leftPosts: [], rightPosts: [], joinedActivities: [] });

    if (id === 'publish') {
      this.loadUserContentList();
    } else if (id === 'liked') {
      this.loadLikedList();
    } else if (id === 'favorites') {
      this.loadFavoriteList();
    } else if (id === 'events') {
      this.loadJoinedActivities();
    }
  },

  editProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    });
  },

  logout() {
    const userId = wx.getStorageSync('userId') || 1;

    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          api.request({
            url: api.config.USER_LOGOUT,
            method: 'POST',
            data: { userId }
          }).then(() => {
            wx.clearStorageSync();
            wx.redirectTo({ url: '/pages/login/login' });
          }).catch(() => {
            wx.clearStorageSync();
            wx.redirectTo({ url: '/pages/login/login' });
          });
        }
      }
    });
  },

  viewPost(e) {
    // 关闭已打开的菜单
    if (this.data.activeMenuPostId) {
      this.setData({ activeMenuPostId: null });
      return;
    }
    const id = e.currentTarget.dataset.id;
    const contentType = e.currentTarget.dataset.type;
    if (contentType === 'activity') {
      wx.navigateTo({
        url: '/pages/buddy-detail/buddy-detail?id=' + id
      });
    } else {
      wx.navigateTo({
        url: '/pages/travel-detail/travel-detail?id=' + id
      });
    }
  },

  togglePostMenu(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      activeMenuPostId: this.data.activeMenuPostId === id ? null : id
    });
  },

  onDeletePost(e) {
    const contentId = e.currentTarget.dataset.id;
    this.setData({ activeMenuPostId: null });
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条作品吗？删除后无法恢复。',
      confirmColor: '#ba1a1a',
      success: (res) => {
        if (res.confirm) {
          api.deleteContent(contentId).then(res => {
            if (res.code === 200) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              this.refreshUserContentList();
            } else {
              wx.showToast({ title: res.message || '删除失败', icon: 'none' });
            }
          }).catch(() => {
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  viewActivity(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/buddy-detail/buddy-detail?id=' + id
    });
  }
});