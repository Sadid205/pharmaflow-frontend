'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List,
  Pill,
  Trash2,
  Edit,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useGetMedicinesQuery,
  useDeleteMedicineMutation,
  Medicine,
} from '@/redux/api/medicineApi';
import { useDebounce } from '@/hooks/useDebounce';
import { MEDICINE_CATEGORIES } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MedicineCard } from '@/components/medicines/MedicineCard';
import { MedicineModal } from '@/components/medicines/MedicineModal';
import { StockAdjustmentModal } from '@/components/medicines/StockAdjustmentModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export default function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const debouncedSearch = useDebounce(searchTerm, 350);

  // RTK Query
  const { data: medicinesResponse, isLoading } = useGetMedicinesQuery({
    search: debouncedSearch || undefined,
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
  });

  const [deleteMedicine, { isLoading: isDeleting }] = useDeleteMedicineMutation();

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null);

  const [stockModalMedicine, setStockModalMedicine] = useState<Medicine | null>(null);
  const [deleteConfirmMedicine, setDeleteConfirmMedicine] = useState<Medicine | null>(null);

  const medicines = medicinesResponse?.data || [];

  const handleOpenAdd = () => {
    setMedicineToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setMedicineToEdit(med);
    setIsFormModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmMedicine) return;

    try {
      const res = await deleteMedicine(deleteConfirmMedicine.id).unwrap();
      if (res.success) {
        toast.success(`Deleted ${deleteConfirmMedicine.name} from inventory`);
        setDeleteConfirmMedicine(null);
      } else {
        toast.error(res.message || 'Failed to delete medicine');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(errorObj.data?.message || errorObj.message || 'Error deleting medicine');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Medicines Inventory
          </h1>
          <p className="text-sm text-slate-500">
            Browse, manage, and monitor all medicine stocks in your pharmacy.
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="md" className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          <span>Add New Medicine</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by medicine or generic name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Category Filter & View Mode Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="ALL">All Categories</option>
              {MEDICINE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Grid / Table Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-teal-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white shadow-sm text-teal-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : medicines.length === 0 ? (
        <EmptyState
          icon={<Pill className="w-8 h-8" />}
          title="No medicines found"
          description={
            searchTerm || selectedCategory !== 'ALL'
              ? 'No medicines match your current search and filter criteria.'
              : 'Your pharmacy catalog is empty. Add your first medicine to get started!'
          }
          actionLabel="Add First Medicine"
          onAction={handleOpenAdd}
        />
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medicines.map((med) => (
            <MedicineCard
              key={med.id}
              medicine={med}
              onEdit={handleOpenEdit}
              onDelete={setDeleteConfirmMedicine}
              onAdjustStock={setStockModalMedicine}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Medicine Info</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Cost Price</th>
                  <th className="py-3.5 px-4">Retail Price</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/60">
                {medicines.map((med) => {
                  const stock = Number(med.stock) || 0;
                  return (
                    <tr
                      key={med.id}
                      className="hover:bg-teal-50/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{med.name}</div>
                        {med.genericName && (
                          <div className="text-xs text-slate-500 italic">
                            {med.genericName}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="primary">{med.category}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {stock === 0 ? (
                          <Badge variant="danger" pulse>
                            Out of Stock
                          </Badge>
                        ) : stock <= 10 ? (
                          <Badge variant="warning" pulse>
                            Low: {stock}
                          </Badge>
                        ) : (
                          <Badge variant="success">{stock} units</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {formatCurrency(med.buyingPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-teal-700">
                        {formatCurrency(med.sellingPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {formatDate(med.expDate)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setStockModalMedicine(med)}
                            title="Adjust Stock"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(med)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmMedicine(med)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <MedicineModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setMedicineToEdit(null);
        }}
        medicineToEdit={medicineToEdit}
      />

      <StockAdjustmentModal
        isOpen={Boolean(stockModalMedicine)}
        onClose={() => setStockModalMedicine(null)}
        medicine={stockModalMedicine}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteConfirmMedicine)}
        onClose={() => setDeleteConfirmMedicine(null)}
        onConfirm={handleDelete}
        title="Delete Medicine"
        message={`Are you sure you want to permanently delete "${deleteConfirmMedicine?.name}" from your pharmacy? This action cannot be undone.`}
        confirmText="Delete Medicine"
        isLoading={isDeleting}
      />
    </div>
  );
}
