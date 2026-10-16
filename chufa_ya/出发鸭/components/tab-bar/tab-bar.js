Component({
  properties: {
    current: {
      type: Number,
      value: 0
    },
    hideSelected: {
      type: Boolean,
      value: false
    }
  },
  data: {
    tabs: [
      { label: '首页' },
      { label: '消息' },
      { label: '行程' },
      { label: '我的' }
    ]
  },
  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      if (index === this.properties.current) return;
      
      const urls = [
        '/pages/index/index',
        '/pages/messages/messages',
        '/pages/trips/trips',
        '/pages/profile/profile'
      ];
      
      wx.switchTab({
        url: urls[index]
      });
    },
    onFabTap() {
      wx.switchTab({
        url: '/pages/post/post'
      });
    }
  }
});
