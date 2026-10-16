const API_BASE = 'http://localhost:8080/api';

module.exports = {
  API_BASE,

  AUTH_LOGIN: `${API_BASE}/auth/login`,
  AUTH_REGISTER: `${API_BASE}/auth/register`,
  AUTH_SEND_CODE: `${API_BASE}/auth/send-code`,
  AUTH_LOGIN_BY_CODE: `${API_BASE}/auth/login-by-code`,

  USER_INFO: `${API_BASE}/user/info`,
  USER_UPDATE: `${API_BASE}/user/info`,
  USER_LOGOUT: `${API_BASE}/user/logout`,
  USER_FOLLOW: `${API_BASE}/user/follow`,
  USER_FOLLOW_STATUS: `${API_BASE}/user/follow/status`,
  USER_CHANGE_PASSWORD: `${API_BASE}/user/change-password`,

  CONTENT_LIST: `${API_BASE}/content/list`,
  CONTENT_USER_LIST: `${API_BASE}/content/user/list`,
  CONTENT_DETAIL: `${API_BASE}/content/detail`,
  CONTENT_PUBLISH: `${API_BASE}/content/publish`,
  CONTENT_LIKE: `${API_BASE}/content/like`,
  CONTENT_COLLECT: `${API_BASE}/content/collect`,
  CONTENT_LIKES: `${API_BASE}/content/likes`,
  CONTENT_COLLECTIONS: `${API_BASE}/content/collections`,
  CONTENT_SEARCH: `${API_BASE}/content/search`,
  CONTENT_DELETE: `${API_BASE}/content/delete`,

  UPLOAD_IMAGE: `${API_BASE}/upload/image`,

  CIRCLE_SESSIONS: `${API_BASE}/circle/sessions`,
  CIRCLE_MESSAGES: `${API_BASE}/circle/messages`,
  CIRCLE_UNREAD: `${API_BASE}/circle/unread`,

  DRAFT_SAVE: `${API_BASE}/draft/save`,
  DRAFT_DETAIL: `${API_BASE}/draft/detail`,
  DRAFT_LIST: `${API_BASE}/draft/list`,
  DRAFT_DELETE: `${API_BASE}/draft/delete`,

  SAVE_TO_TRIP: `${API_BASE}/trip/save`,
  REMOVE_TRIP: `${API_BASE}/trip/remove`,
  CHECK_TRIP_SAVED: `${API_BASE}/trip/check`,
  GET_USER_TRIPS: `${API_BASE}/trip/user/trips`,
  UPDATE_TRIP_STATUS: `${API_BASE}/trip/update/status`,

  SEND_MESSAGE: `${API_BASE}/message/send`,
  GET_CHAT_MESSAGES: `${API_BASE}/message/list`,
  GET_CHAT_LIST: `${API_BASE}/message/chat-list`,

  ACTIVITY_LIST: `${API_BASE}/activity/list`,
  ACTIVITY_DETAIL: `${API_BASE}/activity/detail`,
  ACTIVITY_PUBLISH: `${API_BASE}/activity/publish`,
  ACTIVITY_JOIN: `${API_BASE}/activity/join`,
  ACTIVITY_QUIT: `${API_BASE}/activity/quit`,
  ACTIVITY_JOINED: `${API_BASE}/activity/joined`,
  ACTIVITY_SEARCH: `${API_BASE}/activity/search`,
  ACTIVITY_LIKE: `${API_BASE}/activity/like`,
  ACTIVITY_COLLECT: `${API_BASE}/activity/collect`,
};