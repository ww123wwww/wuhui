const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    buddies: [],
    page: 1,
    size: 10,
    total: 0,
    loading: false,
    hasMore: true,
    searchKeyword: ''
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.loadActivities();
  },

  onShow() {
    // 每次显示页面时刷新列表（发布新活动后返回）
    this.setData({ page: 1, buddies: [], hasMore: true });
    this.loadActivities();
  },

  // 加载活动列表
  loadActivities() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const { page, size, searchKeyword } = this.data;

    const request = searchKeyword
      ? api.searchActivities(searchKeyword, page, size)
      : api.getActivityList(page, size);

    request.then(res => {
      if (res.code === 200) {
        const newList = res.data.list || [];
        const mapped = newList.map(item => this.formatActivity(item));
        this.setData({
          buddies: page === 1 ? mapped : this.data.buddies.concat(mapped),
          total: res.data.total || 0,
          hasMore: mapped.length >= size,
          page: page + 1
        });
      }
    }).catch(err => {
      console.error('加载活动失败', err);
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  // 格式化活动数据用于展示
  formatActivity(item) {
    const currentUserId = wx.getStorageSync('userId');
    const statusText = item.status === 1 ? '已满停止招募' : '招募中';
    const joinNum = item.joinNum || 0;
    const totalNum = item.totalNum || 0;
    const missing = totalNum - joinNum;
    const peopleText = missing > 0 ? `${totalNum}人行缺${missing}人` : '已满员';

    return {
      id: item.activityId,
      avatar: item.avatarUrl || '',
      name: item.nickname || '匿名用户',
      title: item.title || '',
      location: item.address || '',
      date: (item.startDate || '') + (item.endDate ? ' - ' + item.endDate : ''),
      people: peopleText,
      desc: item.detail || '',
      status: item.status,
      statusText: statusText,
      joined: item.joined || false,
      isOwner: item.userId == currentUserId
    };
  },

  goBack() {
    wx.navigateBack();
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 搜索
  onSearch() {
    this.setData({ page: 1, buddies: [], hasMore: true });
    this.loadActivities();
  },

  // 查看详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/buddy-detail/buddy-detail?id=' + id
    });
  },

  // 加入活动
  joinActivity(e) {
    const id = e.currentTarget.dataset.id;
    const joined = e.currentTarget.dataset.joined;

    // 如果已加入，退出活动
    if (joined) {
      wx.showModal({
        title: '退出活动',
        content: '确定要退出这个活动吗？',
        success: (res) => {
          if (res.confirm) {
            api.quitActivity(id).then(res => {
              if (res.code === 200) {
                wx.showToast({ title: '退出成功', icon: 'success' });
                // 设置刷新标记，通知个人中心页面刷新
                app.globalData.shouldRefreshProfile = true;
                // 刷新列表
                this.setData({ page: 1, buddies: [], hasMore: true });
                this.loadActivities();
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
      content: '确定要加入这个活动吗？',
      success: (res) => {
        if (res.confirm) {
          api.joinActivity(id).then(res => {
            if (res.code === 200) {
              wx.showToast({ title: '加入成功', icon: 'success' });
              // 设置刷新标记，通知个人中心页面刷新
              app.globalData.shouldRefreshProfile = true;
              // 刷新列表
              this.setData({ page: 1, buddies: [], hasMore: true });
              this.loadActivities();
            } else {
              wx.showToast({ title: res.message || '加入失败', icon: 'none' });
            }
          }).catch(err => {
            wx.showToast({ title: '加入失败', icon: 'none' });
          });
        }
      }
    });
  },

  // 跳转发布活动页
  goPublishActivity() {
    wx.navigateTo({
      url: '/pages/publish-activity/publish-activity'
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 1, buddies: [], hasMore: true });
    this.loadActivities();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadActivities();
    }
  }
});
