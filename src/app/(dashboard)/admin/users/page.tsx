'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  CheckCircle,
  Ban,
  Search,
  RefreshCw,
  Building2,
  Phone,
  ShieldAlert,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useGetAllUsersQuery,
  useToggleUserBlockStatusMutation,
  AdminUser,
} from '@/redux/api/pharmacyApi';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

type RoleFilter = 'ALL' | 'SUPER_ADMIN' | 'PHARMACY_OWNER' | 'BLOCKED';

export default function AdminUsersPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const { data: response, isLoading, isFetching, refetch } = useGetAllUsersQuery();
  const [toggleBlock, { isLoading: isToggling }] = useToggleUserBlockStatusMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('ALL');
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);

  const users = response?.data || [];

  // Summary Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const superAdmins = users.filter((u) => u.role === 'SUPER_ADMIN').length;
    const pharmacyOwners = users.filter((u) => u.role === 'PHARMACY_OWNER').length;
    const blocked = users.filter((u) => u.isBlocked).length;
    const verified = users.filter((u) => u.isVerified).length;
    return { total, superAdmins, pharmacyOwners, blocked, verified };
  }, [users]);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role / status filter
      if (selectedRole === 'SUPER_ADMIN' && u.role !== 'SUPER_ADMIN') return false;
      if (selectedRole === 'PHARMACY_OWNER' && u.role !== 'PHARMACY_OWNER') return false;
      if (selectedRole === 'BLOCKED' && !u.isBlocked) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(query);
        const matchesEmail = u.email?.toLowerCase().includes(query);
        const matchesPhone = (u as { phone?: string | null }).phone?.toLowerCase().includes(query);
        const matchesPharmacy = u.pharmacy?.name?.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesPhone || matchesPharmacy;
      }

      return true;
    });
  }, [users, selectedRole, searchQuery]);

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
          `User ${confirmUser.name} has been ${nextStatus ? 'blocked' : 'unblocked'} successfully.`
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

  if (!isAdmin && !isLoading) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl border border-rose-200">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600 mt-1">
          Only Super Administrators have permission to access user accounts and permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <span>User Accounts & Access Control</span>
          </h1>
          <p className="text-sm text-slate-500">
            Monitor system accounts, inspect assigned pharmacy stores, and manage account statuses.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border-l-4 border-l-teal-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Users</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{stats.total}</p>
          <span className="text-[11px] text-teal-600 font-medium">Registered Platform Accounts</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border-l-4 border-l-purple-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Super Admins</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{stats.superAdmins}</p>
          <span className="text-[11px] text-purple-600 font-medium">Root Access Accounts</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border-l-4 border-l-emerald-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Pharmacy Owners</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{stats.pharmacyOwners}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Store Operators</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border-l-4 border-l-rose-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Blocked Users</span>
            <Ban className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{stats.blocked}</p>
          <span className="text-[11px] text-rose-600 font-medium">Restricted From Login</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by name, email, pharmacy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedRole('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRole === 'ALL'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('SUPER_ADMIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRole === 'SUPER_ADMIN'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Super Admins ({stats.superAdmins})
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('PHARMACY_OWNER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRole === 'PHARMACY_OWNER'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pharmacy Owners ({stats.pharmacyOwners})
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('BLOCKED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRole === 'BLOCKED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Blocked ({stats.blocked})
          </button>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title={searchQuery ? 'No matching users found' : 'No Users Registered'}
          description={
            searchQuery
              ? `No user records matched your search query "${searchQuery}".`
              : 'There are currently no accounts in the user database.'
          }
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Store / Pharmacy</th>
                  <th className="py-3 px-4">Email Status</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/70">
                {filteredUsers.map((u) => {
                  const isCurrentLoggedUser = currentUser?.email === u.email;
                  const isSuperAdmin = u.role === 'SUPER_ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-700 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                            {u.name?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrentLoggedUser && (
                                <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                            {(u as { phone?: string | null }).phone && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{(u as { phone?: string | null }).phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <Badge variant={isSuperAdmin ? 'secondary' : 'primary'}>
                          {isSuperAdmin ? 'Super Admin' : 'Pharmacy Owner'}
                        </Badge>
                      </td>

                      {/* Pharmacy Info */}
                      <td className="py-3.5 px-4">
                        {u.pharmacy ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="truncate max-w-[160px]">{u.pharmacy.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Pharmacy</span>
                        )}
                      </td>

                      {/* Email Verified */}
                      <td className="py-3.5 px-4">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <AlertTriangle className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4">
                        {u.isBlocked ? (
                          <Badge variant="danger" pulse>
                            Blocked
                          </Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {isSuperAdmin ? (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Protected Role
                          </span>
                        ) : (
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
                  );
                })}
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
        title={confirmUser?.isBlocked ? 'Unblock User Account' : 'Block User Account'}
        message={`Are you sure you want to ${
          confirmUser?.isBlocked ? 'restore access for' : 'block access for'
        } "${confirmUser?.name}" (${confirmUser?.email})? ${
          !confirmUser?.isBlocked
            ? 'They will not be able to log in to PharmaFlow until unblocked.'
            : 'They will immediately be able to log in.'
        }`}
        confirmText={confirmUser?.isBlocked ? 'Unblock Account' : 'Block Account'}
        isDestructive={!confirmUser?.isBlocked}
        isLoading={isToggling}
      />
    </div>
  );
}
