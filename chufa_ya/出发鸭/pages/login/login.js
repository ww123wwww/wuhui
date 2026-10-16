const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    username: '',
    password: '',
    isAgreed: false
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });

    // 检查是否已登录
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (isLoggedIn) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onAgreementChange(e) {
    const isChecked = e.detail.value.includes('agree');
    this.setData({ isAgreed: isChecked });
  },

  switchToVerification() {
    wx.redirectTo({ url: '/pages/verification/verification' });
  },

  login() {
    if (!this.data.username) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }
    if (!this.data.password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (!this.data.isAgreed) {
      wx.showToast({ title: '请阅读并同意协议', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    api.login(this.data.username, this.data.password).then(res => {
      wx.hideLoading();
      if (res.code === 200) {
        const userData = res.data;
        wx.setStorageSync('isLoggedIn', true);
        wx.setStorageSync('userId', userData.userId);
        wx.setStorageSync('nickname', userData.nickname);
        wx.setStorageSync('duckId', userData.duckId);
        if (userData.avatarUrl) {
          wx.setStorageSync('avatarUrl', userData.avatarUrl);
        }
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 1000);
      } else {
        wx.showToast({ title: res.message || '登录失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '登录失败', icon: 'none' });
    });
  }
});
