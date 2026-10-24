import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PHARMACY_OWNER';
  isVerified?: boolean;
  isBlocked?: boolean;
  phone?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Initial state loaded from cookies/localStorage if available in browser
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
    };
  }

  try {
    const token = Cookies.get('accessToken') || localStorage.getItem('accessToken');
    const refreshToken = Cookies.get('refreshToken') || localStorage.getItem('refreshToken');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    return {
      user,
      accessToken: token || null,
      refreshToken: refreshToken || null,
      isAuthenticated: !!token,
      isLoading: false,
    };
  } catch {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }
};

const initialState: AuthState = getInitialState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user?: User | null;
        accessToken: string;
        refreshToken?: string | null;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      if (refreshToken !== undefined) {
        state.refreshToken = refreshToken;
      }
      if (user) {
        state.user = user;
      }
      state.isAuthenticated = true;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        // Cookie for SSR & Middleware (7 days expiry for session persistence)
        Cookies.set('accessToken', accessToken, { expires: 7, path: '/' });
        localStorage.setItem('accessToken', accessToken);

        if (refreshToken) {
          Cookies.set('refreshToken', refreshToken, { expires: 30, path: '/' });
          localStorage.setItem('refreshToken', refreshToken);
        }

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        Cookies.remove('accessToken', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
    finishLoading: (state) => {
      state.isLoading = false;
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = Cookies.get('accessToken') || localStorage.getItem('accessToken');
        const refreshToken = Cookies.get('refreshToken') || localStorage.getItem('refreshToken');
        const userJson = localStorage.getItem('user');
        let user: User | null = null;
        try {
          user = userJson ? JSON.parse(userJson) : null;
        } catch {
          user = null;
        }

        if (token) {
          state.accessToken = token;
          state.refreshToken = refreshToken || null;
          state.user = user;
          state.isAuthenticated = true;
        }
        state.isLoading = false;
      }
    },
  },
});

export const { setCredentials, updateUser, logout, finishLoading, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
