'use client';

import React from 'react';
import Link from 'next/link';
import {
  Pill,
  Zap,
  TrendingUp,
  Boxes,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-teal-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-600/30 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              PharmaFlow
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Gradient Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-tr from-teal-300/20 to-emerald-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-bold uppercase tracking-wider shadow-sm animate-fadeIn">
            <Zap className="w-3.5 h-3.5 text-teal-600" />
            Next-Gen Pharmacy Inventory &amp; POS Cloud
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Run Your Pharmacy with{' '}
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Absolute Precision
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
            Eliminate expired batch write-offs, prevent out-of-stock crises, and automate counter billing with intelligent margin analytics built for modern pharmacies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" variant="primary" className="gap-2.5 text-base px-8 py-3.5">
                <span>Start Pharmacy Workspace</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 py-3.5">
                Sign In to Existing Store
              </Button>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Expiry Countdown</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Low Stock Automated Alerts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thermal Receipt POS Invoicing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-white border-y border-slate-200/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered Specifically for Pharmacists &amp; Store Owners
            </h2>
            <p className="text-sm text-slate-500">
              Everything required to manage wholesale procurement, retail shelf units, and daily ledger turnover.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Live Stock &amp; Batch Control
              </h3>
              <p className="text-sm text-slate-600">
                Track dosages, generic combinations, manufacturer batches, and shelf counts with instant quick adjustments.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Early Expiry Sentinel
              </h3>
              <p className="text-sm text-slate-600">
                Proactive alerts for batches expiring in 15 to 90 days. Calculate potential losses and liquidate in time.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Inventory Valuation &amp; Margins
              </h3>
              <p className="text-sm text-slate-600">
                Real-time capital calculations showing your wholesale cost, retail sales potential, and projected profit margins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400 text-xs text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2 text-white font-extrabold text-base">
            <Pill className="w-5 h-5 text-teal-400" />
            <span>PharmaFlow Systems</span>
          </div>
          <p className="max-w-md mx-auto text-slate-500">
            Enterprise Cloud Management for independent pharmacies, retail medicine stores, and pharmaceutical distributors.
          </p>
          <p className="text-slate-600 pt-4 border-t border-slate-800">
            &copy; 2026 PharmaFlow Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
