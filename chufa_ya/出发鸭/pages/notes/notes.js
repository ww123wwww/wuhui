const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    currentFilter: 'all',
    locations: [],
    leftPosts: [],
    rightPosts: [],
    allPosts: [],
    loading: false,
    page: 1,
    pageSize: 20
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.loadLocations();
    this.loadNotes();
  },

  onShow() {
    // 页面显示时刷新数据，确保从详情页返回时点赞状态同步
    this.setData({
      page: 1
    });
    this.loadNotes();
  },

  loadLocations() {
    // 获取所有可用地点（从后端或静态数据）
    const locations = [
      { id: 'all', name: '全部', icon: '/static/app_tabbar/全部.png' },
      { id: '上海', name: '上海', icon: '/static/app_tabbar/上海.png' },
      { id: '北京', name: '北京', icon: '/static/app_tabbar/北京.png' },
      { id: '成都', name: '成都', icon: '/static/app_tabbar/成都.png' },
      { id: '广州', name: '广州', icon: '/static/app_tabbar/广州.png' },
      { id: '深圳', name: '深圳', icon: '/static/app_tabbar/深圳.png' }
    ];
    this.setData({ locations });
  },

  loadNotes() {
    this.setData({ loading: true });
    const userId = wx.getStorageSync('userId') || 1;
    const location = this.data.currentFilter === 'all' ? '' : this.data.currentFilter;

    api.getContentList(userId, this.data.page, this.data.pageSize, 'note', location).then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        const list = res.data.list || [];
        const posts = list.map(item => ({
          id: item.id,
          image: item.coverUrl || '',
          title: item.title || '',
          rating: '',
          avatar: item.avatarUrl || '',
          username: item.nickname || '匿名用户',
          likes: item.likeCount || 0,
          isLiked: item.liked || false,
          imgHeight: this.getRandomHeight()
        }));
        this.setData({ allPosts: posts });
        this.distributePosts();
      }
    }).catch(err => {
      console.error('加载游记失败', err);
      this.setData({ loading: false });
    });
  },

  getRandomHeight() {
    return 340 + Math.floor(Math.random() * 100);
  },

  distributePosts() {
    const posts = this.data.allPosts;
    const left = [];
    const right = [];
    let leftHeight = 0;
    let rightHeight = 0;

    posts.forEach(post => {
      if (leftHeight <= rightHeight) {
        left.push(post);
        leftHeight += post.imgHeight;
      } else {
        right.push(post);
        rightHeight += post.imgHeight;
      }
    });

    this.setData({ leftPosts: left, rightPosts: right });
  },

  selectFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ 
      currentFilter: filter,
      page: 1 
    });
    this.loadNotes();
  },

  goBack() {
    wx.navigateBack();
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/travel-detail/travel-detail?id=' + id
    });
  }
});