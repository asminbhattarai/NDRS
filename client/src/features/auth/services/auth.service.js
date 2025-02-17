import api from '../../../services/api';
import { AUTH_ENDPOINTS } from '../../../services/endpoints';

export const authService = {
  login: async (credentials) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get(AUTH_ENDPOINTS.PROFILE);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  },
};
