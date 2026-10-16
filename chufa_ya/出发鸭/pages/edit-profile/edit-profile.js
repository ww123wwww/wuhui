const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    avatar: '',
    nickname: '',
    bio: '',
    bioLength: 0,
    showPasswordModal: false,
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    loading: false
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userId = wx.getStorageSync('userId') || 1;

    api.getUserInfo(userId).then(res => {
      if (res.code === 200 && res.data) {
        this.setData({
          avatar: res.data.avatarUrl || '',
          nickname: res.data.nickname || '',
          bio: res.data.bio || '',
          bioLength: res.data.bio?.length || 0
        });
      }
    }).catch(err => {
      console.error('加载用户信息失败', err);
    });
  },

  goBack() {
    wx.navigateBack();
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  onBioInput(e) {
    this.setData({
      bio: e.detail.value,
      bioLength: e.detail.value.length
    });
  },

  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ avatar: res.tempFilePaths[0] });
      }
    });
  },

  saveProfile() {
    if (this.data.loading) return;
    if (!this.data.nickname) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });
    const userId = wx.getStorageSync('userId') || 1;

    api.updateUserInfo(userId, {
      nickname: this.data.nickname,
      bio: this.data.bio,
      avatarUrl: this.data.avatar
    }).then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        wx.showToast({
          title: '已保存',
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    }).catch(err => {
      this.setData({ loading: false });
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
      console.error('保存用户信息失败', err);
    });
  },

  onOldPasswordInput(e) {
    this.setData({ oldPassword: e.detail.value });
  },

  onNewPasswordInput(e) {
    this.setData({ newPassword: e.detail.value });
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmNewPassword: e.detail.value });
  },

  showPasswordModal() {
    this.setData({
      showPasswordModal: true,
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  },

  hidePasswordModal() {
    this.setData({
      showPasswordModal: false,
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  },

  confirmPassword() {
    const { oldPassword, newPassword, confirmNewPassword } = this.data;

    if (!oldPassword) {
      wx.showToast({ title: '请输入原密码', icon: 'none' });
      return;
    }
    if (!newPassword) {
      wx.showToast({ title: '请输入新密码', icon: 'none' });
      return;
    }
    if (newPassword.length < 6) {
      wx.showToast({ title: '新密码长度不能少于6位', icon: 'none' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      wx.showToast({ title: '两次输入的密码不一致', icon: 'none' });
      return;
    }

    api.changePassword(oldPassword, newPassword).then(res => {
      if (res.code === 200) {
        wx.showToast({ title: '密码已修改', icon: 'success' });
        this.setData({
          showPasswordModal: false,
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      }
    }).catch(err => {
      console.error('修改密码失败', err);
    });
  },

  noop() {}
});