'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useGetExpiringSoonMedicinesQuery } from '@/redux/api/medicineApi';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, getDaysUntil, formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export default function ExpiringMedicinesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [days, setDays] = useState<number>(30);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: response, isLoading, refetch } = useGetExpiringSoonMedicinesQuery({
    days,
    page,
    limit,
  });

  const medicines = response?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/medicines"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {t('common.back')}
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-rose-500" />
            <span>{t('medicines.expiringTitle')}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('medicines.expiringSubtitle')}
          </p>
        </div>

        {/* Days Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Time window:</span>
            <select
              value={days}
              onChange={(e) => {
                setDays(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={15} className="dark:bg-slate-850">Within 15 days</option>
              <option value={30} className="dark:bg-slate-850">Within 30 days</option>
              <option value={60} className="dark:bg-slate-850">Within 60 days</option>
              <option value={90} className="dark:bg-slate-850">Within 90 days</option>
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} title={t('common.refresh')}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : medicines.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8 text-emerald-500" />}
          title={t('dashboard.allGoodBadge')}
          description={`None of your medicinal batches are expiring within the next ${days} days.`}
          actionLabel={t('medicines.inventoryTitle')}
          onAction={() => router.push('/medicines')}
        />
      ) : (
        <div className="glass-card rounded-2xl border border-rose-200/60 dark:border-rose-900/40 overflow-hidden shadow-sm">
          <div className="p-4 bg-rose-50/50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {medicines.length} Batches Expiring in {days} Days
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">{t('pharmacies.colMedicineGeneric')}</th>
                  <th className="py-3 px-4">{t('pharmacies.colCategory')}</th>
                  <th className="py-3 px-4">{t('pharmacies.colStockLevel')}</th>
                  <th className="py-3 px-4">{t('pharmacies.colExpiryDate')}</th>
                  <th className="py-3 px-4">{t('common.status')}</th>
                  <th className="py-3 px-4 text-right">Potential Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/70 dark:bg-slate-900/60">
                {medicines.map((med) => {
                  const stock = Number(med.stock) || 0;
                  const buyingPrice = Number(med.buyingPrice) || 0;
                  const potentialLoss = stock * buyingPrice;
                  const daysLeft = getDaysUntil(med.expDate);
                  const isExpired = daysLeft < 0;

                  return (
                    <tr key={med.id} className="hover:bg-rose-50/20 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {med.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="neutral">{med.category}</Badge>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {stock} {t('header.units')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {formatDate(med.expDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isExpired ? (
                          <Badge variant="danger" pulse>
                            Expired
                          </Badge>
                        ) : daysLeft <= 10 ? (
                          <Badge variant="danger" pulse>
                            Critical: {daysLeft} days left
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            {daysLeft} days remaining
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                        {formatCurrency(potentialLoss)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && medicines.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={response?.meta?.totalPages || Math.max(1, Math.ceil((response?.meta?.total || medicines.length) / limit))}
          totalItems={response?.meta?.total}
          pageSize={limit}
          pageSizeOptions={[10, 20, 50, 100]}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          itemLabel={t('common.medicines')}
        />
      )}
    </div>
  );
}
