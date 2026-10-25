'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Pill,
  Boxes,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Search,
  CheckCircle,
  Ban,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useGetPharmacyDetailsByIdQuery } from '@/redux/api/pharmacyApi';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TableSkeleton, CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminPharmacyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pharmacyId = params?.id as string;

  const { data: response, isLoading, isError, refetch, isFetching } =
    useGetPharmacyDetailsByIdQuery(pharmacyId, {
      skip: !pharmacyId,
    });

  const pharmacy = response?.data;
  const owner = pharmacy?.owner;
  const metrics = pharmacy?.metrics;
  const medicines = pharmacy?.medicines || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'EXPIRING' | 'NORMAL'>('ALL');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [medicines]);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    return medicines.filter((m) => {
      // Category filter
      if (selectedCategory !== 'ALL' && m.category !== selectedCategory) {
        return false;
      }

      // Stock status filter
      if (stockFilter === 'LOW' && m.stock > 10) return false;
      if (stockFilter === 'NORMAL' && m.stock <= 10) return false;
      if (stockFilter === 'EXPIRING') {
        const exp = new Date(m.expDate);
        if (exp > thirtyDaysLater || exp < now) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = m.name?.toLowerCase().includes(query);
        const matchesGeneric = m.genericName?.toLowerCase().includes(query);
        const matchesCategory = m.category?.toLowerCase().includes(query);
        return matchesName || matchesGeneric || matchesCategory;
      }

      return true;
    });
  }, [medicines, selectedCategory, stockFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
            <div className="h-4 w-72 bg-slate-200 animate-pulse rounded" />
          </div>
        </div>
        <CardSkeleton count={3} />
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  if (isError || !pharmacy) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl border border-rose-200 space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Pharmacy Not Found</h2>
        <p className="text-sm text-slate-600">
          The requested pharmacy record could not be loaded or does not exist.
        </p>
        <Link href="/admin/pharmacies">
          <Button variant="primary">Return to All Pharmacies</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Bar / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/pharmacies">
            <button
              type="button"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
              title="Back to Pharmacies"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Store className="w-6 h-6 text-teal-600" />
                <span>{pharmacy.name}</span>
              </h1>
              <Badge variant="success">Active Tenant</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Store ID: <span className="font-mono text-slate-700">{pharmacy.id}</span> • Registered on {pharmacy.createdAt ? formatDate(pharmacy.createdAt) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/admin/users">
            <Button variant="primary" size="sm" className="gap-1.5">
              <User className="w-4 h-4" />
              <span>User Management</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* TOP SECTION: Pharmacy Info & Owner Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pharmacy Store Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Store Contact & Location</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tenant Store
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Pharmacy Name</span>
              <p className="font-bold text-slate-900">{pharmacy.name}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Official Contact Phone</span>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>{pharmacy.phone || 'No phone registered'}</span>
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Store Address</span>
              <p className="font-medium text-slate-700 flex items-start gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{pharmacy.address || 'No address registered'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Pharmacy Owner Profile Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>Owner Account Details</span>
            </h3>
            <Badge variant="primary">
              {owner?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Pharmacy Owner'}
            </Badge>
          </div>

          {owner ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Owner Full Name</span>
                <p className="font-bold text-slate-900">{owner.name}</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Owner Email</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">{owner.email}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs text-slate-400 block">Account Status</span>
                  {owner.isBlocked ? (
                    <Badge variant="danger" pulse className="mt-1">
                      <Ban className="w-3 h-3 mr-1" /> Blocked
                    </Badge>
                  ) : (
                    <Badge variant="success" className="mt-1">
                      Active
                    </Badge>
                  )}
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">Email Verified</span>
                  {owner.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic py-4">No owner attached to this pharmacy.</p>
          )}
        </div>

        {/* Valuation & Capital Overview */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-teal-950 text-white shadow-xl space-y-4 border border-slate-700/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <h3 className="text-sm font-bold flex items-center gap-2 text-teal-300">
              <TrendingUp className="w-4 h-4" />
              <span>Valuation & Financial Health</span>
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400/80">
              Real-time
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Total Capital Cost:</span>
              <span className="text-lg font-black text-slate-100">
                {formatCurrency(metrics?.totalCostValue ?? 0)}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Expected Sales Revenue:</span>
              <span className="text-lg font-black text-teal-300">
                {formatCurrency(metrics?.totalSalesValue ?? 0)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-baseline justify-between">
              <span className="text-xs font-bold text-emerald-400">Estimated Gross Margin:</span>
              <span className="text-xl font-black text-emerald-400">
                +{formatCurrency(metrics?.potentialProfit ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Medicines</span>
            <Pill className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics?.totalMedicines ?? medicines.length}
          </p>
          <span className="text-[11px] text-teal-600 font-medium">Distinct Products</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Stock</span>
            <Boxes className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {(metrics?.totalStockUnits ?? 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-sky-600 font-medium">Units In Shelves</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics?.lowStockCount ?? 0}
          </p>
          <span className="text-[11px] text-amber-600 font-medium">Below 10 Threshold</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Expiring in 30d</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics?.expiringSoonCount ?? 0}
          </p>
          <span className="text-[11px] text-rose-600 font-medium">Urgent Batch Attention</span>
        </div>
      </div>

      {/* BOTTOM SECTION: Pharmacy Medicines Inventory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              <span>Pharmacy Medicines Inventory</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live stock, cost prices, selling rates, and batch expiry for this store.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredMedicines.length} of {medicines.length} items
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search by brand, generic, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Stock Filter Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStockFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stockFilter === 'ALL'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Stock
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('LOW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stockFilter === 'LOW'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Low Stock
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('EXPIRING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stockFilter === 'EXPIRING'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Expiring Soon
              </button>
            </div>
          </div>
        </div>

        {/* Medicines Table */}
        {filteredMedicines.length === 0 ? (
          <EmptyState
            icon={<Pill className="w-8 h-8" />}
            title={searchQuery ? 'No medicines match search' : 'No Medicines Added'}
            description={
              searchQuery
                ? `No medicines matched "${searchQuery}".`
                : 'This pharmacy has not registered any medicines in their catalog yet.'
            }
          />
        ) : (
          <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Medicine & Generic</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Cost Price</th>
                    <th className="py-3 px-4">Selling Price</th>
                    <th className="py-3 px-4">Est. Margin</th>
                    <th className="py-3 px-4">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/70">
                  {filteredMedicines.map((med) => {
                    const buy = Number(med.buyingPrice) || 0;
                    const sell = Number(med.sellingPrice) || 0;
                    const unitMargin = sell - buy;

                    const isLow = med.stock <= 10;
                    const exp = new Date(med.expDate);
                    const now = new Date();
                    const thirtyDays = new Date();
                    thirtyDays.setDate(thirtyDays.getDate() + 30);
                    const isExpiring = exp <= thirtyDays && exp >= now;
                    const isExpired = exp < now;

                    return (
                      <tr key={med.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{med.name}</div>
                          {med.genericName && (
                            <div className="text-xs text-slate-500 italic">
                              {med.genericName}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="neutral">
                            {med.category || 'General'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{med.stock}</span>
                            {isLow ? (
                              <Badge variant="warning" pulse>
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="success">Normal</Badge>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {formatCurrency(buy)}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatCurrency(sell)}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                          +{formatCurrency(unitMargin)}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          {isExpired ? (
                            <Badge variant="danger">Expired ({formatDate(med.expDate)})</Badge>
                          ) : isExpiring ? (
                            <Badge variant="warning" pulse>
                              Expiring ({formatDate(med.expDate)})
                            </Badge>
                          ) : (
                            <span className="text-slate-600">{formatDate(med.expDate)}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
