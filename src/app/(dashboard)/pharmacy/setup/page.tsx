'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Building, Phone, MapPin, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreatePharmacyMutation } from '@/redux/api/pharmacyApi';

export default function PharmacySetupPage() {
  const router = useRouter();
  const [createPharmacy, { isLoading }] = useCreatePharmacyMutation();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.phone.trim()) {
      toast.error('All fields are required to setup your pharmacy');
      return;
    }

    try {
      const response = await createPharmacy(formData).unwrap();
      if (response.success) {
        toast.success('Pharmacy profile created successfully!');
        router.push('/dashboard');
      } else {
        toast.error(response.message || 'Failed to setup pharmacy');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(errorObj.data?.message || errorObj.message || 'Setup error');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/60 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center shadow-inner">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Setup Your Pharmacy Store
          </h1>
          <p className="text-sm text-slate-500">
            Provide your store identity, license address, and customer contact number
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Pharmacy Store Name *"
            placeholder="e.g. PharmaFlow Central Pharmacy"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            leftIcon={<Building className="w-4 h-4" />}
            required
          />

          <Input
            label="Official Contact Phone *"
            placeholder="+8801700000000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Pharmacy Physical Address *
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
                className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            size="lg"
            isLoading={isLoading}
          >
            <span>Complete Setup & Open Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
