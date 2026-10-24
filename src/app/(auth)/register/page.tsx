'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRegisterMutation } from '@/redux/api/authApi';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();

      if (response.success) {
        toast.success(
          response.message ||
            'Registration successful! Please check your email for the OTP.'
        );
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error(response.message || 'Registration failed');
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
          const field = e.path?.[0] as keyof RegisterFormData;
          if (field) {
            setError(field, { message: e.message });
          }
          toast.error(e.message);
        });
        return;
      }

      let errorMessage = 'Registration failed. Please check your credentials.';
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
          Create Pharmacy Account
        </h1>
        <p className="text-sm text-slate-500">
          Set up your pharmacy workspace in under a minute
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Input
          {...register('name')}
          label="Full Name"
          placeholder="e.g. Dr. Sadid Ahmed"
          error={errors.name?.message}
          leftIcon={<UserIcon className="w-4 h-4" />}
          autoComplete="name"
        />

        <Input
          {...register('email')}
          label="Email Address"
          type="email"
          placeholder="sadid@pharmaflow.com"
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
          autoComplete="new-password"
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

        <Input
          {...register('confirmPassword')}
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="pt-2 text-center text-sm text-slate-500 border-t border-slate-100">
        Already registered?{' '}
        <Link
          href="/login"
          className="font-bold text-teal-600 hover:text-teal-700 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
