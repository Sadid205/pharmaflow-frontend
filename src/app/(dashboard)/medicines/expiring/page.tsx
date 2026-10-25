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

export default function ExpiringMedicinesPage() {
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
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Medicines
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-rose-500" />
            <span>Expiring Soon Medicines</span>
          </h1>
          <p className="text-sm text-slate-500">
            Monitor and liquidate batches reaching their expiration date soon.
          </p>
        </div>

        {/* Days Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-600">Time window:</span>
            <select
              value={days}
              onChange={(e) => {
                setDays(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={15}>Within 15 days</option>
              <option value={30}>Within 30 days</option>
              <option value={60}>Within 60 days</option>
              <option value={90}>Within 90 days</option>
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh">
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
          title="No expiring medicines!"
          description={`None of your medicinal batches are expiring within the next ${days} days.`}
          actionLabel="View All Medicines"
          onAction={() => router.push('/medicines')}
        />
      ) : (
        <div className="glass-card rounded-2xl border border-rose-200/60 overflow-hidden shadow-sm">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {medicines.length} Batches Expiring in {days} Days
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Medicine Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Countdown Status</th>
                  <th className="py-3 px-4 text-right">Potential Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/70">
                {medicines.map((med) => {
                  const stock = Number(med.stock) || 0;
                  const buyingPrice = Number(med.buyingPrice) || 0;
                  const potentialLoss = stock * buyingPrice;
                  const daysLeft = getDaysUntil(med.expDate);
                  const isExpired = daysLeft < 0;

                  return (
                    <tr key={med.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {med.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="neutral">{med.category}</Badge>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {stock} units
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
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
                      <td className="py-3.5 px-4 text-right font-extrabold text-rose-600">
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
          itemLabel="expiring medicines"
        />
      )}
    </div>
  );
}
