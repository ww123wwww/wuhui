const app = getApp();
const api = require('../../api/request.js');

Page({
  data: {
    statusBarHeight: 0,
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    recommends: [],
    leftPosts: [],
    rightPosts: [],
    allPosts: []
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.loadContentList();
  },

  onShow() {
    if (app.globalData.shouldRefreshIndex) {
      app.globalData.shouldRefreshIndex = false;
      this.refreshContentList();
    }
  },

  onPullDownRefresh() {
    this.refreshContentList();
  },

  loadContentList() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const userId = wx.getStorageSync('userId') || 1;

    api.getContentList(userId, this.data.page, this.data.pageSize, 'note').then(res => {
      this.setData({ loading: false });
      if (res.code === 200) {
        const list = res.data.list || [];
        console.log('获取到的内容列表:', list);
        this.processContentList(list);
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('加载内容列表失败', err);
    });
  },

  refreshContentList() {
    this.setData({ page: 1, hasMore: true, recommends: [], leftPosts: [], rightPosts: [], allPosts: [] });
    this.loadContentList();
  },

  loadMoreContent() {
    this.setData({ page: this.data.page + 1 });
    this.loadContentList();
  },

  processContentList(list) {
    const newPosts = list.map(item => {
      let imageUrl = item.image || item.coverUrl;
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
        likes: item.likes || String(item.likeCount || '0'),
        likeCount: item.likeCount || 0,
        author: item.author || item.nickname || '匿名用户',
        avatar: item.avatar || item.avatarUrl || '',
        username: item.username || item.nickname || '',
        location: item.location || '',
        isLiked: item.liked || false,
        imgHeight: 280 + Math.random() * 200,
        badge: item.badge || false,
        badgeDate: item.badgeDate || '',
        badgeText: item.badgeText || ''
      };
    });

    console.log('处理后的帖子列表:', newPosts);

    const recommends = newPosts.slice(0, 2).map((item, index) => {
      return {
        id: item.id,
        image: item.image,
        title: item.title,
        author: item.author,
        likes: item.likes,
        avatar: item.avatar,
        isFirst: index === 0,
        badge: item.badge || (index === 0),
        badgeDate: item.badgeDate || '',
        badgeText: item.badgeText || (index === 0 ? '今日榜首' : '')
      };
    });

    console.log('推荐列表:', recommends);

    const posts = this.data.page === 1 ? newPosts : [...this.data.allPosts, ...newPosts];
    
    const leftPosts = [];
    const rightPosts = [];
    
    posts.forEach((post, index) => {
      if (index % 2 === 0) {
        leftPosts.push(post);
      } else {
        rightPosts.push(post);
      }
    });

    console.log('左列:', leftPosts, '右列:', rightPosts);

    this.setData({
      recommends: this.data.page === 1 ? recommends : [...this.data.recommends, ...recommends],
      leftPosts: leftPosts,
      rightPosts: rightPosts,
      allPosts: posts,
      hasMore: newPosts.length >= this.data.pageSize
    });

    if (this.data.page === 1) {
      wx.stopPullDownRefresh();
    }
  },

  viewPost(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/travel-detail/travel-detail?id=' + id
    });
  },

  onLike(e) {
    const id = e.currentTarget.dataset.id;
    const isLiked = e.currentTarget.dataset.liked;
    const userId = wx.getStorageSync('userId') || 1;

    api.likeContent(userId, id, 'note').then(res => {
      if (res.code === 200) {
        const liked = res.data.liked;
        const delta = liked ? 1 : -1;

        // 更新左列
        const leftPosts = this.data.leftPosts.map(post => {
          if (post.id === id) {
            return {
              ...post,
              isLiked: liked,
              likes: String((parseInt(post.likes) || 0) + delta)
            };
          }
          return post;
        });

        // 更新右列
        const rightPosts = this.data.rightPosts.map(post => {
          if (post.id === id) {
            return {
              ...post,
              isLiked: liked,
              likes: String((parseInt(post.likes) || 0) + delta)
            };
          }
          return post;
        });

        this.setData({ leftPosts, rightPosts });
      }
    }).catch(err => {
      console.error('点赞失败', err);
    });
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  goToGuides() {
    wx.navigateTo({
      url: '/pages/find-guides/find-guides'
    });
  },

  goToRoadtrip() {
    wx.navigateTo({
      url: '/pages/roadtrip/roadtrip'
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreContent();
    }
  },

  // 点击搜索栏跳转搜索页
  onSearch() {
    wx.navigateTo({
      url: '/pages/search-results/search-results'
    });
  }
});