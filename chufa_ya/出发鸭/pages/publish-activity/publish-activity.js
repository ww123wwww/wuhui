const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    coverImage: '',
    coverUrl: '', // 上传后的封面URL
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    dateRange: '',
    peopleCount: 3,
    description: '',
    isSubmitting: false
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
  },

  goBack() {
    wx.navigateBack();
  },

  // 选择封面图并上传
  chooseCover() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths[0];
        this.setData({ coverImage: filePath });

        // 上传图片到服务器
        wx.showLoading({ title: '上传中...' });
        api.uploadImage(filePath).then(res => {
          wx.hideLoading();
          if (res.code === 200 && res.data) {
            this.setData({ coverUrl: res.data.url || res.data });
            wx.showToast({ title: '上传成功', icon: 'success' });
          }
        }).catch(err => {
          wx.hideLoading();
          console.error('上传封面失败', err);
          wx.showToast({ title: '上传失败', icon: 'none' });
        });
      }
    });
  },

  // 输入标题
  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  // 选择目的地
  chooseDestination() {
    const locations = ['上海', '北京', '成都', '广州', '深圳'];
    wx.showActionSheet({
      itemList: locations,
      success: (res) => {
        this.setData({ destination: locations[res.tapIndex] });
      }
    });
  },

  // 选择日期
  chooseDate() {
    // 使用小程序日期选择器，先选开始日期
    wx.showActionSheet({
      itemList: ['选择出发日期', '选择结束日期'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.pickStartDate();
        } else {
          this.pickEndDate();
        }
      }
    });
  },

  pickStartDate() {
    wx.showModal({
      title: '出发日期',
      editable: true,
      placeholderText: '请输入出发日期，如：4月15日',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({ startDate: res.content });
          this.updateDateRange();
        }
      }
    });
  },

  pickEndDate() {
    wx.showModal({
      title: '结束日期',
      editable: true,
      placeholderText: '请输入结束日期，如：4月22日',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({ endDate: res.content });
          this.updateDateRange();
        }
      }
    });
  },

  updateDateRange() {
    const { startDate, endDate } = this.data;
    if (startDate && endDate) {
      this.setData({ dateRange: startDate + ' - ' + endDate });
    } else if (startDate) {
      this.setData({ dateRange: startDate + ' - 待定' });
    }
  },

  // 人数减
  decreasePeople() {
    if (this.data.peopleCount > 2) {
      this.setData({ peopleCount: this.data.peopleCount - 1 });
    }
  },

  // 人数加
  increasePeople() {
    if (this.data.peopleCount < 20) {
      this.setData({ peopleCount: this.data.peopleCount + 1 });
    }
  },

  // 输入描述
  onDescInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 提交发布
  submitPublish() {
    if (this.data.isSubmitting) return;

    // 表单校验
    if (!this.data.title.trim()) {
      wx.showToast({ title: '请输入活动标题', icon: 'none' });
      return;
    }
    if (!this.data.destination) {
      wx.showToast({ title: '请选择目的地', icon: 'none' });
      return;
    }
    if (!this.data.startDate) {
      wx.showToast({ title: '请选择出发日期', icon: 'none' });
      return;
    }
    if (!this.data.endDate) {
      wx.showToast({ title: '请选择结束日期', icon: 'none' });
      return;
    }

    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '发布中...' });

    const activityData = {
      coverImg: this.data.coverUrl || '',
      title: this.data.title.trim(),
      address: this.data.destination,
      startDate: this.data.startDate,
      endDate: this.data.endDate,
      totalNum: this.data.peopleCount,
      detail: this.data.description || ''
    };

    api.publishActivity(activityData).then(res => {
      wx.hideLoading();
      this.setData({ isSubmitting: false });

      if (res.code === 200) {
        wx.showToast({ title: '发布成功', icon: 'success' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: res.message || '发布失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.setData({ isSubmitting: false });
      console.error('发布失败', err);
      wx.showToast({ title: '发布失败', icon: 'none' });
    });
  }
});
