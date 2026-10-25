'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Medicine,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useGetMedicineCategoriesQuery,
} from '@/redux/api/medicineApi';
import { useLanguage } from '@/context/LanguageContext';

const medicineFormSchema = z.object({
  name: z.string().min(2, 'Medicine name must be at least 2 characters'),
  genericName: z.string().optional(),
  category: z.string().min(1, 'Please enter or select a category'),
  buyingPrice: z.coerce.number().min(0.01, 'Buying price must be greater than 0'),
  sellingPrice: z.coerce.number().min(0.01, 'Selling price must be greater than 0'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  mfgDate: z.string().optional(),
  expDate: z.string().min(1, 'Expiry date is required'),
  batchNumber: z.string().optional(),
  dosage: z.string().optional(),
  manufacturer: z.string().optional(),
});

type MedicineFormData = z.infer<typeof medicineFormSchema>;

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicineToEdit?: Medicine | null;
}

export function MedicineModal({
  isOpen,
  onClose,
  medicineToEdit,
}: MedicineModalProps) {
  const { t } = useLanguage();
  const isEditing = Boolean(medicineToEdit);

  const [createMedicine, { isLoading: isCreating }] = useCreateMedicineMutation();
  const [updateMedicine, { isLoading: isUpdating }] = useUpdateMedicineMutation();
  const { data: categoriesResponse } = useGetMedicineCategoriesQuery();
  const dynamicCategories = categoriesResponse?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      name: '',
      genericName: '',
      category: '',
      buyingPrice: 0,
      sellingPrice: 0,
      stock: 0,
      mfgDate: '',
      expDate: '',
      batchNumber: '',
      dosage: '',
      manufacturer: '',
    },
  });

  useEffect(() => {
    if (medicineToEdit) {
      reset({
        name: medicineToEdit.name,
        genericName: medicineToEdit.genericName || '',
        category: medicineToEdit.category || '',
        buyingPrice: Number(medicineToEdit.buyingPrice) || 0,
        sellingPrice: Number(medicineToEdit.sellingPrice) || 0,
        stock: Number(medicineToEdit.stock) || 0,
        mfgDate: medicineToEdit.mfgDate ? medicineToEdit.mfgDate.split('T')[0] : '',
        expDate: medicineToEdit.expDate ? medicineToEdit.expDate.split('T')[0] : '',
        batchNumber: medicineToEdit.batchNumber || '',
        dosage: medicineToEdit.dosage || '',
        manufacturer: medicineToEdit.manufacturer || '',
      });
    } else {
      reset({
        name: '',
        genericName: '',
        category: '',
        buyingPrice: 0,
        sellingPrice: 0,
        stock: 0,
        mfgDate: '',
        expDate: '',
        batchNumber: '',
        dosage: '',
        manufacturer: '',
      });
    }
  }, [medicineToEdit, reset, isOpen]);

  const onSubmit = async (data: MedicineFormData) => {
    try {
      if (isEditing && medicineToEdit) {
        const response = await updateMedicine({
          id: medicineToEdit.id,
          ...data,
          mfgDate: data.mfgDate ? new Date(data.mfgDate).toISOString() : undefined,
          expDate: new Date(data.expDate).toISOString(),
        }).unwrap();

        if (response.success) {
          toast.success('Medicine updated successfully!');
          onClose();
        } else {
          toast.error(response.message || 'Failed to update medicine.');
        }
      } else {
        const response = await createMedicine({
          ...data,
          mfgDate: data.mfgDate ? new Date(data.mfgDate).toISOString() : undefined,
          expDate: new Date(data.expDate).toISOString(),
        }).unwrap();

        if (response.success) {
          toast.success('Medicine added successfully to inventory!');
          onClose();
        } else {
          toast.error(response.message || 'Failed to add medicine.');
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(
        errorObj.data?.message || errorObj.message || 'Error processing medicine.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('medicines.editMedicine') : t('medicines.addMedicine')}
      description={
        isEditing
          ? t('medicines.inventorySubtitle')
          : t('medicines.inventorySubtitle')
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1: Name and Generic Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('name')}
            label="Medicine Brand Name *"
            placeholder="e.g. Napa Extra 500mg"
            error={errors.name?.message}
          />

          <Input
            {...register('genericName')}
            label="Generic Formula Name"
            placeholder="e.g. Paracetamol + Caffeine"
            error={errors.genericName?.message}
          />
        </div>

        {/* Row 2: Category and Dosage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Form / Category *
            </label>
            <select
              {...register('category')}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 py-2.5 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            >
              <option value="" className="dark:bg-slate-800">-- Select Category --</option>
              {dynamicCategories.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-slate-800">
                  {cat}
                </option>
              ))}
            </select>
            {errors.category?.message && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.category.message}
              </p>
            )}
          </div>

          <Input
            {...register('dosage')}
            label="Dosage Strength"
            placeholder="e.g. 500mg or 100ml"
            error={errors.dosage?.message}
          />
        </div>

        {/* Row 3: Buying Price, Selling Price, and Initial Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            {...register('buyingPrice')}
            type="number"
            step="0.01"
            label="Wholesale Cost Price (৳) *"
            placeholder="0.00"
            error={errors.buyingPrice?.message}
          />

          <Input
            {...register('sellingPrice')}
            type="number"
            step="0.01"
            label="Retail Sale Price (৳) *"
            placeholder="0.00"
            error={errors.sellingPrice?.message}
          />

          <Input
            {...register('stock')}
            type="number"
            label="Current Stock Units *"
            placeholder="0"
            error={errors.stock?.message}
          />
        </div>

        {/* Row 4: Manufacturing Date & Expiry Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('mfgDate')}
            type="date"
            label="Manufacture Date (Optional)"
            error={errors.mfgDate?.message}
          />

          <Input
            {...register('expDate')}
            type="date"
            label="Expiry Date *"
            error={errors.expDate?.message}
          />
        </div>

        {/* Row 5: Batch Number & Manufacturer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('batchNumber')}
            label="Batch Number"
            placeholder="e.g. BATCH-2026-A1"
            error={errors.batchNumber?.message}
          />

          <Input
            {...register('manufacturer')}
            label="Manufacturer / Pharma Brand"
            placeholder="e.g. Beximco, Square, Incepta"
            error={errors.manufacturer?.message}
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isCreating || isUpdating}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isCreating || isUpdating}
          >
            {isEditing ? t('common.save') : t('medicines.addMedicine')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
