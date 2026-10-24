'use client';

import React from 'react';
import Link from 'next/link';
import { Pill } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-hidden">
      {/* Ambient glowing gradient orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Auth Card Container */}
      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-md hover:scale-105 transition-transform duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-600/30">
              <Pill className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              PharmaFlow
            </span>
          </Link>
          <p className="text-xs font-medium text-slate-500 mt-2 tracking-wide uppercase">
            Smart Pharmacy & Inventory System
          </p>
        </div>

        {/* Glassmorphic Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60">
          {children}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-xs text-slate-400">
          &copy; 2026 PharmaFlow Inc. Secure 256-bit Encrypted.
        </div>
      </div>
    </div>
  );
}
