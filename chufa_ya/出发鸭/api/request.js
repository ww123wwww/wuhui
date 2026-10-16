const config = require('./config.js');

function request(options) {
  return new Promise((resolve, reject) => {
    const userId = wx.getStorageSync('userId') || 1;

    wx.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: options.timeout || 15000, // 默认15秒超时
      header: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200 || res.data.code === 0) {
            resolve(res.data);
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        } else {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          reject(res);
        }
      },
      fail: (err) => {
        console.error('请求失败:', options.url, err);
        wx.showToast({
          title: err.errMsg && err.errMsg.includes('timeout') ? '请求超时，请检查网络' : '网络错误',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

function getUserInfo(userId) {
  return request({
    url: config.USER_INFO,
    method: 'GET',
    data: { userId }
  });
}

function updateUserInfo(userId, data) {
  return request({
    url: config.USER_UPDATE,
    method: 'PUT',
    data: { userId, ...data }
  });
}

function getContentList(userId, page, pageSize, contentType, location) {
  const data = { userId, page, pageSize, contentType };
  if (location) {
    data.location = location;
  }
  return request({
    url: config.CONTENT_LIST,
    method: 'GET',
    data: data
  });
}

function getUserContentList(userId, page, pageSize) {
  return request({
    url: config.CONTENT_USER_LIST,
    method: 'GET',
    data: { userId, page, pageSize }
  });
}

function getContentDetail(id) {
  return request({
    url: config.CONTENT_DETAIL,
    method: 'GET',
    data: { id }
  });
}

function publishContent(userId, contentData) {
  return request({
    url: config.CONTENT_PUBLISH,
    method: 'POST',
    data: { userId, ...contentData }
  });
}

function likeContent(userId, contentId, contentType) {
  return request({
    url: config.CONTENT_LIKE,
    method: 'POST',
    data: { userId, contentId, contentType: contentType || 'note' }
  });
}

function collectContent(userId, contentId, contentType) {
  return request({
    url: config.CONTENT_COLLECT,
    method: 'POST',
    data: { userId, contentId, contentType: contentType || 'note' }
  });
}

function getUserLikeList(userId, page, pageSize) {
  return request({
    url: config.CONTENT_LIKES,
    method: 'GET',
    data: { userId, page, size: pageSize }
  });
}

function getUserCollectionList(userId, page, pageSize) {
  return request({
    url: config.CONTENT_COLLECTIONS,
    method: 'GET',
    data: { userId, page, size: pageSize }
  });
}

function deleteContent(contentId) {
  return request({
    url: config.CONTENT_DELETE,
    method: 'POST',
    data: { contentId }
  });
}

function searchContent(keyword, contentType, page, pageSize) {
  const data = { page, pageSize: pageSize || 20 };
  if (keyword) data.keyword = keyword;
  if (contentType) data.contentType = contentType;
  return request({
    url: config.CONTENT_SEARCH,
    method: 'GET',
    data: data
  });
}

function uploadImage(filePath) {
  return new Promise((resolve, reject) => {
    const userId = wx.getStorageSync('userId') || 1;
    wx.uploadFile({
      url: config.UPLOAD_IMAGE,
      filePath: filePath,
      name: 'file',
      header: {
        'X-User-Id': userId
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 200 || data.code === 0) {
          resolve(data);
        } else {
          wx.showToast({
            title: data.message || '上传失败',
            icon: 'none'
          });
          reject(data);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

function saveDraft(userId, draftData) {
  return request({
    url: config.DRAFT_SAVE,
    method: 'POST',
    data: { userId, ...draftData }
  });
}

function getDraftDetail(userId, draftId) {
  return request({
    url: config.DRAFT_DETAIL,
    method: 'GET',
    data: { userId, draftId }
  });
}

function getDraftList(userId) {
  return request({
    url: config.DRAFT_LIST,
    method: 'GET',
    data: { userId }
  });
}

function deleteDraft(userId, draftId) {
  return request({
    url: config.DRAFT_DELETE,
    method: 'DELETE',
    data: { userId, draftId }
  });
}

function followUser(userId, followeeId) {
  return request({
    url: config.USER_FOLLOW,
    method: 'POST',
    data: { followeeId }
  });
}

function getFollowStatus(userId, followeeId) {
  return request({
    url: config.USER_FOLLOW_STATUS,
    method: 'GET',
    data: { followeeId }
  });
}

function saveToTrip(userId, contentId) {
  return request({
    url: config.SAVE_TO_TRIP,
    method: 'POST',
    data: { userId, contentId }
  });
}

function removeTrip(userId, contentId) {
  return request({
    url: config.REMOVE_TRIP,
    method: 'POST',
    data: { userId, contentId }
  });
}

function checkTripSaved(userId, contentId) {
  return request({
    url: config.CHECK_TRIP_SAVED,
    method: 'GET',
    data: { userId, contentId }
  });
}

function getUserTrips(userId) {
  return request({
    url: config.GET_USER_TRIPS,
    method: 'GET',
    data: { userId }
  });
}

function updateTripStatus(userId, tripId, status) {
  return request({
    url: config.UPDATE_TRIP_STATUS,
    method: 'POST',
    data: { userId, tripId, status }
  });
}

function changePassword(oldPassword, newPassword) {
  return request({
    url: config.USER_CHANGE_PASSWORD,
    method: 'POST',
    data: { oldPassword, newPassword }
  });
}

function login(phone, password) {
  return request({
    url: config.AUTH_LOGIN,
    method: 'POST',
    data: { phone, password }
  });
}

function register(phone, password, nickname) {
  return request({
    url: config.AUTH_REGISTER,
    method: 'POST',
    data: { phone, password, nickname }
  });
}

function sendVerifyCode(phone) {
  return request({
    url: config.AUTH_SEND_CODE,
    method: 'POST',
    data: { phone }
  });
}

function loginByCode(phone, code) {
  return request({
    url: config.AUTH_LOGIN_BY_CODE,
    method: 'POST',
    data: { phone, code }
  });
}

function sendMessage(senderId, receiverId, content) {
  return request({
    url: config.SEND_MESSAGE,
    method: 'POST',
    data: { senderId, receiverId, content }
  });
}

function getChatMessages(userId, targetUserId) {
  return request({
    url: config.GET_CHAT_MESSAGES,
    method: 'GET',
    data: { userId, targetUserId }
  });
}

function getChatList(userId) {
  return request({
    url: config.GET_CHAT_LIST,
    method: 'GET',
    data: { userId }
  });
}

function getActivityList(page, size) {
  return request({
    url: config.ACTIVITY_LIST,
    method: 'GET',
    data: { page: page || 1, size: size || 10 }
  });
}

function getActivityDetail(id) {
  return request({
    url: config.ACTIVITY_DETAIL,
    method: 'GET',
    data: { id }
  });
}

function publishActivity(activityData) {
  return request({
    url: config.ACTIVITY_PUBLISH,
    method: 'POST',
    data: activityData
  });
}

function joinActivity(activityId) {
  return request({
    url: config.ACTIVITY_JOIN,
    method: 'POST',
    data: { activityId }
  });
}

function quitActivity(activityId) {
  return request({
    url: config.ACTIVITY_QUIT,
    method: 'POST',
    data: { activityId }
  });
}

function searchActivities(keyword, page, size) {
  return request({
    url: config.ACTIVITY_SEARCH,
    method: 'GET',
    data: { keyword, page: page || 1, size: size || 10 }
  });
}

function getJoinedActivities(page, size) {
  return request({
    url: config.ACTIVITY_JOINED,
    method: 'GET',
    data: { page: page || 1, size: size || 10 }
  });
}

function likeActivity(activityId) {
  return request({
    url: config.ACTIVITY_LIKE,
    method: 'POST',
    data: { activityId }
  });
}

function collectActivity(activityId) {
  return request({
    url: config.ACTIVITY_COLLECT,
    method: 'POST',
    data: { activityId }
  });
}

module.exports = {
  config,
  request,
  login,
  register,
  sendVerifyCode,
  loginByCode,
  getUserInfo,
  updateUserInfo,
  changePassword,
  getContentList,
  getUserContentList,
  getContentDetail,
  publishContent,
  likeContent,
  collectContent,
  getUserLikeList,
  getUserCollectionList,
  deleteContent,
  searchContent,
  uploadImage,
  saveDraft,
  getDraftDetail,
  getDraftList,
  deleteDraft,
  followUser,
  getFollowStatus,
  saveToTrip,
  removeTrip,
  checkTripSaved,
  getUserTrips,
  updateTripStatus,
  sendMessage,
  getChatMessages,
  getChatList,
  getActivityList,
  getActivityDetail,
  publishActivity,
  joinActivity,
  quitActivity,
  searchActivities,
  getJoinedActivities,
  likeActivity,
  collectActivity,
};