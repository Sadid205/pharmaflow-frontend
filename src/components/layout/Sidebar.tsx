'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Pill,
  AlertTriangle,
  Clock,
  Settings,
  Building2,
  Users,
  Tags,
  Store,
  ChevronDown,
  ChevronRight,
  LogOut,
  Layers,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { useGetLowStockMedicinesQuery } from '@/redux/api/medicineApi';
import { useGetAllPharmaciesQuery } from '@/redux/api/pharmacyApi';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  isHighlight?: boolean;
  isCollapsible?: boolean;
}

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isOwner, logout } = useAuth();
  const { t } = useLanguage();

  const { data: lowStockData } = useGetLowStockMedicinesQuery(10, {
    skip: !isOwner,
  });
  const lowStockCount = lowStockData?.meta?.total ?? lowStockData?.data?.length ?? 0;

  // Super Admin: Fetch pharmacies list for sidebar accordion
  const { data: pharmaciesData } = useGetAllPharmaciesQuery(
    { limit: 100 },
    { skip: !isAdmin }
  );
  const pharmacies = pharmaciesData?.data || [];

  const [pharmaciesExpanded, setPharmaciesExpanded] = useState<boolean>(() => {
    return pathname.startsWith('/admin/pharmacies');
  });

  const ownerNavItems: NavItem[] = [
    {
      title: t('nav.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('nav.posBilling'),
      href: '/pos',
      icon: ShoppingCart,
    },
    {
      title: t('nav.medicinesInventory'),
      href: '/medicines',
      icon: Pill,
    },
    {
      title: t('nav.lowStockAlerts'),
      href: '/medicines/low-stock',
      icon: AlertTriangle,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      title: t('nav.expiringSoon'),
      href: '/medicines/expiring',
      icon: Clock,
    },
    {
      title: t('nav.categories'),
      href: '/categories',
      icon: Tags,
    },
    {
      title: t('nav.pharmacySettings'),
      href: '/pharmacy/settings',
      icon: Settings,
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      title: t('nav.adminOverview'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('nav.allPharmacies'),
      href: '/admin/pharmacies',
      icon: Building2,
      isCollapsible: true,
      badge: pharmacies.length > 0 ? pharmacies.length : undefined,
      badgeColor: 'bg-teal-600',
    },
    {
      title: t('nav.userManagement'),
      href: '/admin/users',
      icon: Users,
    },
  ];

  const navItems = isAdmin ? adminNavItems : ownerNavItems;

  return (
    <aside className="w-64 h-full flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40">
        <Link
          href="/dashboard"
          onClick={onItemClick}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              PharmaFlow
            </span>
            <span className="block text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400/80 -mt-0.5 tracking-wider">
              {isAdmin ? t('nav.superAdmin') : t('nav.pharmacyCloud')}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t('nav.navigation')}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isPharmacyItem = item.isCollapsible && isAdmin;

          if (isPharmacyItem) {
            const isAnyPharmacyActive = pathname.startsWith('/admin/pharmacies');

            return (
              <div key={item.href} className="space-y-1">
                {/* Parent Collapsible Trigger */}
                <button
                  type="button"
                  onClick={() => setPharmaciesExpanded((prev) => !prev)}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                    isAnyPharmacyActive
                      ? 'bg-teal-50 dark:bg-slate-800/90 text-teal-800 dark:text-teal-300 font-bold border border-teal-200/80 dark:border-teal-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-transform group-hover:scale-110',
                        isAnyPharmacyActive
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                      )}
                    />
                    <span>{item.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-sm',
                          item.badgeColor || 'bg-teal-600'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}

                    {pharmaciesExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 transition-transform" />
                    )}
                  </div>
                </button>

                {/* Sub-menu Accordion with Right Scrollbar */}
                {pharmaciesExpanded && (
                  <div className="mt-1 ml-2.5 pl-2.5 border-l border-slate-200 dark:border-slate-800 space-y-1 animate-fadeIn">
                    {/* View All Grid Link */}
                    <Link
                      href="/admin/pharmacies"
                      onClick={onItemClick}
                      className={cn(
                        'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                        pathname === '/admin/pharmacies'
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>{t('nav.allStoresGrid')}</span>
                      </div>
                    </Link>

                    {/* Scrollable Pharmacies List */}
                    {pharmacies.length === 0 ? (
                      <p className="text-[11px] text-slate-500 py-1.5 px-2.5 italic">
                        No pharmacies registered
                      </p>
                    ) : (
                      <div
                        className="max-h-48 overflow-y-auto space-y-0.5 pr-1.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-teal-500/60"
                        style={{
                          scrollbarWidth: 'thin',
                        }}
                      >
                        {pharmacies.map((pharm) => {
                          const isSelected = pathname === `/admin/pharmacies/${pharm.id}`;

                          return (
                            <Link
                              key={pharm.id}
                              href={`/admin/pharmacies/${pharm.id}`}
                              onClick={onItemClick}
                              title={pharm.name}
                              className={cn(
                                'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors group',
                                isSelected
                                  ? 'bg-teal-50 dark:bg-teal-600/30 text-teal-700 dark:text-teal-300 font-bold border border-teal-200/80 dark:border-teal-500/50 shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Store
                                  className={cn(
                                    'w-3.5 h-3.5 shrink-0 transition-colors',
                                    isSelected
                                      ? 'text-teal-600 dark:text-teal-400'
                                      : 'text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                                  )}
                                />
                                <span className="truncate">{pharm.name}</span>
                              </div>

                              {pharm._count?.medicines !== undefined && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-300 shrink-0 ml-1">
                                  {pharm._count.medicines}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          // Normal Nav Items
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-700/20 font-bold'
                  : item.isHighlight
                  ? 'text-teal-700 dark:text-teal-400 hover:text-teal-800 hover:bg-teal-50 dark:hover:bg-slate-800/60 border border-teal-200 dark:border-teal-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : item.isHighlight ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                  )}
                />
                <span>{item.title}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-sm',
                    item.badgeColor || 'bg-rose-500'
                  )}
                >
                  {item.badge}
                </span>
              )}

              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-white/80 opacity-80" />
              )}
            </Link>
          );
        })}
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/30">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-600/30 border border-teal-300/60 dark:border-teal-500/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user?.role === 'SUPER_ADMIN' ? t('nav.superAdmin') : t('nav.pharmacyOwner')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title={t('nav.signOut')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
