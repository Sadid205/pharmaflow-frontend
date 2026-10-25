'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  Store,
  // ShoppingCart,
  LogOut,
  Settings,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGetMyPharmacyQuery } from '@/redux/api/pharmacyApi';
import { useGetLowStockMedicinesQuery } from '@/redux/api/medicineApi';
import { Badge } from '../ui/Badge';
// import { Button } from '../ui/Button';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, isOwner, logout } = useAuth();
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
    pharmacyData?.data?.name || (isOwner ? 'My Pharmacy' : 'PharmaFlow Central');

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Pharmacy Store Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isOwner && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50/80 border border-teal-200/60 shadow-sm text-teal-800">
            <Store className="w-4 h-4 text-teal-600" />
            <span className="text-xs sm:text-sm font-semibold truncate max-w-[150px] sm:max-w-xs">
              {pharmacyName}
            </span>
            <Badge variant="success" className="hidden sm:inline-flex text-[10px] py-0">
              Active Store
            </Badge>
          </div>
        )}
      </div>

      {/* Right: Quick POS, Notifications & User Avatar */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* {isOwner && (
          <Link href="/pos">
            <Button size="sm" variant="primary" className="hidden sm:inline-flex gap-1.5">
              <ShoppingCart className="w-4 h-4" />
              <span>POS / Quick Bill</span>
            </Button>
          </Link>
        )} */}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            type="button"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
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
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-2xl border border-slate-100 p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                <Badge variant={lowStockCount > 0 ? 'danger' : 'neutral'}>
                  {lowStockCount} alerts
                </Badge>
              </div>

              <div className="py-2 divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {lowStockCount === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    All inventory levels are healthy! No alerts.
                  </p>
                ) : (
                  lowStockItems.slice(0, 5).map((med) => (
                    <Link
                      key={med.id}
                      href="/medicines/low-stock"
                      onClick={() => setShowNotifDropdown(false)}
                      className="flex items-start gap-2.5 py-2.5 hover:bg-slate-50 rounded-lg px-2 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold text-slate-800">
                          {med.name} is running low!
                        </p>
                        <p className="text-slate-500">
                          Remaining stock: <strong className="text-rose-600">{med.stock}</strong> units
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
                  className="block text-center pt-2 border-t border-slate-100 text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View All Stock Alerts &rarr;
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
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="hidden md:block text-left text-xs">
              <span className="font-bold text-slate-800 block truncate max-w-[120px]">
                {user?.name || 'My Account'}
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 capitalize">
                {user?.role?.replace('_', ' ').toLowerCase() || 'User'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || ''}
                </p>
              </div>

              <div className="py-1">
                {isOwner && (
                  <Link
                    href="/pharmacy/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Pharmacy Settings</span>
                  </Link>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
