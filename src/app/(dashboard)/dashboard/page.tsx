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
  Receipt,
  CreditCard,
  Banknote,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
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
  const { t } = useLanguage();
  const { data: statsResponse, isLoading } = useGetDashboardStatsQuery();

  const stats = statsResponse?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl" />
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

    const salesMetrics = ownerStats?.salesMetrics;
    const totalRevenue = salesMetrics?.totalRevenue ?? 0;
    const todayRevenue = salesMetrics?.todayRevenue ?? 0;
    const totalDue = salesMetrics?.totalDue ?? 0;
    const totalPaid = salesMetrics?.totalPaid ?? 0;
    const todaySalesCount = salesMetrics?.todaySalesCount ?? 0;

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('nav.dashboard')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('dashboard.welcomeBack')},{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {user?.name}
              </strong>
              ! {t('dashboard.ownerSubtitle')}
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
              <Button variant="primary" size="sm" className="gap-1.5 shadow-md shadow-teal-600/20">
                <ShoppingCart className="w-4 h-4" />
                POS &amp; New Sale
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
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.totalMedicines')}
                </span>
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-sm">
                  <Pill className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {totalMedicines}
                </p>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                  {t('dashboard.items')}
                </span>
              </div>
            </div>
          </Link>

          {/* Total Stock Units */}
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-sky-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('dashboard.totalStockUnits')}
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-sm">
                <Boxes className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {totalStockUnits.toLocaleString()}
              </p>
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                {t('dashboard.inShelves')}
              </span>
            </div>
          </div>

          {/* Low Stock Warning */}
          <Link href="/medicines/low-stock">
            <div className="glass-card rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-l-amber-500 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.lowStockWarning')}
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {lowStockCount}
                </p>
                {lowStockCount > 0 ? (
                  <Badge variant="warning" pulse>
                    {t('dashboard.actionNeeded')}
                  </Badge>
                ) : (
                  <Badge variant="success">{t('dashboard.allGoodBadge')}</Badge>
                )}
              </div>
            </div>
          </Link>

          {/* Expiring Soon */}
          <Link href="/medicines/expiring">
            <div className="glass-card rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-l-4 border-l-rose-500 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.expiringIn30Days')}
                </span>
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {expiringSoonCount}
                </p>
                {expiringSoonCount > 0 ? (
                  <Badge variant="danger" pulse>
                    {t('dashboard.reviewNow')}
                  </Badge>
                ) : (
                  <Badge variant="success">{t('dashboard.safe')}</Badge>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Real-time Sales & Due Intelligence Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('dashboard.todaySales')}
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                {formatCurrency(todayRevenue)}
              </p>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                {todaySalesCount} orders today
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('dashboard.totalRevenue')}
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                {formatCurrency(totalRevenue)}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                All-time sales
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Collected
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                {formatCurrency(totalPaid)}
              </p>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
                Cash, Card &amp; MFS
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('dashboard.dueReceivable')}
              </span>
              <p className="text-lg font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(totalDue)}
              </p>
              <span className="text-[10px] text-rose-500 font-semibold">
                {salesMetrics?.dueSalesCount ?? 0} invoices with due
              </span>
            </div>
          </div>
        </div>

        {/* Financial Valuation Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-700/60">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  {t('dashboard.inventoryValuation')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {t('dashboard.capitalAndMargin')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                {t('dashboard.valuationSubtitle')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide">
                +{profitMargin}% {t('dashboard.profitMargin')}
              </span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-700/60">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-medium text-slate-400 block mb-1">
                {t('dashboard.totalCost')}
              </span>
              <p className="text-2xl font-black text-slate-100">
                {formatCurrency(totalCost)}
              </p>
              <span className="text-[11px] text-slate-500">
                {t('dashboard.capitalInvested')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-medium text-slate-400 block mb-1">
                {t('dashboard.expectedSales')}
              </span>
              <p className="text-2xl font-black text-sky-300">
                {formatCurrency(totalSales)}
              </p>
              <span className="text-[11px] text-slate-500">
                {t('dashboard.grossRevenue')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-400/30 backdrop-blur-sm shadow-inner">
              <span className="text-xs font-semibold text-emerald-300 block mb-1">
                {t('dashboard.projectedProfit')}
              </span>
              <p className="text-2xl font-black text-emerald-400 drop-shadow-sm">
                {formatCurrency(profit)}
              </p>
              <span className="text-[11px] text-emerald-300/80">
                {t('dashboard.netEstimated')}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/medicines"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('dashboard.manageMedsCard')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('dashboard.manageMedsDesc')}
            </p>
          </Link>

          <Link
            href="/pos"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('dashboard.posCard')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('dashboard.posDesc')}
            </p>
          </Link>

          <Link
            href="/medicines/low-stock"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('dashboard.stockReorderCard')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('dashboard.stockReorderDesc')}
            </p>
          </Link>
        </div>
      </div>
    );
  }

  // Super Admin View
  const adminStats = stats as AdminDashboardData | undefined;
  const salesOverview = adminStats?.salesOverview;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {t('dashboard.adminTitle')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('dashboard.adminSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href="/admin/pharmacies">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-teal-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('dashboard.totalPharmacies')}
              </span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {adminStats?.totalPharmacies ?? 0}
              </p>
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                {t('dashboard.registeredStores')} <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>

        <Link href="/admin/users">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-sky-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('dashboard.totalUsers')}
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors shadow-sm">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {adminStats?.totalUsers ?? 0}
              </p>
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
                {t('dashboard.registeredAccounts')} <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>

        <Link href="/admin/users">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('dashboard.activeUsers')}
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {adminStats?.activeUsers ?? 0}
              </p>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                {t('dashboard.healthyVerified')} <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>

        <Link href="/admin/users">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-rose-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('dashboard.blockedUsers')}
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-sm">
                <UserX className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {adminStats?.blockedUsers ?? 0}
              </p>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                {t('dashboard.restrictedAccess')} <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Global Platform Sales Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Platform Revenue
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatCurrency(salesOverview?.totalRevenue ?? 0)}
            </p>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
              {salesOverview?.totalSalesCount ?? 0} total sales completed
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Paid Collected
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatCurrency(salesOverview?.totalPaid ?? 0)}
            </p>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Platform-wide payments
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Platform Due Outstanding
            </span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(salesOverview?.totalDue ?? 0)}
            </p>
            <span className="text-xs text-rose-500 font-semibold">
              Unsettled credit sales
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard.totalPlatformCatalog')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('dashboard.totalPlatformSubtitle')}
          </p>
        </div>
        <p className="text-3xl font-black text-teal-600 dark:text-teal-400">
          {(adminStats?.totalMedicinesCount ?? 0).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-4">
        <Link href="/admin/pharmacies">
          <Button variant="primary">{t('dashboard.managePharmacies')}</Button>
        </Link>
        <Link href="/admin/users">
          <Button variant="outline">{t('dashboard.manageUsers')}</Button>
        </Link>
      </div>
    </div>
  );
}
