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
import { formatCurrency } from '@/lib/utils';

export default function LowStockPage() {
  const router = useRouter();
  const [threshold, setThreshold] = useState<number>(10);
  const { data: response, isLoading, refetch } = useGetLowStockMedicinesQuery(threshold);
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
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Medicines
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span>Low Stock Critical Alerts</span>
          </h1>
          <p className="text-sm text-slate-500">
            Medicines that have reached or fallen below your minimum inventory threshold.
          </p>
        </div>

        {/* Threshold Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-600">Threshold:</span>
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={5}>&le; 5 units</option>
              <option value={10}>&le; 10 units</option>
              <option value={20}>&le; 20 units</option>
              <option value={50}>&le; 50 units</option>
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh list">
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
          title="No low stock alerts!"
          description={`Great news! None of your medicines have stock below ${threshold} units.`}
          actionLabel="View All Medicines"
          onAction={() => router.push('/medicines')}
        />
      ) : (
        <div className="glass-card rounded-2xl border border-amber-200/60 overflow-hidden shadow-sm">
          <div className="p-4 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              {medicines.length} Medicines Require Immediate Re-ordering
            </span>
            <Link href="/suppliers">
              <span className="text-xs font-semibold text-teal-700 hover:underline">
                Contact Suppliers &rarr;
              </span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Medicine Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Cost Price</th>
                  <th className="py-3 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/70">
                {medicines.map((med) => {
                  const stock = Number(med.stock) || 0;
                  return (
                    <tr key={med.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{med.name}</div>
                        {med.genericName && (
                          <div className="text-xs text-slate-500">{med.genericName}</div>
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
                            {stock} units remaining
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
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
                          <span>Restock</span>
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

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={Boolean(adjustMedicine)}
        onClose={() => setAdjustMedicine(null)}
        medicine={adjustMedicine}
      />
    </div>
  );
}
