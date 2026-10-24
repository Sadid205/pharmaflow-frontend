'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLoginMutation } from '@/redux/api/authApi';
import { useAppDispatch } from '@/redux/hooks';
import { setCredentials } from '@/redux/slices/authSlice';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data).unwrap();

      if (response.success && response.data) {
        const { accessToken, refreshToken } = response.data;

        // Decode payload or let user profile query fill in user info
        let decodedUser = null;
        try {
          const parts = accessToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            decodedUser = {
              id: payload.id || payload.sub,
              name: payload.name || data.email.split('@')[0],
              email: payload.email || data.email,
              role: payload.role || 'PHARMACY_OWNER',
            };
          }
        } catch {
          decodedUser = {
            id: 'current-user',
            name: data.email.split('@')[0],
            email: data.email,
            role: 'PHARMACY_OWNER' as const,
          };
        }

        dispatch(
          setCredentials({
            accessToken,
            refreshToken,
            user: decodedUser,
          })
        );

        toast.success('Welcome back to PharmaFlow!');
        router.push(callbackUrl);
      } else {
        toast.error(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: unknown) {
      const errorObj = err as {
        data?: {
          message?: string | string[];
          errors?: Array<{ path?: string[]; message: string }>;
        };
        message?: string;
      };

      if (errorObj.data?.errors && Array.isArray(errorObj.data.errors)) {
        errorObj.data.errors.forEach((e) => {
          const field = e.path?.[0] as keyof LoginFormData;
          if (field) {
            setError(field, { message: e.message });
          }
          toast.error(e.message);
        });
        return;
      }

      let errorMessage = 'Unable to log in. Please verify your email & password.';
      if (Array.isArray(errorObj.data?.message)) {
        errorMessage = errorObj.data.message.join(', ');
      } else if (typeof errorObj.data?.message === 'string') {
        errorMessage = errorObj.data.message;
      } else if (errorObj.message) {
        errorMessage = errorObj.message;
      }

      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign In to Your Account
        </h1>
        <p className="text-sm text-slate-500">
          Enter your credentials to access your pharmacy inventory
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register('email')}
          label="Email Address"
          type="email"
          placeholder="name@pharmaflow.com"
          error={errors.email?.message}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        <Input
          {...register('password')}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.password?.message}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="current-password"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600"
            />
            <span className="text-xs text-slate-600 font-medium">Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="pt-2 text-center text-sm text-slate-500 border-t border-slate-100">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-bold text-teal-600 hover:text-teal-700 hover:underline"
        >
          Create Pharmacy Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="h-48 flex items-center justify-center text-sm text-slate-400">Loading sign in...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
