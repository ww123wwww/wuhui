const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    phone: '',
    password: '',
    confirmPassword: ''
  },

  onLoad(options) {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });

    // 获取传递过来的手机号（优先从URL参数，其次从globalData）
    const phone = (options && options.phone) || app.globalData.loginPhone || '';
    if (phone) {
      this.setData({ phone: phone });
      app.globalData.loginPhone = phone;
    }
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  goBack() {
    wx.redirectTo({ url: '/pages/verification/verification' });
  },

  setPassword() {
    if (!this.data.password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (this.data.password.length < 6) {
      wx.showToast({ title: '密码长度不能少于6位', icon: 'none' });
      return;
    }
    if (this.data.password.length > 20) {
      wx.showToast({ title: '密码长度不能超过20位', icon: 'none' });
      return;
    }
    if (!this.data.confirmPassword) {
      wx.showToast({ title: '请再次输入密码', icon: 'none' });
      return;
    }
    if (this.data.password !== this.data.confirmPassword) {
      wx.showToast({ title: '两次输入的密码不一致', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '注册中...' });

    api.register(this.data.phone, this.data.password, '').then(res => {
      wx.hideLoading();
      if (res.code === 200) {
        const userData = res.data;
        wx.setStorageSync('isLoggedIn', true);
        wx.setStorageSync('userId', userData.userId);
        wx.setStorageSync('nickname', userData.nickname);
        wx.setStorageSync('duckId', userData.duckId);
        wx.showToast({ title: '注册成功', icon: 'success' });
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 1000);
      } else {
        wx.showToast({ title: res.message || '注册失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '注册失败', icon: 'none' });
    });
  }
});
