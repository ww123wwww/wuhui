App({
  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    this.globalData.statusBarHeight = systemInfo.statusBarHeight;
    this.globalData.navBarHeight = systemInfo.statusBarHeight + 44;
  },
  globalData: {
    systemInfo: null,
    statusBarHeight: 0,
    navBarHeight: 0,
    // 设计系统色彩
    colors: {
      primary: '#FFD700',
      primaryDark: '#705d00',
      onPrimaryContainer: '#705e00',
      background: '#f9f9fb',
      surface: '#ffffff',
      onSurface: '#1a1c1d',
      onSurfaceVariant: '#4d4732',
      secondary: '#5f5e5e',
      outline: '#7e775f',
      outlineVariant: '#d0c6ab',
      error: '#ba1a1a',
      tertiary: '#b02f00',
      surfaceContainerLow: '#f3f3f5',
      surfaceContainerHigh: '#e8e8ea',
      surfaceContainerLowest: '#ffffff'
    }
  }
});
