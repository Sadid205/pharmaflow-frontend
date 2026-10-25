'use client';

import React, { useState } from 'react';
import { Truck, Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  Supplier,
} from '@/redux/api/supplierApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useLanguage } from '@/context/LanguageContext';

export default function SuppliersPage() {
  const { t } = useLanguage();
  const { data: response, isLoading } = useGetSuppliersQuery();
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteSupplierItem, setDeleteSupplierItem] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  });

  const suppliers = response?.data || [];

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson || '',
      phone: sup.phone,
      email: sup.email || '',
      address: sup.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Supplier company name and phone are required');
      return;
    }

    try {
      if (editingSupplier) {
        const res = await updateSupplier({
          id: editingSupplier.id,
          ...formData,
        }).unwrap();
        if (res.success) {
          toast.success('Supplier updated successfully');
          setIsModalOpen(false);
        }
      } else {
        const res = await createSupplier(formData).unwrap();
        if (res.success) {
          toast.success('Supplier added successfully');
          setIsModalOpen(false);
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(errorObj.data?.message || errorObj.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteSupplierItem) return;
    try {
      const res = await deleteSupplier(deleteSupplierItem.id).unwrap();
      if (res.success) {
        toast.success(`Deleted supplier "${deleteSupplierItem.name}"`);
        setDeleteSupplierItem(null);
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(errorObj.data?.message || errorObj.message || 'Failed to delete supplier');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>{t('suppliers.title')}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('suppliers.subtitle')}
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="md" className="gap-2">
          <Plus className="w-4 h-4" />
          <span>{t('suppliers.addSupplier')}</span>
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : suppliers.length === 0 ? (
        <EmptyState
          icon={<Truck className="w-8 h-8" />}
          title={t('suppliers.noSuppliers')}
          description={t('suppliers.subtitle')}
          actionLabel={t('suppliers.addSupplier')}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{sup.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(sup)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteSupplierItem(sup)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {sup.contactPerson && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Contact: {sup.contactPerson}
                  </p>
                )}

                <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{sup.phone}</span>
                  </div>

                  {sup.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span>{sup.email}</span>
                    </div>
                  )}

                  {sup.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{sup.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`tel:${sup.phone}`}
                  className="block text-center py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Call Supplier
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? t('suppliers.title') : t('suppliers.addSupplier')}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label={`${t('suppliers.supplierName')} *`}
            placeholder="e.g. Square Pharmaceuticals Ltd."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label={t('suppliers.contactPerson')}
            placeholder="e.g. Tanvir Hossain (Sales Manager)"
            value={formData.contactPerson}
            onChange={(e) =>
              setFormData({ ...formData, contactPerson: e.target.value })
            }
          />

          <Input
            label={`${t('common.phone')} *`}
            placeholder="+8801700000000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <Input
            label={t('common.email')}
            type="email"
            placeholder="sales@supplier.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label={t('common.address')}
            placeholder="Warehouse Address / Office Location"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isCreating || isUpdating}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating || isUpdating}
            >
              {editingSupplier ? t('common.save') : t('suppliers.addSupplier')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteSupplierItem)}
        onClose={() => setDeleteSupplierItem(null)}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={`Are you sure you want to delete supplier "${deleteSupplierItem?.name}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
}
