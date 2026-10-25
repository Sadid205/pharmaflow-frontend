'use client';

import React, { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Pill, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  useGetSingleMedicineQuery,
  useUpdateMedicineMutation,
  useGetMedicineCategoriesQuery,
} from '@/redux/api/medicineApi';

const editMedicineSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  genericName: z.string().optional(),
  category: z.string().min(1, 'Please enter or select category'),
  buyingPrice: z.coerce.number().min(0.01, 'Buying price must be greater than 0'),
  sellingPrice: z.coerce.number().min(0.01, 'Selling price must be greater than 0'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  mfgDate: z.string().optional(),
  expDate: z.string().min(1, 'Expiry date is required'),
  batchNumber: z.string().optional(),
  dosage: z.string().optional(),
  manufacturer: z.string().optional(),
});

type EditMedicineFormData = z.infer<typeof editMedicineSchema>;

export default function EditMedicinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { data: response, isLoading: isLoadingMed } = useGetSingleMedicineQuery(id);
  const [updateMedicine, { isLoading: isUpdating }] = useUpdateMedicineMutation();
  const { data: categoriesResponse } = useGetMedicineCategoriesQuery();
  const dynamicCategories = categoriesResponse?.data || [];

  const medicine = response?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditMedicineFormData>({
    resolver: zodResolver(editMedicineSchema),
  });

  useEffect(() => {
    if (medicine) {
      reset({
        name: medicine.name,
        genericName: medicine.genericName || '',
        category: medicine.category,
        buyingPrice: Number(medicine.buyingPrice) || 0,
        sellingPrice: Number(medicine.sellingPrice) || 0,
        stock: Number(medicine.stock) || 0,
        mfgDate: medicine.mfgDate ? medicine.mfgDate.split('T')[0] : '',
        expDate: medicine.expDate ? medicine.expDate.split('T')[0] : '',
        batchNumber: medicine.batchNumber || '',
        dosage: medicine.dosage || '',
        manufacturer: medicine.manufacturer || '',
      });
    }
  }, [medicine, reset]);

  const onSubmit = async (data: EditMedicineFormData) => {
    try {
      const updateRes = await updateMedicine({
        id,
        ...data,
        mfgDate: data.mfgDate ? new Date(data.mfgDate).toISOString() : undefined,
        expDate: new Date(data.expDate).toISOString(),
      }).unwrap();

      if (updateRes.success) {
        toast.success('Medicine updated successfully!');
        router.push('/medicines');
      } else {
        toast.error(updateRes.message || 'Failed to update medicine.');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(
        errorObj.data?.message || errorObj.message || 'Error updating medicine.'
      );
    }
  };

  if (isLoadingMed) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
        <p className="text-sm text-slate-500">Loading medicine data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/medicines"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Inventory
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Pill className="w-6 h-6 text-teal-600" />
          <span>Edit Medicine: {medicine?.name}</span>
        </h1>
        <p className="text-sm text-slate-500">
          Modify retail prices, update batch numbers, or re-adjust current inventory shelf counts.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/60 shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register('name')}
              label="Medicine Brand Name *"
              error={errors.name?.message}
            />

            <Input
              {...register('genericName')}
              label="Generic Formula Name"
              error={errors.genericName?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Form / Category *
              </label>
              <select
                {...register('category')}
                className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="">-- Select Category --</option>
                {dynamicCategories.map((cat) => (
                  <option key={cat} value={cat}>
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
              error={errors.dosage?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              {...register('buyingPrice')}
              type="number"
              step="0.01"
              label="Cost Price (৳) *"
              error={errors.buyingPrice?.message}
            />

            <Input
              {...register('sellingPrice')}
              type="number"
              step="0.01"
              label="Retail Sale Price (৳) *"
              error={errors.sellingPrice?.message}
            />

            <Input
              {...register('stock')}
              type="number"
              label="Stock Units *"
              error={errors.stock?.message}
            />
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register('batchNumber')}
              label="Batch Number"
              error={errors.batchNumber?.message}
            />

            <Input
              {...register('manufacturer')}
              label="Manufacturer / Pharma Brand"
              error={errors.manufacturer?.message}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link href="/medicines">
              <Button type="button" variant="outline" disabled={isUpdating}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              className="gap-2"
              isLoading={isUpdating}
            >
              <Save className="w-4 h-4" />
              <span>Update Details</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
