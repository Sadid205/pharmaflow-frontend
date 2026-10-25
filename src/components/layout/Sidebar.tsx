'use client';

import React from 'react';
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
  // Truck,
  // ShoppingCart,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useGetLowStockMedicinesQuery } from '@/redux/api/medicineApi';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  isHighlight?: boolean;
}

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isOwner, logout } = useAuth();

  const { data: lowStockData } = useGetLowStockMedicinesQuery(10, {
    skip: !isOwner,
  });
  const lowStockCount = lowStockData?.data?.length || 0;

  const ownerNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Medicines Inventory',
      href: '/medicines',
      icon: Pill,
    },
    {
      title: 'Low Stock Alerts',
      href: '/medicines/low-stock',
      icon: AlertTriangle,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      title: 'Expiring Soon',
      href: '/medicines/expiring',
      icon: Clock,
    },
    {
      title: 'Categories',
      href: '/categories',
      icon: Tags,
    },
    // {
    //   title: 'Suppliers',
    //   href: '/suppliers',
    //   icon: Truck,
    // },
    // {
    //   title: 'POS & Billing',
    //   href: '/pos',
    //   icon: ShoppingCart,
    //   isHighlight: true,
    // },
    {
      title: 'Pharmacy Settings',
      href: '/pharmacy/settings',
      icon: Settings,
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      title: 'Admin Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'All Pharmacies',
      href: '/admin/pharmacies',
      icon: Building2,
    },
    {
      title: 'User Management',
      href: '/admin/users',
      icon: Users,
    },
  ];

  const navItems = isAdmin ? adminNavItems : ownerNavItems;

  return (
    <aside className="w-64 h-full flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-slate-950/40">
        <Link
          href="/dashboard"
          onClick={onItemClick}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              PharmaFlow
            </span>
            <span className="block text-[10px] uppercase font-semibold text-teal-400/80 -mt-0.5 tracking-wider">
              {isAdmin ? 'Super Admin' : 'Pharmacy Cloud'}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
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
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/40 font-semibold'
                  : item.isHighlight
                  ? 'text-teal-400 hover:text-white hover:bg-slate-800/60 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : item.isHighlight ? 'text-teal-400' : 'text-slate-400 group-hover:text-teal-400'
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
      <div className="p-3 border-t border-slate-800 bg-slate-950/30">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Pharmacy Owner'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
