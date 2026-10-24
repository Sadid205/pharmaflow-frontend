'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, RefreshCw, ArrowLeft, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { useVerifyOtpMutation, useResendOtpMutation } from '@/redux/api/authApi';
import { useAppDispatch } from '@/redux/hooks';
import { setCredentials } from '@/redux/slices/authSlice';

const TIMER_DURATION = 120; // 2 minutes (120 seconds)

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Initialize or restore expiration time for this email
  useEffect(() => {
    const timerKey = `otp_expiry_${email || 'default'}`;
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem(timerKey) : null;
    let target = saved ? parseInt(saved, 10) : 0;

    if (!saved || isNaN(target)) {
      target = Date.now() + TIMER_DURATION * 1000;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(timerKey, target.toString());
      }
    }

    setExpiryTime(target);
  }, [email]);

  // Accurate countdown timer based on expiry timestamp
  useEffect(() => {
    if (!expiryTime) return;

    const checkTime = () => {
      const remaining = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));
      setTimer(remaining);
      if (remaining <= 0) {
        setCanResend(true);
      } else {
        setCanResend(false);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

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
        const timerKey = `otp_expiry_${email || 'default'}`;
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(timerKey);
        }
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
        const timerKey = `otp_expiry_${email || 'default'}`;
        const target = Date.now() + TIMER_DURATION * 1000;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(timerKey, target.toString());
        }
        setExpiryTime(target);
        setTimer(TIMER_DURATION);
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

        {/* 2-Minute Countdown Timer Display */}
        <div className="flex items-center justify-center">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
              timer > 0
                ? 'bg-teal-50/80 text-teal-800 border-teal-200 shadow-xs'
                : 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
            }`}
          >
            {timer > 0 ? (
              <>
                <Clock className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                <span>
                  Code expires in{' '}
                  <span className="font-mono font-bold tracking-wider text-teal-900">
                    {formatTime(timer)}
                  </span>
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Code expired. Please request a new code.</span>
              </>
            )}
          </div>
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
          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            canResend && !isResending
              ? 'text-teal-600 hover:text-teal-700 hover:underline cursor-pointer'
              : 'text-slate-400 cursor-not-allowed'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          {canResend ? 'Resend Code' : `Resend Code in ${formatTime(timer)}`}
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
