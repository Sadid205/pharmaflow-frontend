'use client';

import React, { useState, useEffect } from 'react';
import { Store, Building, Phone, MapPin, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  useGetMyPharmacyQuery,
  useCreatePharmacyMutation,
  useUpdateMyPharmacyMutation,
} from '@/redux/api/pharmacyApi';
import { formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';

export default function PharmacySettingsPage() {
  const { data: response, isLoading } = useGetMyPharmacyQuery();
  const [createPharmacy, { isLoading: isCreating }] = useCreatePharmacyMutation();
  const [updatePharmacy, { isLoading: isUpdating }] = useUpdateMyPharmacyMutation();

  const pharmacy = response?.data;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    if (pharmacy) {
      setFormData({
        name: pharmacy.name || '',
        address: pharmacy.address || '',
        phone: pharmacy.phone || '',
      });
    }
  }, [pharmacy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.phone.trim()) {
      toast.error('All fields are required for your pharmacy profile');
      return;
    }

    try {
      if (!pharmacy) {
        // If no pharmacy exists yet, create it
        const res = await createPharmacy(formData).unwrap();
        if (res.success) {
          toast.success('Pharmacy profile created successfully!');
        } else {
          toast.error(res.message || 'Creation failed');
        }
      } else {
        // If pharmacy already exists, update it
        const res = await updatePharmacy(formData).unwrap();
        if (res.success) {
          toast.success('Pharmacy profile updated successfully!');
        } else {
          toast.error(res.message || 'Update failed');
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(
        errorObj.data?.message ||
          errorObj.message ||
          (pharmacy ? 'Failed to update pharmacy' : 'Failed to create pharmacy')
      );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <TableSkeleton rows={4} cols={2} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Store className="w-6 h-6 text-teal-600" />
          <span>Pharmacy Store Profile & Settings</span>
        </h1>
        <p className="text-sm text-slate-500">
          Manage your business information that appears on receipts, invoices, and customer communications.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/60 shadow-lg space-y-6">
        {/* Status card */}
        {pharmacy ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-teal-50/60 border border-teal-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {pharmacy.name || 'My Pharmacy'}
                </h3>
                <p className="text-xs text-slate-500">
                  Registered on {formatDate(pharmacy.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Verified Pharmacy</Badge>
              <Badge variant="primary">
                {pharmacy._count?.medicines ?? 0} Catalog Medicines
              </Badge>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-sm">
                Pharmacy Store Setup Required
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                No pharmacy store found for your account yet. Please fill in the details below to create your official pharmacy profile.
              </p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Pharmacy Store Name"
            placeholder="e.g. PharmaFlow Central Pharmacy"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            leftIcon={<Building className="w-4 h-4" />}
            required
          />

          <Input
            label="Store Phone Contact"
            placeholder="+8801700000000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Physical Address & Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <textarea
                rows={3}
                placeholder="House 12, Road 5, Dhanmondi, Dhaka"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="gap-2"
              isLoading={isUpdating || isCreating}
            >
              <Save className="w-4 h-4" />
              <span>{pharmacy ? 'Save Pharmacy Profile' : 'Create & Setup Pharmacy Profile'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
