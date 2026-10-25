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
  useGetMedicineCategoriesQuery,
  useDeleteMedicineMutation,
  Medicine,
} from '@/redux/api/medicineApi';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/lib/utils';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { MedicineCard } from '@/components/medicines/MedicineCard';
import { MedicineModal } from '@/components/medicines/MedicineModal';
import { StockAdjustmentModal } from '@/components/medicines/StockAdjustmentModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useLanguage } from '@/context/LanguageContext';

export default function MedicinesPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedSearch = useDebounce(searchTerm, 350);

  // Dynamic Categories from Backend
  const { data: categoriesResponse } = useGetMedicineCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  // Reset to page 1 on search / filter changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  // RTK Query
  const { data: medicinesResponse, isLoading } = useGetMedicinesQuery({
    search: debouncedSearch || undefined,
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
    page,
    limit,
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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {t('medicines.inventoryTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('medicines.inventorySubtitle')}
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="md" className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          <span>{t('medicines.addMedicine')}</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200/80 dark:border-slate-800/80">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('medicines.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Category Filter & View Mode Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="ALL">{t('medicines.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Grid / Table Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={t('medicines.gridView')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={t('medicines.tableView')}
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
          title={t('medicines.noMedicines')}
          description={
            searchTerm || selectedCategory !== 'ALL'
              ? t('medicines.noMedicines')
              : t('medicines.noMedicinesDesc')
          }
          actionLabel={t('medicines.addMedicine')}
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
        <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">{t('pharmacies.colMedicineGeneric')}</th>
                  <th className="py-3.5 px-4">{t('pharmacies.colCategory')}</th>
                  <th className="py-3.5 px-4">{t('pharmacies.colStockLevel')}</th>
                  <th className="py-3.5 px-4">{t('pharmacies.colCostPrice')}</th>
                  <th className="py-3.5 px-4">{t('pharmacies.colSellingPrice')}</th>
                  <th className="py-3.5 px-4">{t('pharmacies.colExpiryDate')}</th>
                  <th className="py-3.5 px-4 text-right">{t('common.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/60 dark:bg-slate-900/60">
                {medicines.map((med) => {
                  const stock = Number(med.stock) || 0;
                  return (
                    <tr
                      key={med.id}
                      className="hover:bg-teal-50/30 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{med.name}</div>
                        {med.genericName && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 italic">
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
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                        {formatCurrency(med.buyingPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-teal-700 dark:text-teal-400">
                        {formatCurrency(med.sellingPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {formatDate(med.expDate)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setStockModalMedicine(med)}
                            title="Adjust Stock"
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(med)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmMedicine(med)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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

      {/* Pagination Controls */}
      {!isLoading && medicines.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={medicinesResponse?.meta?.totalPages || Math.max(1, Math.ceil((medicinesResponse?.meta?.total || medicines.length) / limit))}
          totalItems={medicinesResponse?.meta?.total}
          pageSize={limit}
          pageSizeOptions={[10, 20, 50, 100]}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          itemLabel={t('common.medicines')}
        />
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
        title={t('medicines.deleteConfirmTitle')}
        message={deleteConfirmMedicine ? `${t('medicines.deleteConfirmMessage')} (${deleteConfirmMedicine.name})` : ''}
        confirmText={t('medicines.deleteMedicine')}
        isLoading={isDeleting}
      />
    </div>
  );
}
