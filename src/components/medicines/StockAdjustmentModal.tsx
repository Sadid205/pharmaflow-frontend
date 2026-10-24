'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Medicine, useUpdateMedicineMutation } from '@/redux/api/medicineApi';
import { toast } from 'sonner';
import { Plus, Minus } from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  medicine,
}: StockAdjustmentModalProps) {
  const [newStock, setNewStock] = useState<number>(0);
  const [updateMedicine, { isLoading }] = useUpdateMedicineMutation();

  useEffect(() => {
    if (medicine) {
      setNewStock(Number(medicine.stock) || 0);
    }
  }, [medicine, isOpen]);

  if (!medicine) return null;

  const currentStock = Number(medicine.stock) || 0;
  const difference = newStock - currentStock;

  const handleSave = async () => {
    try {
      const response = await updateMedicine({
        id: medicine.id,
        stock: newStock,
      }).unwrap();

      if (response.success) {
        toast.success(`Stock updated for ${medicine.name}`);
        onClose();
      } else {
        toast.error(response.message || 'Failed to update stock');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(errorObj.data?.message || errorObj.message || 'Error updating stock');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Stock Adjustment"
      description={`Update in-stock quantity for ${medicine.name}`}
      maxWidth="sm"
    >
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Current Stock:</span>
          <span className="text-base font-bold text-slate-800">
            {currentStock} units
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            New Stock Units
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNewStock((prev) => Math.max(0, prev - 10))}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <Input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(Math.max(0, parseInt(e.target.value) || 0))}
              className="text-center font-bold text-lg"
            />

            <button
              type="button"
              onClick={() => setNewStock((prev) => prev + 10)}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center pt-1">
            {difference > 0 ? (
              <span className="text-emerald-600 font-semibold">
                +{difference} units will be added
              </span>
            ) : difference < 0 ? (
              <span className="text-rose-600 font-semibold">
                {difference} units will be removed
              </span>
            ) : (
              'No changes made'
            )}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isLoading}>
            Apply Adjustment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
