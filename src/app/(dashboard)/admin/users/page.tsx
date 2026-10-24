'use client';

import React, { useState } from 'react';
import { Users, ShieldCheck, CheckCircle, Ban } from 'lucide-react';
import { toast } from 'sonner';

import {
  useGetAllUsersQuery,
  useToggleUserBlockStatusMutation,
  AdminUser,
} from '@/redux/api/pharmacyApi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export default function AdminUsersPage() {
  const { data: response, isLoading } = useGetAllUsersQuery();
  const [toggleBlock, { isLoading: isToggling }] = useToggleUserBlockStatusMutation();

  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);

  const users = response?.data || [];

  const handleToggleBlock = async () => {
    if (!confirmUser) return;
    try {
      const nextStatus = !confirmUser.isBlocked;
      const res = await toggleBlock({
        userId: confirmUser.id,
        isBlocked: nextStatus,
      }).unwrap();

      if (res.success) {
        toast.success(
          `User ${confirmUser.name} has been ${nextStatus ? 'blocked' : 'unblocked'}`
        );
        setConfirmUser(null);
      } else {
        toast.error(res.message || 'Action failed');
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(errorObj.data?.message || errorObj.message || 'Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-teal-600" />
          <span>User Accounts & Access Control</span>
        </h1>
        <p className="text-sm text-slate-500">
          Manage system credentials, pharmacy owner access, and security permissions.
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Users Registered"
          description="There are currently no accounts in the user database."
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Email Verified</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/70">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={u.role === 'SUPER_ADMIN' ? 'secondary' : 'primary'}
                      >
                        {u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Pharmacy Owner'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isBlocked ? (
                        <Badge variant="danger" pulse>
                          Blocked
                        </Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'SUPER_ADMIN' && (
                        <Button
                          size="sm"
                          variant={u.isBlocked ? 'outline' : 'danger'}
                          onClick={() => setConfirmUser(u)}
                          className="text-xs gap-1"
                        >
                          {u.isBlocked ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                              <span>Unblock</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              <span>Block User</span>
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmUser)}
        onClose={() => setConfirmUser(null)}
        onConfirm={handleToggleBlock}
        title={confirmUser?.isBlocked ? 'Unblock Account' : 'Block User Access'}
        message={`Are you sure you want to ${
          confirmUser?.isBlocked ? 'restore access for' : 'block access for'
        } ${confirmUser?.name}?`}
        confirmText={confirmUser?.isBlocked ? 'Unblock User' : 'Block Account'}
        isDestructive={!confirmUser?.isBlocked}
        isLoading={isToggling}
      />
    </div>
  );
}
