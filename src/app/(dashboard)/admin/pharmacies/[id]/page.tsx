'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TableSkeleton, CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminPharmacyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pharmacyId = params?.id as string;
  const { t } = useLanguage();

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page to 1 when any filter or search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMedicines.length / pageSize));

  const paginatedMedicines = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMedicines.slice(start, start + pageSize);
  }, [filteredMedicines, page, pageSize]);

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
        <h2 className="text-xl font-bold text-slate-900">{t('pharmacies.noPharmacies')}</h2>
        <Link href="/admin/pharmacies">
          <Button variant="primary">{t('pharmacies.backToAll')}</Button>
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
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm transition-colors"
              title={t('pharmacies.backToAll')}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Store className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                <span>{pharmacy.name}</span>
              </h1>
              <Badge variant="success">{t('pharmacies.activeStore')}</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Store ID: <span className="font-mono text-slate-700 dark:text-slate-300">{pharmacy.id}</span> • {pharmacy.createdAt ? formatDate(pharmacy.createdAt) : ''}
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
            <span>{t('common.refresh')}</span>
          </Button>

          <Link href="/admin/users">
            <Button variant="primary" size="sm" className="gap-1.5">
              <User className="w-4 h-4" />
              <span>{t('nav.userManagement')}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* TOP SECTION: Pharmacy Info & Owner Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pharmacy Store Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{t('pharmacies.storeLocationContact')}</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('pharmacies.tenantStore')}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('pharmacies.pharmacyName')}</span>
              <p className="font-bold text-slate-900 dark:text-slate-100">{pharmacy.name}</p>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('pharmacies.officialPhone')}</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{pharmacy.phone || t('common.na')}</span>
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('pharmacies.storeAddress')}</span>
              <p className="font-medium text-slate-700 dark:text-slate-300 flex items-start gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                <span>{pharmacy.address || t('common.na')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Pharmacy Owner Profile Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{t('pharmacies.ownerAccountDetails')}</span>
            </h3>
            <Badge variant="primary">
              {owner?.role === 'SUPER_ADMIN' ? t('nav.superAdmin') : t('nav.pharmacyOwner')}
            </Badge>
          </div>

          {owner ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('pharmacies.ownerFullName')}</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">{owner.name}</p>
              </div>

              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('pharmacies.ownerEmail')}</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate">{owner.email}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('pharmacies.accountStatus')}</span>
                  {owner.isBlocked ? (
                    <Badge variant="danger" pulse className="mt-1">
                      <Ban className="w-3 h-3 mr-1" /> {t('common.blocked')}
                    </Badge>
                  ) : (
                    <Badge variant="success" className="mt-1">
                      {t('common.active')}
                    </Badge>
                  )}
                </div>

                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('pharmacies.emailVerified')}</span>
                  {owner.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      <CheckCircle className="w-3.5 h-3.5" /> {t('common.verified')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {t('common.pending')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic py-4">{t('adminUsers.noStore')}</p>
          )}
        </div>

        {/* Valuation & Capital Overview */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-teal-950 text-white shadow-xl space-y-4 border border-slate-700/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <h3 className="text-sm font-bold flex items-center gap-2 text-teal-300">
              <TrendingUp className="w-4 h-4" />
              <span>{t('pharmacies.valuationHealth')}</span>
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400/80">
              {t('pharmacies.realTime')}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">{t('pharmacies.totalCapitalCost')}</span>
              <span className="text-lg font-black text-slate-100">
                {formatCurrency(metrics?.totalCostValue ?? 0)}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">{t('pharmacies.expectedSalesRevenue')}</span>
              <span className="text-lg font-black text-teal-300">
                {formatCurrency(metrics?.totalSalesValue ?? 0)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-baseline justify-between">
              <span className="text-xs font-bold text-emerald-400">{t('pharmacies.estimatedGrossMargin')}</span>
              <span className="text-xl font-black text-emerald-400">
                +{formatCurrency(metrics?.potentialProfit ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 border-l-4 border-l-teal-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t('dashboard.totalMedicines')}</span>
            <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {metrics?.totalMedicines ?? medicines.length}
          </p>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">{t('dashboard.items')}</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 border-l-4 border-l-sky-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t('dashboard.totalStockUnits')}</span>
            <Boxes className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {(metrics?.totalStockUnits ?? 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">{t('dashboard.inShelves')}</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t('dashboard.lowStockWarning')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {metrics?.lowStockCount ?? 0}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{t('dashboard.actionNeeded')}</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{t('dashboard.expiringIn30Days')}</span>
            <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {metrics?.expiringSoonCount ?? 0}
          </p>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{t('dashboard.reviewNow')}</span>
        </div>
      </div>

      {/* BOTTOM SECTION: Pharmacy Medicines Inventory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>{t('pharmacies.medicinesInventory')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('pharmacies.medicinesSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t('pharmacies.showingItems')} {filteredMedicines.length > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredMedicines.length)} {t('pharmacies.of')} {filteredMedicines.length} {t('common.items')}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <Input
              placeholder={t('pharmacies.searchMedicinePlaceholder')}
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
                aria-label={t('pharmacies.allCategories')}
                className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="ALL">{t('pharmacies.allCategories')}</option>
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
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('pharmacies.allStock')}
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('LOW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stockFilter === 'LOW'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('pharmacies.lowStock')}
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('EXPIRING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stockFilter === 'EXPIRING'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('pharmacies.expiringSoon')}
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
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="py-3 px-4">{t('pharmacies.colMedicineGeneric')}</th>
                    <th className="py-3 px-4">{t('pharmacies.colCategory')}</th>
                    <th className="py-3 px-4">{t('pharmacies.colStockLevel')}</th>
                    <th className="py-3 px-4">{t('pharmacies.colCostPrice')}</th>
                    <th className="py-3 px-4">{t('pharmacies.colSellingPrice')}</th>
                    <th className="py-3 px-4">{t('pharmacies.colEstMargin')}</th>
                    <th className="py-3 px-4">{t('pharmacies.colExpiryDate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
                  {paginatedMedicines.map((med) => {
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
                      <tr key={med.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{med.name}</div>
                          {med.genericName && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 italic">
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
                            <span className="font-bold text-slate-900 dark:text-slate-100">{med.stock}</span>
                            {isLow ? (
                              <Badge variant="warning" pulse>
                                {t('dashboard.actionNeeded')}
                              </Badge>
                            ) : (
                              <Badge variant="success">{t('dashboard.safe')}</Badge>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                          {formatCurrency(buy)}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(sell)}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
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
                            <span className="text-slate-600 dark:text-slate-400">{formatDate(med.expDate)}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredMedicines.length > 0 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={filteredMedicines.length}
                  pageSize={pageSize}
                  pageSizeOptions={[5, 10, 20, 50, 100]}
                  onPageChange={setPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setPage(1);
                  }}
                  itemLabel={t('common.items')}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
