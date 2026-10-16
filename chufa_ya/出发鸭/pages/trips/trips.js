const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    activeTab: 'upcoming',
    upcomingTrips: [],
    historyTrips: [],
    loading: false
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.loadTrips();
  },

  onShow() {
    // 如果标记需要刷新，则重新加载行程
    if (app.globalData.shouldRefreshTrip) {
      this.loadTrips();
      app.globalData.shouldRefreshTrip = false;
    }
  },

  loadTrips() {
    this.setData({ loading: true });
    const userId = wx.getStorageSync('userId') || 1;
    
    api.getUserTrips(userId).then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        const trips = res.data || [];
        // 转换字段名以匹配 WXML
        const transformedTrips = trips.map(trip => {
          return {
            id: trip.id,
            contentId: trip.contentId,
            image: trip.coverUrl || '',
            type: this.getContentTypeLabel(trip.contentType),
            title: trip.title || '',
            date: trip.createdAt ? this.formatDate(trip.createdAt) : '',
            status: trip.status === 'Planning' ? 'Planning' : '已完成'
          };
        });
        const upcomingTrips = transformedTrips.filter(trip => trip.status === 'Planning');
        const historyTrips = transformedTrips.filter(trip => trip.status === '已完成');
        this.setData({
          upcomingTrips,
          historyTrips
        });
      }
    }).catch(err => {
      console.error('加载行程失败', err);
      this.setData({ loading: false });
    });
  },

  getContentTypeLabel(contentType) {
    const labels = {
      'travelogue': '攻略',
      'note': '游记',
      'guide': '自驾游'
    };
    return labels[contentType] || contentType;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    // 简单格式化日期
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  viewTrip(e) {
    const contentId = e.currentTarget.dataset.contentId;
    if (contentId) {
      wx.navigateTo({
        url: '/pages/travel-detail/travel-detail?id=' + contentId
      });
    }
  },

  viewDetail(e) {
    const contentId = e.currentTarget.dataset.contentId;
    if (contentId) {
      wx.navigateTo({
        url: '/pages/travel-detail/travel-detail?id=' + contentId
      });
    }
  },

  finishTrip(e) {
    const tripId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '完成行程',
      content: '确定标记此行程为已完成吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用后端API更新行程状态
          const userId = wx.getStorageSync('userId') || 1;
          api.updateTripStatus(userId, tripId, 'Completed').then(res => {
            if (res.code === 200) {
              wx.showToast({ title: '行程已完成', icon: 'success' });
              this.loadTrips();
            }
          }).catch(err => {
            console.error('更新行程状态失败', err);
          });
        }
      }
    });
  },

  repost(e) {
    const tripId = e.currentTarget.dataset.id;
    const userId = wx.getStorageSync('userId') || 1;
    api.updateTripStatus(userId, tripId, 'Planning').then(res => {
      if (res.code === 200) {
        wx.showToast({ title: '已加入行程', icon: 'success' });
        this.loadTrips(); // 刷新行程列表
      }
    }).catch(err => {
      console.error('再次出发失败', err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  createTrip() {
    wx.switchTab({ url: '/pages/post/post' });
  }
});