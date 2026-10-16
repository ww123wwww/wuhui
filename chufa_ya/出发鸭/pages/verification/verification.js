const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    phone: '',
    code: '',
    isAgreed: false,
    isCounting: false,
    isLoggingIn: false,
    countdown: 60,
    countdownText: '60秒后重新获取'
  },

  countdownTimer: null,

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
  },

  onUnload() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
    app.globalData.loginPhone = e.detail.value;
  },

  onCodeInput(e) {
    this.setData({ code: e.detail.value });
  },

  onAgreementChange(e) {
    const isChecked = e.detail.value.includes('agree');
    this.setData({ isAgreed: isChecked });
  },

  goBack() {
    wx.redirectTo({ url: '/pages/login/login' });
  },

  switchToPasswordLogin() {
    wx.redirectTo({ url: '/pages/login/login' });
  },

  getVerificationCode() {
    const phone = this.data.phone || app.globalData.loginPhone;
    if (!phone) {
      wx.showToast({ title: '请输入手机号码', icon: 'none' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号码', icon: 'none' });
      return;
    }
    if (this.data.isCounting) {
      return;
    }

    api.sendVerifyCode(phone).then(res => {
      if (res.code === 200) {
        wx.showToast({ title: '验证码已发送', icon: 'success' });
        this.startCountdown();
      } else {
        wx.showToast({ title: res.message || '发送失败', icon: 'none' });
      }
    }).catch(err => {
      wx.showToast({ title: '发送失败', icon: 'none' });
    });
  },

  startCountdown() {
    this.setData({ isCounting: true, countdown: 60 });
    this.updateCountdownText();

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    this.countdownTimer = setInterval(() => {
      if (this.data.countdown > 1) {
        this.setData({ countdown: this.data.countdown - 1 });
        this.updateCountdownText();
      } else {
        clearInterval(this.countdownTimer);
        this.setData({ isCounting: false });
      }
    }, 1000);
  },

  updateCountdownText() {
    this.setData({ countdownText: this.data.countdown + '秒后重新获取' });
  },

  loginWithCode() {
    if (this.data.isLoggingIn) return;

    const phone = this.data.phone || app.globalData.loginPhone;
    if (!phone) {
      wx.showToast({ title: '请输入手机号码', icon: 'none' });
      return;
    }
    if (!this.data.code) {
      wx.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }
    if (!this.data.isAgreed) {
      wx.showToast({ title: '请阅读并同意协议', icon: 'none' });
      return;
    }

    this.setData({ isLoggingIn: true });
    wx.showLoading({ title: '登录中...' });

    api.loginByCode(phone, this.data.code).then(res => {
      wx.hideLoading();
      this.setData({ isLoggingIn: false });
      if (res.code === 200) {
        const userData = res.data;
        if (userData.needSetPassword) {
          // 新用户，跳转到设置密码页
          wx.redirectTo({ url: '/pages/set-password/set-password?phone=' + userData.phone });
        } else {
          // 已注册用户，直接登录
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
        }
      } else {
        wx.showToast({ title: res.message || '登录失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      this.setData({ isLoggingIn: false });
      wx.showToast({ title: (err && err.message) || '登录失败', icon: 'none' });
    });
  }
});
