import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, endpoints } from '../api/client';

type User = {
  _id: string;
  name: string;
  email: string;
  language: 'en' | 'hi';
  role: 'student' | 'admin';
  targetExams?: string[];
};

type AuthState = {
  user: User | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        set({ loading: false, user: null });
        return;
      }
      const r = await api.get(endpoints.me);
      set({ user: r.data.user, loading: false });
    } catch {
      set({ loading: false, user: null });
    }
  },
  login: async (email, password) => {
    const r = await api.post(endpoints.login, { email, password });
    await AsyncStorage.setItem('access_token', r.data.accessToken);
    await AsyncStorage.setItem('refresh_token', r.data.refreshToken);
    set({ user: r.data.user });
  },
  signup: async (name, email, password) => {
    const r = await api.post(endpoints.signup, { name, email, password });
    await AsyncStorage.setItem('access_token', r.data.accessToken);
    await AsyncStorage.setItem('refresh_token', r.data.refreshToken);
    set({ user: r.data.user });
  },
  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    set({ user: null });
  },
}));
