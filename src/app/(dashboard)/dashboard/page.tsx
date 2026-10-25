'use client';

import React from 'react';
import Link from 'next/link';
import {
  Pill,
  Boxes,
  AlertTriangle,
  Clock,
  TrendingUp,
  Building2,
  Users,
  ShieldCheck,
  UserX,
  ArrowUpRight,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetDashboardStatsQuery,
  PharmacyDashboardData,
  AdminDashboardData,
} from '@/redux/api/dashboardApi';
import { formatCurrency } from '@/lib/utils';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { data: statsResponse, isLoading } = useGetDashboardStatsQuery();

  const stats = statsResponse?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-xl" />
          <div className="h-4 w-72 bg-slate-200 animate-pulse rounded-xl" />
        </div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  // Pharmacy Owner View
  if (!isAdmin && (!stats || stats.role === 'PHARMACY_OWNER')) {
    const ownerStats = stats as PharmacyDashboardData | undefined;
    const totalMedicines = ownerStats?.totalMedicines ?? 0;
    const totalStockUnits = ownerStats?.totalStockUnits ?? 0;
    const lowStockCount = ownerStats?.lowStockCount ?? 0;
    const expiringSoonCount = ownerStats?.expiringSoonCount ?? 0;

    const totalCost = ownerStats?.inventoryValuation?.totalCostValue ?? 0;
    const totalSales = ownerStats?.inventoryValuation?.totalSalesValue ?? 0;
    const profit = ownerStats?.inventoryValuation?.potentialProfit ?? 0;
    const profitMargin =
      totalSales > 0 ? Math.round((profit / totalSales) * 100) : 0;

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Inventory & Store Overview
            </h1>
            <p className="text-sm text-slate-500">
              Welcome back, <strong className="text-slate-700">{user?.name}</strong>! Here is today&apos;s pharmacy operational health.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/medicines">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Add Medicine
              </Button>
            </Link>
            <Link href="/pos">
              <Button variant="primary" size="sm" className="gap-1.5">
                <ShoppingCart className="w-4 h-4" />
                New Sale
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Hero Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Medicines */}
          <Link href="/medicines">
            <div className="glass-card rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-l-teal-500 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Medicines
                </span>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-sm">
                  <Pill className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-slate-900">
                  {totalMedicines.toLocaleString()}
                </p>
                <span className="text-xs font-semibold text-teal-600 flex items-center gap-0.5">
                  Items <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Total Stock Units */}
          <div className="glass-card rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-l-sky-500 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Stock Units
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors shadow-sm">
                <Boxes className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-slate-900">
                {totalStockUnits.toLocaleString()}
              </p>
              <span className="text-xs font-semibold text-sky-600">In Shelves</span>
            </div>
          </div>

          {/* Low Stock Warning */}
          <Link href="/medicines/low-stock">
            <div className="glass-card rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-l-amber-500 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Low Stock Warning
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-slate-900">
                  {lowStockCount}
                </p>
                {lowStockCount > 0 ? (
                  <Badge variant="warning" pulse>
                    Action Needed
                  </Badge>
                ) : (
                  <Badge variant="success">All Good</Badge>
                )}
              </div>
            </div>
          </Link>

          {/* Expiring Soon */}
          <Link href="/medicines/expiring">
            <div className="glass-card rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-l-rose-500 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Expiring in 30 Days
                </span>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-slate-900">
                  {expiringSoonCount}
                </p>
                {expiringSoonCount > 0 ? (
                  <Badge variant="danger" pulse>
                    Review Now
                  </Badge>
                ) : (
                  <Badge variant="success">Safe</Badge>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Financial Valuation Card (Section 5.4 Spec) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-700/60">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Inventory Valuation & Financial Forecast
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Store Capital & Potential Margin
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Real-time valuation based on wholesale cost prices versus retail selling prices across your entire inventory stock.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide">
                +{profitMargin}% Profit Margin
              </span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-700/60">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Total Inventory Cost
              </span>
              <p className="text-2xl font-black text-slate-100">
                {formatCurrency(totalCost)}
              </p>
              <span className="text-[11px] text-slate-500">Capital invested</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Expected Retail Sales
              </span>
              <p className="text-2xl font-black text-sky-300">
                {formatCurrency(totalSales)}
              </p>
              <span className="text-[11px] text-slate-500">Gross revenue potential</span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-400/30 backdrop-blur-sm shadow-inner">
              <span className="text-xs font-semibold text-emerald-300 block mb-1">
                Projected Profit
              </span>
              <p className="text-2xl font-black text-emerald-400 drop-shadow-sm">
                {formatCurrency(profit)}
              </p>
              <span className="text-[11px] text-emerald-300/80">Net estimated earnings</span>
            </div>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/medicines"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Manage Medicines</h4>
            <p className="text-xs text-slate-500 mt-1">
              Add new batches, edit prices, update shelf quantities, and search stock.
            </p>
          </Link>

          <Link
            href="/pos"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Point of Sale (POS)</h4>
            <p className="text-xs text-slate-500 mt-1">
              Quick customer checkout, cash/card/bKash billing, and instant printable invoice.
            </p>
          </Link>

          <Link
            href="/medicines/low-stock"
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-amber-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Stock Re-Order List</h4>
            <p className="text-xs text-slate-500 mt-1">
              Review medicines below threshold and replenish supply with suppliers.
            </p>
          </Link>
        </div>
      </div>
    );
  }

  // Super Admin View
  const adminStats = stats as AdminDashboardData;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Super Admin Global Intelligence
        </h1>
        <p className="text-sm text-slate-500">
          High-level monitoring of all tenant pharmacies, active owners, and platform medicines.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href="/admin/pharmacies">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-teal-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Pharmacies
              </span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-slate-900">
                {adminStats?.totalPharmacies ?? 0}
              </p>
              <span className="text-xs font-semibold text-teal-600 flex items-center gap-0.5">
                Stores <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>

        <Link href="/admin/users">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-sky-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Users
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors shadow-sm">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-slate-900">
                {adminStats?.totalUsers ?? 0}
              </p>
              <span className="text-xs font-semibold text-sky-600 flex items-center gap-0.5">
                Accounts <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>

        <Link href="/admin/users">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Users
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-slate-900">
                {adminStats?.activeUsers ?? 0}
              </p>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                Healthy <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>

        <Link href="/admin/users">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-rose-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Blocked Users
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-sm">
                <UserX className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-slate-900">
                {adminStats?.blockedUsers ?? 0}
              </p>
              <span className="text-xs font-semibold text-rose-600 flex items-center gap-0.5">
                Restricted <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Total Platform Catalog Medicines
          </h3>
          <p className="text-sm text-slate-500">
            Aggregated medicinal stock across all registered tenant pharmacy databases.
          </p>
        </div>
        <p className="text-3xl font-black text-teal-600">
          {(adminStats?.totalMedicinesCount ?? 0).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-4">
        <Link href="/admin/pharmacies">
          <Button variant="primary">Manage All Pharmacies &rarr;</Button>
        </Link>
        <Link href="/admin/users">
          <Button variant="outline">Manage Users & Permissions &rarr;</Button>
        </Link>
      </div>
    </div>
  );
}
