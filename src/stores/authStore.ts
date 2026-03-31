import { create } from 'zustand';
import { authApi } from '@/lib/api';

interface AuthStore {
  token: string | null;
  username: string | null;
  error: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('bb_token'),
  username: localStorage.getItem('bb_username'),
  error: null,
  loading: false,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.login(username, password);
      localStorage.setItem('bb_token', data.token);
      localStorage.setItem('bb_username', data.username);
      set({ token: data.token, username: data.username, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      return false;
    }
  },

  signup: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.signup(username, password);
      localStorage.setItem('bb_token', data.token);
      localStorage.setItem('bb_username', data.username);
      localStorage.setItem('bb_new_user', 'true'); // flag for first-time guide
      set({ token: data.token, username: data.username, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Signup failed', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_username');
    set({ token: null, username: null });
  },
}));
