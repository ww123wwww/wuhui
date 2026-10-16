const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    selectedType: 'note',
    title: '',
    content: '',
    location: '',
    coverUrl: '',
    imageList: [],
    uploadedImages: [],
    topicIds: '',
    loading: false,
    uploading: false
  },

  onLoad(options) {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });

    if (options.draftId) {
      this.loadDraft(options.draftId);
    }
  },

  loadDraft(draftId) {
    const userId = wx.getStorageSync('userId') || 1;
    api.getDraftDetail(userId, draftId).then(res => {
      if (res.code === 200 && res.data) {
        this.setData({
          title: res.data.title || '',
          content: res.data.content || '',
          location: res.data.location || '',
          coverUrl: res.data.coverUrl || '',
          uploadedImages: res.data.imageList ? JSON.parse(res.data.imageList) : [],
          imageList: res.data.imageList ? JSON.parse(res.data.imageList) : [],
          topicIds: res.data.topicIds || ''
        });
      }
    }).catch(err => {
      console.error('加载草稿失败', err);
    });
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onLocationInput(e) {
    this.setData({ location: e.detail.value });
  },

  chooseImage() {
    const that = this;
    wx.chooseImage({
      count: 9 - this.data.imageList.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        that.setData({ uploading: true });

        const uploadPromises = tempFilePaths.map(path => {
          return api.uploadImage(path).then(uploadRes => {
            return uploadRes.data;
          }).catch(err => {
            console.error('上传图片失败', err);
            return null;
          });
        });

        Promise.all(uploadPromises).then(uploadedUrls => {
          const validUrls = uploadedUrls.filter(url => url !== null);
          const newUploadedImages = [...that.data.uploadedImages, ...validUrls];
          const newImageList = [...that.data.imageList, ...tempFilePaths];

          that.setData({
            uploading: false,
            uploadedImages: newUploadedImages,
            imageList: newImageList
          });

          if (newUploadedImages.length > 0 && !that.data.coverUrl) {
            that.setData({ coverUrl: newUploadedImages[0] });
          }
        });
      }
    });
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const uploadedImages = [...this.data.uploadedImages];
    const imageList = [...this.data.imageList];
    uploadedImages.splice(index, 1);
    imageList.splice(index, 1);
    this.setData({
      uploadedImages,
      imageList,
      coverUrl: index === 0 ? (uploadedImages[0] || '') : this.data.coverUrl
    });
  },

  setCover(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ coverUrl: this.data.uploadedImages[index] });
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedType: this.data.selectedType === type ? '' : type
    });
  },

  selectLocation() {
    const locations = ['上海', '北京', '成都', '广州', '深圳'];
    wx.showActionSheet({
      itemList: locations,
      success: (res) => {
        this.setData({
          location: locations[res.tapIndex]
        });
      }
    });
  },

  saveDraft() {
    const userId = wx.getStorageSync('userId') || 1;
    const draftData = {
      title: this.data.title,
      content: this.data.content,
      location: this.data.location,
      coverUrl: this.data.coverUrl,
      imageList: JSON.stringify(this.data.uploadedImages),
      topicIds: this.data.topicIds,
      contentType: this.data.selectedType
    };

    api.saveDraft(userId, draftData).then(res => {
      wx.showToast({
        title: '草稿已保存',
        icon: 'success'
      });
    }).catch(err => {
      console.error('保存草稿失败', err);
    });
  },

  publish() {
    if (this.data.loading) return;

    if (!this.data.title && !this.data.content) {
      wx.showToast({
        title: '请输入标题或内容',
        icon: 'none'
      });
      return;
    }

    if (this.data.uploading) {
      wx.showToast({
        title: '图片上传中，请稍候',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    const userId = wx.getStorageSync('userId') || 1;
    const contentData = {
      contentType: this.data.selectedType || 'note',
      title: this.data.title,
      content: this.data.content,
      location: this.data.location,
      coverUrl: this.data.coverUrl,
      imageList: JSON.stringify(this.data.uploadedImages),
      topicIds: this.data.topicIds
    };

    api.publishContent(userId, contentData).then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        });

        app.globalData.shouldRefreshIndex = true;
        app.globalData.shouldRefreshProfile = true;

        this.clearForm();

        setTimeout(() => {
          wx.switchTab({ url: '/pages/profile/profile' });
        }, 1500);
      }
    }).catch(err => {
      this.setData({ loading: false });
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      });
      console.error('发布失败', err);
    });
  },

  clearForm() {
    this.setData({
      title: '',
      content: '',
      location: '',
      coverUrl: '',
      imageList: [],
      uploadedImages: [],
      topicIds: ''
    });
  },

  goBack() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});