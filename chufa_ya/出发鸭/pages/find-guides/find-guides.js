const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    currentCity: '全部',
    guides: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.loadGuides();
  },

  onShow() {
    // 页面显示时刷新数据，确保从详情页返回时点赞状态同步
    this.setData({
      page: 1,
      hasMore: true,
      guides: []
    });
    this.loadGuides();
  },

  loadGuides() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true });

    const userId = wx.getStorageSync('userId') || 1;
    
    const location = this.data.currentCity === '全部' ? '' : this.data.currentCity;

    api.getContentList(userId, this.data.page, this.data.pageSize, 'travelogue', location).then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        const list = res.data.list || [];
        const guides = list.map(item => {
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
            avatar: item.avatarUrl || '',
            author: item.nickname || '匿名用户',
            likes: item.likeCount || '0',
            isLiked: item.liked || false,
            location: item.location || ''
          };
        });
        
        this.setData({
          guides: this.data.page === 1 ? guides : [...this.data.guides, ...guides],
          hasMore: list.length === this.data.pageSize
        });
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('加载攻略失败', err);
    });
  },

  goBack() {
    wx.navigateBack();
  },

  selectCity() {
    wx.showActionSheet({
      itemList: ['全部', '上海', '北京', '成都', '广州', '深圳'],
      success: (res) => {
        const cities = ['全部', '上海', '北京', '成都', '广州', '深圳'];
        this.setData({ 
          currentCity: cities[res.tapIndex],
          page: 1,
          guides: [],
          hasMore: true
        });
        this.loadGuides();
      }
    });
  },

  viewGuide(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/find-guides/guide-detail/guide-detail?id=' + id
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadGuides();
    }
  }
});