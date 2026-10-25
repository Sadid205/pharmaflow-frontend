'use client';

import React, { useState } from 'react';
import { AlertTriangle, Layers, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useGetLowStockMedicinesQuery,
  Medicine,
} from '@/redux/api/medicineApi';
import { StockAdjustmentModal } from '@/components/medicines/StockAdjustmentModal';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export default function LowStockPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [threshold, setThreshold] = useState<number>(10);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: response, isLoading, refetch } = useGetLowStockMedicinesQuery({
    threshold,
    page,
    limit,
  });
  const [adjustMedicine, setAdjustMedicine] = useState<Medicine | null>(null);

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
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span>{t('medicines.lowStockTitle')}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('medicines.lowStockSubtitle')}
          </p>
        </div>

        {/* Threshold Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Threshold:</span>
            <select
              value={threshold}
              onChange={(e) => {
                setThreshold(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={5} className="dark:bg-slate-850">&le; 5 units</option>
              <option value={10} className="dark:bg-slate-850">&le; 10 units</option>
              <option value={20} className="dark:bg-slate-850">&le; 20 units</option>
              <option value={50} className="dark:bg-slate-850">&le; 50 units</option>
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
          icon={<AlertTriangle className="w-8 h-8 text-emerald-500" />}
          title={t('dashboard.allGoodBadge')}
          description={`None of your medicines have stock below ${threshold} units.`}
          actionLabel={t('medicines.inventoryTitle')}
          onAction={() => router.push('/medicines')}
        />
      ) : (
        <div className="glass-card rounded-2xl border border-amber-200/60 dark:border-amber-900/40 overflow-hidden shadow-sm">
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              {medicines.length} Medicines Require Immediate Re-ordering
            </span>
            <Link href="/suppliers">
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline">
                Contact Suppliers &rarr;
              </span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">{t('pharmacies.colMedicineGeneric')}</th>
                  <th className="py-3 px-4">{t('pharmacies.colCategory')}</th>
                  <th className="py-3 px-4">{t('pharmacies.colStockLevel')}</th>
                  <th className="py-3 px-4">{t('pharmacies.colCostPrice')}</th>
                  <th className="py-3 px-4 text-right">{t('common.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/70 dark:bg-slate-900/60">
                {medicines.map((med) => {
                  const stock = Number(med.stock) || 0;
                  return (
                    <tr key={med.id} className="hover:bg-amber-50/20 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{med.name}</div>
                        {med.genericName && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">{med.genericName}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="neutral">{med.category}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {stock === 0 ? (
                          <Badge variant="danger" pulse>
                            0 Out of Stock
                          </Badge>
                        ) : (
                          <Badge variant="warning" pulse>
                            {stock} {t('header.units')}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                        {formatCurrency(med.buyingPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setAdjustMedicine(med)}
                          className="gap-1.5"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>{t('medicines.adjustStock')}</span>
                        </Button>
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

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={Boolean(adjustMedicine)}
        onClose={() => setAdjustMedicine(null)}
        medicine={adjustMedicine}
      />
    </div>
  );
}
