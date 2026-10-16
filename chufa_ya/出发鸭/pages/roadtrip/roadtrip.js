const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    routes: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.loadRoutes();
  },

  onShow() {
    // 页面显示时刷新数据，确保从详情页返回时点赞状态同步
    this.setData({
      page: 1,
      hasMore: true,
      routes: []
    });
    this.loadRoutes();
  },

  loadRoutes() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true });

    const userId = wx.getStorageSync('userId') || 1;

    api.getContentList(userId, this.data.page, this.data.pageSize, 'guide').then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        const list = res.data.list || [];
        const routes = list.map(item => {
          let imageUrl = item.coverUrl;
          if (!imageUrl && item.imageList) {
            try {
              const imgArr = typeof item.imageList === 'string' ? JSON.parse(item.imageList) : item.imageList;
              imageUrl = imgArr[0] || '';
            } catch (e) {
              imageUrl = '';
            }
          }
          return {
            id: item.id,
            image: imageUrl || '',
            title: item.title || '无标题',
            location: item.location || '未知地点',
            days: '5 Days',
            distance: '450km',
            difficulty: '中等难度',
            badge: ''
          };
        });
        
        this.setData({
          routes: this.data.page === 1 ? routes : [...this.data.routes, ...routes],
          hasMore: list.length === this.data.pageSize
        });
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('加载自驾游失败', err);
    });
  },

  goBack() {
    wx.navigateBack();
  },

  viewRoute(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/roadtrip/roadtrip-detail/roadtrip-detail?id=' + id
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadRoutes();
    }
  }
});