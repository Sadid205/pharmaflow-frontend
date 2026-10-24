'use client';

import React from 'react';
import { Building2, Store, User, Phone, MapPin } from 'lucide-react';
import { useGetAllPharmaciesQuery } from '@/redux/api/pharmacyApi';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';

export default function AdminPharmaciesPage() {
  const { data: response, isLoading } = useGetAllPharmaciesQuery();

  const pharmacies = response?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-teal-600" />
          <span>Tenant Pharmacies Oversight</span>
        </h1>
        <p className="text-sm text-slate-500">
          Super Admin view of all verified pharmacies registered on the PharmaFlow platform.
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : pharmacies.length === 0 ? (
        <EmptyState
          icon={<Store className="w-8 h-8" />}
          title="No registered pharmacies"
          description="No pharmacy stores found in the platform database."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pharmacies.map((pharm) => (
            <div
              key={pharm.id}
              className="glass-card rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {pharm.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Owner: {pharm.owner?.name || 'Assigned Owner'}</span>
                  </div>
                </div>

                <Badge variant="primary">
                  {pharm._count?.medicines ?? 0} Meds
                </Badge>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{pharm.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{pharm.address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>ID: {pharm.id.slice(0, 8)}...</span>
                <span className="text-emerald-600 font-semibold">Active Store</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
