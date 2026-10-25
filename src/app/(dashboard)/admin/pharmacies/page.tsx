'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Store, User, Phone, MapPin } from 'lucide-react';
import { useGetAllPharmaciesQuery } from '@/redux/api/pharmacyApi';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminPharmaciesPage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: response, isLoading } = useGetAllPharmaciesQuery({ page, limit });

  const pharmacies = response?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <span>{t('pharmacies.title')}</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('pharmacies.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : pharmacies.length === 0 ? (
        <EmptyState
          icon={<Store className="w-8 h-8" />}
          title={t('pharmacies.noPharmacies')}
          description={t('pharmacies.noPharmacies')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pharmacies.map((pharm) => (
            <Link
              key={pharm.id}
              href={`/admin/pharmacies/${pharm.id}`}
              className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-teal-500/50 hover:-translate-y-1 transition-all space-y-4 group block"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {pharm.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('pharmacies.owner')}: {pharm.owner?.name || 'Assigned Owner'}</span>
                  </div>
                </div>

                <Badge variant="primary">
                  {pharm._count?.medicines ?? 0} {t('pharmacies.medsCount')}
                </Badge>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>{pharm.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{pharm.address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span className="text-teal-600 dark:text-teal-400 font-semibold group-hover:underline flex items-center gap-1">
                  {t('pharmacies.viewStoreInventory')}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('pharmacies.activeStore')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && pharmacies.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={response?.meta?.totalPages || Math.max(1, Math.ceil((response?.meta?.total || pharmacies.length) / limit))}
          totalItems={response?.meta?.total}
          pageSize={limit}
          pageSizeOptions={[6, 9, 12, 24]}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          itemLabel={t('common.pharmacies')}
        />
      )}
    </div>
  );
}
