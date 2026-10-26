'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  ArrowRight,
  TrendingUp,
  Banknote,
  CreditCard,
  AlertCircle,
  Clock,
  Printer,
  User,
  Phone,
  CheckCircle,
  HelpCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import {
  useGetSalesQuery,
  useGetTodaySummaryQuery,
  SaleRecord,
} from '@/redux/api/salesApi';
import { useGetMyPharmacyQuery } from '@/redux/api/pharmacyApi';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { CollectDueModal } from '@/components/sales/CollectDueModal';
import { InvoiceReceiptModal } from '@/components/pos/InvoiceReceiptModal';

export default function SalesPage() {
  const { t } = useLanguage();

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DUE' | 'PARTIAL' | 'PAID'>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Selected Sale for Collect Due Modal
  const [selectedDueSale, setSelectedDueSale] = useState<SaleRecord | null>(null);
  const [isCollectDueOpen, setIsCollectDueOpen] = useState(false);

  // Selected Sale for Receipt Modal
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<SaleRecord | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Queries
  const { data: pharmacyData } = useGetMyPharmacyQuery();
  const { data: todaySummaryData } = useGetTodaySummaryQuery();

  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
    };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (statusFilter !== 'ALL') params.paymentStatus = statusFilter;
    if (methodFilter !== 'ALL') params.paymentMethod = methodFilter;
    return params;
  }, [searchTerm, statusFilter, methodFilter, page, limit]);

  const { data: salesResponse, isLoading, isFetching } = useGetSalesQuery(queryParams);

  const salesList = (salesResponse?.data as unknown as SaleRecord[]) || [];
  const meta = (salesResponse as any)?.meta || {
    total: salesList.length,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const todaySummary = todaySummaryData?.data;

  // Handler to open collect due
  const handleOpenCollectDue = (sale: SaleRecord) => {
    setSelectedDueSale(sale);
    setIsCollectDueOpen(true);
  };

  // Handler to open receipt view
  const handleOpenReceipt = (sale: SaleRecord) => {
    setSelectedReceiptSale(sale);
    setIsReceiptOpen(true);
  };

  const handleDueCollectedSuccess = (updatedSale: SaleRecord) => {
    // Optionally open the updated invoice receipt
    setSelectedReceiptSale(updatedSale);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <span>{t('sales.title')}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('sales.subtitle')}
          </p>
        </div>

        <Link href="/pos">
          <Button variant="primary" className="gap-2 shadow-lg shadow-teal-700/20">
            <Plus className="w-4 h-4" />
            <span>{t('nav.posBilling') || 'New POS Sale'}</span>
          </Button>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today Sales Volume */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {t('sales.totalRevenue')}
            </span>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100">
              {formatCurrency(todaySummary?.totalRevenue ?? 0)}
            </p>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
              Today: {todaySummary?.totalSalesCount ?? 0} {t('sales.itemsCount')}
            </span>
          </div>
        </div>

        {/* Card 2: Today Collected */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {t('sales.totalCollected')}
            </span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(todaySummary?.totalPaidRevenue ?? 0)}
            </p>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
              Cash &amp; Digital Payments
            </span>
          </div>
        </div>

        {/* Card 3: Due Receivable */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {t('sales.totalDueReceivable')}
            </span>
            <p className="text-lg font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(todaySummary?.totalDueAmount ?? 0)}
            </p>
            <span className="text-[10px] text-rose-500 font-semibold">
              {todaySummary?.dueSalesCount ?? 0} due invoices
            </span>
          </div>
        </div>

        {/* Card 4: Total Invoices */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {t('sales.totalInvoices')}
            </span>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100">
              {meta.total}
            </p>
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
              Filtered Records
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder={t('sales.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="flex items-center gap-2">
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Methods (সকল মাধ্যম)</option>
              <option value="CASH">Cash (ক্যাশ)</option>
              <option value="BKASH">bKash (বিকাশ)</option>
              <option value="NAGAD">Nagad (নগদ)</option>
              <option value="CARD">Card (কার্ড)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800 pt-3">
          {(
            [
              { id: 'ALL', label: t('sales.allSales') },
              { id: 'DUE', label: t('sales.dueSales') },
              { id: 'PARTIAL', label: t('sales.partialSales') },
              { id: 'PAID', label: t('sales.paidSales') },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sales Invoices List */}
      <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold">{t('common.loading')}</p>
          </div>
        ) : salesList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <Receipt className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t('sales.noSalesFound')}
            </p>
            <Link href="/pos">
              <Button variant="outline" size="sm" className="mt-2">
                {t('nav.posBilling')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Invoice # &amp; Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4 text-right">Total Bill</th>
                    <th className="py-3.5 px-4 text-right">Paid</th>
                    <th className="py-3.5 px-4 text-right">Due</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {salesList.map((sale) => {
                    const dueNum = Number(sale.dueAmount || 0);
                    const paidNum = Number(sale.paidAmount || 0);
                    const totalNum = Number(sale.totalAmount || 0);
                    const hasDue = dueNum > 0;

                    return (
                      <tr
                        key={sale.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors"
                      >
                        {/* Invoice & Date */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">
                            {sale.invoiceNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatDate(sale.createdAt)}
                          </span>
                        </td>

                        {/* Customer Info */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[140px]">
                            {sale.customerName || 'Walk-in Customer'}
                          </span>
                          {sale.customerPhone && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                              <Phone className="w-2.5 h-2.5" />
                              {sale.customerPhone}
                            </span>
                          )}
                        </td>

                        {/* Total Bill */}
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(totalNum)}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(paidNum)}
                        </td>

                        {/* Due Amount */}
                        <td className="py-3 px-4 text-right">
                          {hasDue ? (
                            <span className="font-black text-rose-600 dark:text-rose-400">
                              {formatCurrency(dueNum)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">৳0.00</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 text-center">
                          {sale.paymentStatus === 'PAID' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              PAID
                            </span>
                          )}
                          {sale.paymentStatus === 'PARTIAL' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              PARTIAL
                            </span>
                          )}
                          {sale.paymentStatus === 'DUE' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              DUE
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right space-x-2">
                          {hasDue && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenCollectDue(sale)}
                              className="text-xs py-1 px-2.5 font-bold shadow-xs bg-rose-600 hover:bg-rose-700 border-none"
                            >
                              <Banknote className="w-3.5 h-3.5 mr-1" />
                              <span>{t('sales.collectDue')}</span>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReceipt(sale)}
                            className="text-xs py-1 px-2.5"
                            title={t('sales.viewInvoice')}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {salesList.map((sale) => {
                const dueNum = Number(sale.dueAmount || 0);
                const paidNum = Number(sale.paidAmount || 0);
                const totalNum = Number(sale.totalAmount || 0);
                const hasDue = dueNum > 0;

                return (
                  <div key={sale.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 block">
                          {sale.invoiceNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatDate(sale.createdAt)}
                        </span>
                      </div>
                      <div>
                        {sale.paymentStatus === 'PAID' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            PAID
                          </span>
                        )}
                        {sale.paymentStatus === 'PARTIAL' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            PARTIAL
                          </span>
                        )}
                        {sale.paymentStatus === 'DUE' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            DUE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                          {sale.customerName || 'Walk-in Customer'}
                        </span>
                        {sale.customerPhone && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {sale.customerPhone}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Total Bill
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">
                          {formatCurrency(totalNum)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Paid: </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(paidNum)}
                        </span>
                      </div>
                      {hasDue && (
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Due: </span>
                          <span className="font-black text-rose-600 dark:text-rose-400">
                            {formatCurrency(dueNum)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {hasDue && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenCollectDue(sale)}
                          className="flex-1 text-xs py-1.5 font-bold bg-rose-600 hover:bg-rose-700 border-none shadow-xs"
                        >
                          <Banknote className="w-3.5 h-3.5 mr-1.5" />
                          <span>{t('sales.collectDue')}</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReceipt(sale)}
                        className={`${hasDue ? '' : 'w-full'} text-xs py-1.5 gap-1.5`}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{t('sales.viewInvoice')}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* System Pagination Controls */}
            {!isLoading && salesList.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <Pagination
                  currentPage={page}
                  totalPages={meta.totalPages || Math.max(1, Math.ceil((meta.total || salesList.length) / limit))}
                  totalItems={meta.total}
                  pageSize={limit}
                  pageSizeOptions={[10, 20, 50, 100]}
                  onPageChange={setPage}
                  onPageSizeChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                  itemLabel={t('sales.totalInvoices') || 'invoices'}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Collect Due Modal */}
      <CollectDueModal
        isOpen={isCollectDueOpen}
        onClose={() => {
          setIsCollectDueOpen(false);
          setSelectedDueSale(null);
        }}
        sale={selectedDueSale}
        onSuccess={handleDueCollectedSuccess}
      />

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedReceiptSale(null);
        }}
        sale={selectedReceiptSale}
        pharmacy={pharmacyData?.data}
      />
    </div>
  );
}
