'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  Store,
  LogOut,
  Settings,
  ChevronDown,
  AlertTriangle,
  ShieldCheck,
  Languages,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useGetMyPharmacyQuery } from '@/redux/api/pharmacyApi';
import { useGetLowStockMedicinesQuery } from '@/redux/api/medicineApi';
import { Badge } from '../ui/Badge';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, isOwner, isAdmin, logout } = useAuth();
  const { lang, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const { data: pharmacyData } = useGetMyPharmacyQuery(undefined, {
    skip: !isOwner,
  });
  const { data: lowStockData } = useGetLowStockMedicinesQuery(10, {
    skip: !isOwner,
  });

  const lowStockItems = lowStockData?.data || [];
  const lowStockCount = lowStockData?.meta?.total ?? lowStockItems.length;

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pharmacyName =
    pharmacyData?.data?.name || (isOwner ? t('header.myPharmacy') : t('header.central'));

  return (
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      {/* Left: Mobile Toggle & Pharmacy Store Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isOwner && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 shadow-xs text-teal-800 dark:text-teal-200">
            <Store className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs sm:text-sm font-semibold truncate max-w-[150px] sm:max-w-xs">
              {pharmacyName}
            </span>
            <Badge variant="success" className="hidden sm:inline-flex text-[10px] py-0">
              {t('header.activeStore')}
            </Badge>
          </div>
        )}

        {isAdmin && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xs text-slate-900 dark:text-slate-100">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              {t('header.superAdminConsole')}
            </span>
            <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] py-0 bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-400/30">
              {t('header.masterControl')}
            </Badge>
          </div>
        )}
      </div>

      {/* Right: Theme Toggle, Language Toggler, Notifications & User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Dark / Light Mode Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={theme === 'dark' ? 'Light Mode (নরমাল মোড)' : 'Dark Mode (ডার্ক মোড)'}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 relative group flex items-center justify-center border border-slate-200/80 dark:border-slate-700 shadow-xs"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Language Toggler (EN | BN) */}
        <div
          className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-inner"
          title={t('header.switchLanguage')}
        >
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1',
              lang === 'en'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <span>EN</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('bn')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1',
              lang === 'bn'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <span>BN</span>
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            type="button"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('header.notifications')}
          >
            <Bell className="w-5 h-5" />
            {lowStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('header.notifications')}</h4>
                <Badge variant={lowStockCount > 0 ? 'danger' : 'neutral'}>
                  {lowStockCount} {t('header.alerts')}
                </Badge>
              </div>

              <div className="py-2 divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                {lowStockCount === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                    {t('header.allGood')}
                  </p>
                ) : (
                  lowStockItems.slice(0, 5).map((med) => (
                    <Link
                      key={med.id}
                      href="/medicines/low-stock"
                      onClick={() => setShowNotifDropdown(false)}
                      className="flex items-start gap-2.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg px-2 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {med.name} {t('header.runningLow')}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          {t('header.remainingStock')}{' '}
                          <strong className="text-rose-600 dark:text-rose-400">{med.stock}</strong> {t('header.units')}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {lowStockCount > 0 && (
                <Link
                  href="/medicines/low-stock"
                  onClick={() => setShowNotifDropdown(false)}
                  className="block text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  {t('header.viewAllAlerts')}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="hidden md:block text-left text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block -mt-0.5 capitalize">
                {user?.role === 'SUPER_ADMIN' ? t('nav.superAdmin') : t('nav.pharmacyOwner')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {user?.email || ''}
                </p>
              </div>

              <div className="py-1">
                {isOwner && (
                  <Link
                    href="/pharmacy/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>{t('nav.pharmacySettings')}</span>
                  </Link>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.signOut')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
