'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { useVerifyOtpMutation, useResendOtpMutation } from '@/redux/api/authApi';
import { useAppDispatch } from '@/redux/hooks';
import { setCredentials } from '@/redux/slices/authSlice';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric digit
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Handle pasting entire code
    if (value.length > 1) {
      const pastedDigits = value.slice(0, 6).split('');
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const fullOtp = otp.join('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email) {
      toast.error('Email address is missing. Please register again.');
      return;
    }

    if (fullOtp.length !== 6) {
      toast.error('Please enter all 6 digits of the OTP code.');
      return;
    }

    try {
      const response = await verifyOtp({
        email,
        otp: fullOtp,
      }).unwrap();

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        dispatch(
          setCredentials({
            accessToken,
            refreshToken,
            user,
          })
        );
        toast.success(
          response.message || 'Account verified and logged in successfully!'
        );
        router.push('/dashboard');
      } else {
        toast.error(response.message || 'Invalid or expired OTP code.');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(
        errorObj.data?.message ||
          errorObj.message ||
          'Failed to verify OTP. Please try again.'
      );
    }
  };

  const handleResend = async () => {
    if (!email || !canResend || isResending) return;

    try {
      const response = await resendOtp({ email }).unwrap();
      if (response.success) {
        toast.success(
          response.message || 'A new verification code has been sent to your email.'
        );
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(response.message || 'Failed to resend code.');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(
        errorObj.data?.message || errorObj.message || 'Failed to resend OTP.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center shadow-inner">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Verify Your Email
        </h1>
        <p className="text-sm text-slate-500">
          We sent a 6-digit confirmation code to{' '}
          <span className="font-semibold text-slate-700">
            {email || 'your email'}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6 Digit Box Grid */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 sm:w-13 sm:h-16 text-center text-xl font-bold rounded-xl border border-slate-200 bg-white shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-200 select-all"
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isVerifying}
          disabled={fullOtp.length !== 6}
        >
          <span>Verify & Access Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Resend Timer / Action */}
      <div className="text-center space-y-2">
        <p className="text-xs text-slate-500">Didn&apos;t receive the code?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || isResending}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed hover:underline cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          {canResend ? 'Resend Code' : `Resend in ${timer}s`}
        </button>
      </div>

      <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <React.Suspense fallback={<div className="h-48 flex items-center justify-center text-sm text-slate-400">Loading verification...</div>}>
      <VerifyOtpContent />
    </React.Suspense>
  );
}
