export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  FORGOT_PASSWORD: '/auth/forgot-password',
};

export const DISASTER_ENDPOINTS = {
  REPORT: '/disaster/report',
  LIST: '/disaster/list',
  DETAILS: (id) => `/disaster/${id}`,
  UPDATE: (id) => `/disaster/${id}`,
};
