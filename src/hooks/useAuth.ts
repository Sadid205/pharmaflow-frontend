'use client';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout as logoutAction, setCredentials, User } from '../redux/slices/authSlice';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const logout = () => {
    dispatch(logoutAction());
    router.push('/login');
  };

  const loginSuccess = (token: string, userData?: User, refreshToken?: string) => {
    dispatch(
      setCredentials({
        accessToken: token,
        refreshToken: refreshToken || null,
        user: userData || null,
      })
    );
  };

  const isOwner = user?.role === 'PHARMACY_OWNER';
  const isAdmin = user?.role === 'SUPER_ADMIN';

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    isOwner,
    isAdmin,
    logout,
    loginSuccess,
  };
}
