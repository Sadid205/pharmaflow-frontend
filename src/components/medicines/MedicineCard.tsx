'use client';

import React from 'react';
import { Medicine } from '@/redux/api/medicineApi';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils';
import {
  Edit,
  Trash2,
  Calendar,
  Layers,
  TrendingUp,
} from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onDelete: (medicine: Medicine) => void;
  onAdjustStock?: (medicine: Medicine) => void;
}

export function MedicineCard({
  medicine,
  onEdit,
  onDelete,
  onAdjustStock,
}: MedicineCardProps) {
  const stock = Number(medicine.stock) || 0;
  const buyingPrice = Number(medicine.buyingPrice) || 0;
  const sellingPrice = Number(medicine.sellingPrice) || 0;
  const margin =
    sellingPrice > 0
      ? Math.round(((sellingPrice - buyingPrice) / sellingPrice) * 100)
      : 0;

  const daysUntilExp = getDaysUntil(medicine.expDate);
  const isExpiringSoon = daysUntilExp <= 30 && daysUntilExp >= 0;
  const isExpired = daysUntilExp < 0;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden bg-white/90">
      {/* Top Accent Line based on stock */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          stock === 0
            ? 'bg-rose-500'
            : stock <= 10
            ? 'bg-amber-500'
            : 'bg-teal-500'
        }`}
      />

      <div>
        {/* Header: Category & Stock Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="primary" className="text-[11px] font-semibold">
            {medicine.category}
          </Badge>

          {stock === 0 ? (
            <Badge variant="danger" pulse>
              Out of Stock
            </Badge>
          ) : stock <= 10 ? (
            <Badge variant="warning" pulse>
              Low Stock: {stock}
            </Badge>
          ) : (
            <Badge variant="success">In Stock: {stock}</Badge>
          )}
        </div>

        {/* Medicine Name & Generic */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
            {medicine.name}
          </h3>
          {medicine.genericName && (
            <p className="text-xs text-slate-500 italic line-clamp-1 mt-0.5">
              {medicine.genericName}
            </p>
          )}
        </div>

        {/* Financial info: Buying, Selling, Margin */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Retail Price:</span>
            <span className="font-extrabold text-teal-700 text-sm">
              {formatCurrency(sellingPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Cost Price:</span>
            <span className="font-semibold text-slate-600">
              {formatCurrency(buyingPrice)}
            </span>
          </div>
          <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" /> Margin:
            </span>
            <span
              className={`font-bold ${
                margin >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {margin}%
            </span>
          </div>
        </div>

        {/* Expiry & Batch Details */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Exp: {formatDate(medicine.expDate)}</span>
          </div>

          {isExpired ? (
            <span className="text-[11px] font-bold text-rose-600">Expired</span>
          ) : isExpiringSoon ? (
            <span className="text-[11px] font-bold text-amber-600">
              {daysUntilExp} days left
            </span>
          ) : null}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {onAdjustStock && (
          <button
            type="button"
            onClick={() => onAdjustStock(medicine)}
            className="text-xs font-semibold text-slate-600 hover:text-teal-600 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stock ({stock})</span>
          </button>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => onEdit(medicine)}
            title="Edit Medicine"
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(medicine)}
            title="Delete Medicine"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
