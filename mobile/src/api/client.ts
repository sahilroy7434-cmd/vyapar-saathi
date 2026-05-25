import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const baseURL =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${baseURL}/v1`,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err?.response?.status === 401) {
      const refresh = await AsyncStorage.getItem('refresh_token');
      if (refresh && !err.config.__isRetry) {
        try {
          const r = await axios.post(`${baseURL}/v1/auth/refresh`, { refreshToken: refresh });
          await AsyncStorage.setItem('access_token', r.data.accessToken);
          await AsyncStorage.setItem('refresh_token', r.data.refreshToken);
          err.config.__isRetry = true;
          err.config.headers.Authorization = `Bearer ${r.data.accessToken}`;
          return axios.request(err.config);
        } catch {
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        }
      }
    }
    return Promise.reject(err);
  },
);

export const endpoints = {
  signup: '/auth/signup',
  login: '/auth/login',
  me: '/auth/me',
  questions: '/questions',
  practice: '/questions/practice',
  mockTests: '/mock-tests',
  mockAuto: '/mock-tests/auto',
  attemptsSubmit: '/attempts/submit',
  attempts: '/attempts',
  analyticsDashboard: '/analytics/dashboard',
  leaderboard: '/analytics/leaderboard',
  daily: '/daily',
  aiRecommendations: '/ai/recommendations',
  aiAdaptive: '/ai/adaptive-set',
  studyPlan: '/ai/study-plan',
};
