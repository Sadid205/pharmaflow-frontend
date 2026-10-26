'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Phone,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useGetMedicinesQuery,
  useGetMedicineCategoriesQuery,
  Medicine,
} from '@/redux/api/medicineApi';
import { useGetMyPharmacyQuery } from '@/redux/api/pharmacyApi';
import { useCreateSaleMutation, SaleRecord } from '@/redux/api/salesApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCustomerInfo,
  setDiscount,
  setTax,
} from '@/redux/slices/cartSlice';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/lib/utils';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { InvoiceReceiptModal } from '@/components/pos/InvoiceReceiptModal';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { useLanguage } from '@/context/LanguageContext';

export default function POSPage() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  const { data: medicinesResponse, isLoading: isLoadingMeds } =
    useGetMedicinesQuery({
      search: debouncedSearch || undefined,
      category: selectedCategory === 'ALL' ? undefined : selectedCategory,
      page,
      limit,
    });

  const { data: categoriesResponse } = useGetMedicineCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const { data: pharmacyResponse } = useGetMyPharmacyQuery();
  const [createSale, { isLoading: isCreatingSale }] = useCreateSaleMutation();

  const [completedSale, setCompletedSale] = useState<SaleRecord | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');

  const medicines = medicinesResponse?.data || [];

  // Calculations
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * cart.discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * cart.taxPercent) / 100;
  const grandTotal = Math.max(0, taxableAmount + taxAmount);

  const actualPaid =
    paidAmountInput === ''
      ? grandTotal
      : Math.max(0, parseFloat(paidAmountInput) || 0);
  const currentDue = Math.max(0, grandTotal - actualPaid);
  const currentChange = Math.max(0, actualPaid - grandTotal);

  const handleAddToCart = (med: Medicine) => {
    const stock = Number(med.stock) || 0;
    if (stock <= 0) {
      toast.error(`${med.name} is out of stock!`);
      return;
    }

    dispatch(
      addToCart({
        id: med.id,
        name: med.name,
        genericName: med.genericName,
        category: med.category,
        price: Number(med.sellingPrice) || 0,
        costPrice: Number(med.buyingPrice) || 0,
        stock,
      })
    );
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty. Please add medicines before checkout.');
      return;
    }

    if (actualPaid < grandTotal && !cart.customerName && !cart.customerPhone) {
      toast.error(
        'Customer name or phone is required for due / partial payment sales.',
      );
      return;
    }

    try {
      const payload = {
        customerName: cart.customerName || undefined,
        customerPhone: cart.customerPhone || undefined,
        items: cart.items.map((i) => ({
          medicineId: i.id,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        discountPercent: cart.discountPercent,
        taxPercent: cart.taxPercent,
        paidAmount: actualPaid,
        paymentMethod: cart.paymentMethod,
      };

      const res = await createSale(payload).unwrap();

      if (res && (res.data || (res as any).sale)) {
        const saleData = res.data || (res as any).sale;
        setCompletedSale(saleData);
        setIsReceiptOpen(true);
        dispatch(clearCart());
        setPaidAmountInput('');
        toast.success(res.message || 'Sale transaction recorded successfully!');
      } else {
        toast.error('Unexpected response from server');
      }
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        'Failed to complete sale transaction';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>{t('pos.title')}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('pos.subtitle')}
          </p>
        </div>

        {cart.items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(clearCart())}
            className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('pos.emptyCart')}</span>
          </Button>
        )}
      </div>

      {/* POS Grid: Catalog on left (7 cols), Cart & Bill on right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Medicine Quick Picker */}
        <div className="lg:col-span-7 space-y-4">
          {/* Catalog Container Card */}
          <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4 bg-white dark:bg-slate-900">
            {/* Search & Category Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('pos.searchMeds')}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    selectedCategory === 'ALL'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t('common.all')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                      selectedCategory === cat
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Medicines Grid */}
            {isLoadingMeds ? (
              <TableSkeleton rows={4} cols={2} />
            ) : medicines.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                No medicines match your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {medicines.map((med) => {
                  const stock = Number(med.stock) || 0;
                  const price = Number(med.sellingPrice) || 0;
                  const isOutOfStock = stock <= 0;

                  return (
                    <div
                      key={med.id}
                      onClick={() => !isOutOfStock && handleAddToCart(med)}
                      className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                        isOutOfStock
                          ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-teal-500 hover:shadow-sm cursor-pointer border-slate-200/80 dark:border-slate-700/80 active:scale-[0.99]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                            {med.category}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                              stock <= 5
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                                : 'bg-slate-200/70 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {stock} in stock
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                          {med.name}
                        </h4>
                        {med.genericName && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                            {med.genericName}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-200/70 dark:border-slate-700/70">
                        <span className="text-sm font-black text-teal-700 dark:text-teal-400">
                          {formatCurrency(price)}
                        </span>
                        <Button
                          size="sm"
                          variant={isOutOfStock ? 'outline' : 'primary'}
                          disabled={isOutOfStock}
                          className="h-7 px-2.5 text-xs font-semibold gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls for POS Quick Picker */}
            {!isLoadingMeds && medicines.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Pagination
                  currentPage={page}
                  totalPages={medicinesResponse?.meta?.totalPages || Math.max(1, Math.ceil((medicinesResponse?.meta?.total || medicines.length) / limit))}
                  totalItems={medicinesResponse?.meta?.total ?? medicines.length}
                  pageSize={limit}
                  pageSizeOptions={[6, 8, 12, 20]}
                  onPageChange={setPage}
                  onPageSizeChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                  itemLabel={t('common.medicines')}
                  className="p-2 sm:p-2.5 border-0 shadow-none bg-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Cart & Billing Terminal */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-5 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Customer Bill</h3>
              </div>
              <Badge variant="primary">{cart.items.length} items</Badge>
            </div>

            {/* Customer Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Customer Name (Optional)"
                value={cart.customerName}
                onChange={(e) =>
                  dispatch(setCustomerInfo({ name: e.target.value }))
                }
                leftIcon={<User className="w-3.5 h-3.5" />}
                className="py-2 text-xs"
              />
              <Input
                placeholder="Phone (Optional)"
                value={cart.customerPhone}
                onChange={(e) =>
                  dispatch(setCustomerInfo({ phone: e.target.value }))
                }
                leftIcon={<Phone className="w-3.5 h-3.5" />}
                className="py-2 text-xs"
              />
            </div>

            {/* Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {cart.items.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  Click medicines from the catalog to add items to this invoice bill.
                </div>
              ) : (
                cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="pt-2 pb-1 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity > 1
                            ? dispatch(
                                updateQuantity({
                                  id: item.id,
                                  quantity: item.quantity - 1,
                                })
                              )
                            : dispatch(removeFromCart(item.id))
                        }
                        className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              id: item.id,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        disabled={item.quantity >= item.stock}
                        className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">Discount %</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cart.discountPercent || ''}
                  onChange={(e) =>
                    dispatch(setDiscount(parseFloat(e.target.value) || 0))
                  }
                  placeholder="0"
                  className="w-16 py-1 px-2 text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">VAT / Tax %</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cart.taxPercent || ''}
                  onChange={(e) =>
                    dispatch(setTax(parseFloat(e.target.value) || 0))
                  }
                  placeholder="0"
                  className="w-16 py-1 px-2 text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                <span className="text-sm font-extrabold uppercase">Grand Total:</span>
                <span className="text-xl font-black text-teal-700 dark:text-teal-400">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              {/* Paid Amount Input */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                  Paid Amount (৳):
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={paidAmountInput}
                  onChange={(e) => setPaidAmountInput(e.target.value)}
                  placeholder={String(grandTotal)}
                  className="w-24 py-1 px-2 text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-teal-500"
                />
              </div>

              {currentDue > 0 && (
                <div className="flex justify-between items-center text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40">
                  <span>Due Amount (বাকি):</span>
                  <span>{formatCurrency(currentDue)}</span>
                </div>
              )}

              {currentChange > 0 && (
                <div className="flex justify-between items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Change Return:</span>
                  <span>{formatCurrency(currentChange)}</span>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Payment Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['CASH', 'CARD', 'BKASH', 'NAGAD'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() =>
                      dispatch(setCustomerInfo({ paymentMethod: method }))
                    }
                    className={`py-2 px-1 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                      cart.paymentMethod === method
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {method === 'CASH' && <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    {method === 'CARD' && <CreditCard className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                    {method === 'BKASH' && <Smartphone className="w-4 h-4 text-pink-600 dark:text-pink-400" />}
                    {method === 'NAGAD' && <Smartphone className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                    <span className="text-[10px]">{method}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Complete Sale Action */}
            <Button
              variant="primary"
              size="lg"
              className="w-full text-base font-bold shadow-lg shadow-teal-700/20"
              disabled={cart.items.length === 0}
              isLoading={isCreatingSale}
              onClick={handleCheckout}
            >
              <span>Complete Sale &amp; Print Slip</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
        pharmacy={pharmacyResponse?.data}
      />
    </div>
  );
}
