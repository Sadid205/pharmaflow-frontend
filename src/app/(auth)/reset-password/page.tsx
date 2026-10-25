'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Key } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} from '@/redux/api/authApi';

const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, 'Reset code must be exactly 6 digits'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [verifyResetOtp, { isLoading: isVerifyingOtp }] =
    useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResettingPassword }] =
    useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const otpValue = watch('otp');

  // Verify OTP button if user wants to verify code first
  const handleVerifyOtpFirst = async () => {
    if (!email) {
      toast.error('Email is missing. Please start again from forgot password.');
      return;
    }
    if (otpValue.length !== 6) {
      toast.error('Please enter the 6-digit reset code first.');
      return;
    }

    try {
      const res = await verifyResetOtp({
        email,
        resetOtp: otpValue,
        otp: otpValue,
      }).unwrap();

      const extractedToken =
        typeof res.data === 'string'
          ? res.data
          : (res.data as { resetToken?: string })?.resetToken ||
            (res as unknown as { resetToken?: string })?.resetToken;

      if (extractedToken) {
        setResetToken(extractedToken);
        toast.success('Code verified! Enter your new password below.');
      } else {
        toast.error(res.message || 'Invalid or expired code.');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string | string[] }; message?: string };
      const msg = Array.isArray(errorObj.data?.message)
        ? errorObj.data.message.join(', ')
        : errorObj.data?.message || errorObj.message || 'Failed to verify reset code.';
      toast.error(msg);
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      let tokenToUse = resetToken;

      // If token not verified yet, verify first
      if (!tokenToUse) {
        if (!email) {
          toast.error('Email parameter missing');
          return;
        }
        const verifyRes = await verifyResetOtp({
          email,
          resetOtp: data.otp,
          otp: data.otp,
        }).unwrap();

        const extractedToken =
          typeof verifyRes.data === 'string'
            ? verifyRes.data
            : (verifyRes.data as { resetToken?: string })?.resetToken ||
              (verifyRes as unknown as { resetToken?: string })?.resetToken;

        if (!extractedToken) {
          toast.error(verifyRes.message || 'Invalid OTP code.');
          return;
        }
        tokenToUse = extractedToken;
        setResetToken(tokenToUse);
      }

      const response = await resetPassword({
        resetToken: tokenToUse,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }).unwrap();

      if (response.success) {
        toast.success(
          'Password has been reset successfully! You can now log in.'
        );
        router.push('/login');
      } else {
        toast.error(response.message || 'Failed to reset password.');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(
        errorObj.data?.message ||
          errorObj.message ||
          'Failed to reset password. Please check your reset code.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center shadow-inner">
          <Key className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Set New Password
        </h1>
        <p className="text-sm text-slate-500">
          Enter the code sent to {email ? <span className="font-semibold text-slate-700">{email}</span> : 'your email'} and choose a new password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Input
            {...register('otp')}
            label="6-Digit Reset Code"
            placeholder="123456"
            maxLength={6}
            error={errors.otp?.message}
            helperText={resetToken ? '✓ Code verified successfully' : undefined}
            rightIcon={
              !resetToken && (
                <button
                  type="button"
                  onClick={handleVerifyOtpFirst}
                  disabled={otpValue?.length !== 6 || isVerifyingOtp}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 disabled:opacity-40"
                >
                  {isVerifyingOtp ? 'Checking...' : 'Verify'}
                </button>
              )
            }
          />
        </div>

        <Input
          {...register('newPassword')}
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.newPassword?.message}
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
          label="Confirm New Password"
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
          isLoading={isResettingPassword || isVerifyingOtp}
        >
          <span>Update Password & Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel and return to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="h-48 flex items-center justify-center text-sm text-slate-400">Loading password reset...</div>}>
      <ResetPasswordContent />
    </React.Suspense>
  );
}
