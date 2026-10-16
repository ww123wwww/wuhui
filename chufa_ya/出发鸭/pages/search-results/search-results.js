const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    keyword: '',
    searchHistory: [],
    guides: [],
    notes: [],
    roadtrips: [],
    activities: [],
    loading: false
  },

  onLoad(options) {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20,
      keyword: options.keyword || '',
      searchHistory: wx.getStorageSync('searchHistory') || []
    });
    this.loadAllContent();
  },

  goBack() {
    wx.navigateBack();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearchConfirm() {
    const keyword = this.data.keyword.trim();
    if (keyword) {
      this.saveHistory(keyword);
    }
    this.setData({ guides: [], notes: [], roadtrips: [], activities: [], page: 1 });
    this.loadAllContent();
  },

  onTapHistory(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword, guides: [], notes: [], roadtrips: [], activities: [] });
    this.loadAllContent();
  },

  clearHistory() {
    this.setData({ searchHistory: [] });
    wx.removeStorageSync('searchHistory');
  },

  clearSearch() {
    this.setData({ keyword: '', guides: [], notes: [], roadtrips: [], activities: [] });
    this.loadAllContent();
  },

  saveHistory(keyword) {
    let history = this.data.searchHistory.filter(h => h !== keyword);
    history.unshift(keyword);
    if (history.length > 10) history = history.slice(0, 10);
    this.setData({ searchHistory: history });
    wx.setStorageSync('searchHistory', history);
  },

  // 加载所有分类内容
  loadAllContent() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const keyword = this.data.keyword || '';

    // 并行请求四个分类
    Promise.all([
      api.searchContent(keyword, 'travelogue', 1, 10),
      api.searchContent(keyword, 'note', 1, 10),
      api.searchContent(keyword, 'guide', 1, 10),
      api.searchContent(keyword, 'activity', 1, 10)
    ]).then(([guideRes, noteRes, roadtripRes, activityRes]) => {
      this.setData({ loading: false });

      if (guideRes.code === 200) {
        this.setData({ guides: this.processResults(guideRes.data.list || []) });
      }
      if (noteRes.code === 200) {
        this.setData({ notes: this.processResults(noteRes.data.list || []) });
      }
      if (roadtripRes.code === 200) {
        this.setData({ roadtrips: this.processResults(roadtripRes.data.list || []) });
      }
      if (activityRes.code === 200) {
        this.setData({ activities: this.processResults(activityRes.data.list || []) });
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('加载内容失败', err);
    });
  },

  processResults(list) {
    return list.map(item => {
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
        author: item.nickname || '匿名用户',
        avatar: item.avatarUrl || '',
        likes: item.likeCount || 0,
        liked: item.liked || false,
        location: item.location || ''
      };
    });
  },

  viewGuideDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/find-guides/guide-detail/guide-detail?id=' + id });
  },

  viewRoadtripDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/roadtrip/roadtrip-detail/roadtrip-detail?id=' + id });
  },

  viewNoteDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/travel-detail/travel-detail?id=' + id });
  },

  viewActivityDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/buddy-detail/buddy-detail?id=' + id });
  }
});
