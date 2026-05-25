import axios from 'axios';

export const api = axios.create({
  baseURL: '/v1',
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('admin_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (location.pathname !== '/login') location.replace('/login');
    }
    return Promise.reject(err);
  },
);
