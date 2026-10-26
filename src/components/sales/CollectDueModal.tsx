'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Phone,
  Receipt,
} from 'lucide-react';
import { useCollectDueMutation, SaleRecord } from '@/redux/api/salesApi';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

interface CollectDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleRecord | null;
  onSuccess?: (updatedSale: SaleRecord) => void;
}

export function CollectDueModal({
  isOpen,
  onClose,
  sale,
  onSuccess,
}: CollectDueModalProps) {
  const { t } = useLanguage();
  const [collectDue, { isLoading }] = useCollectDueMutation();

  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'BKASH' | 'NAGAD' | 'OTHER'>('CASH');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const totalAmount = Number(sale?.totalAmount || 0);
  const paidAmount = Number(sale?.paidAmount || 0);
  const currentDue = Number(sale?.dueAmount || 0);

  useEffect(() => {
    if (sale && isOpen) {
      setAmount(String(currentDue > 0 ? currentDue : ''));
      setPaymentMethod('CASH');
      setNote('');
      setError(null);
    }
  }, [sale, isOpen, currentDue]);

  if (!sale) return null;

  const handleAmountChange = (val: string) => {
    setAmount(val);
    setError(null);
  };

  const handleQuickFill = (targetAmount: number) => {
    setAmount(String(targetAmount));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError(t('sales.enterValidAmount') || 'Please enter a valid payment amount greater than 0.');
      return;
    }

    if (numAmount > currentDue) {
      setError(
        (t('sales.amountExceedsDue') || 'Amount cannot exceed current due') +
          ` (${formatCurrency(currentDue)})`
      );
      return;
    }

    try {
      const res = await collectDue({
        saleId: sale.id,
        amount: numAmount,
        paymentMethod,
        note: note.trim() || undefined,
      }).unwrap();

      toast.success(res.message || 'বাকি টাকা সফলভাবে আদায় হয়েছে!');
      if (res.data?.sale && onSuccess) {
        onSuccess(res.data.sale);
      }
      onClose();
    } catch (err: any) {
      const errMsg =
        err?.data?.message ||
        err?.message ||
        'বাকি টাকা আদায় করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const remainingAfterPayment = Math.max(0, currentDue - numAmount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 block">
              {t('sales.collectDueTitle') || 'বাকি টাকা আদায় (Collect Due)'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {sale.invoiceNumber}
            </span>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer & Due Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{sale.customerName || 'Walk-in Customer'}</span>
            </div>
            {sale.customerPhone && (
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Phone className="w-3 h-3" />
                <span>{sale.customerPhone}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t('pos.total') || 'Total Bill'}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t('pos.paidAmount') || 'Paid'}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(paidAmount)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40">
              <span className="text-[10px] uppercase font-bold text-rose-500 block">
                {t('sales.currentDue') || 'Remaining Due'}
              </span>
              <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                {formatCurrency(currentDue)}
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('sales.collectAmountLabel') || 'আদায়কৃত টাকার পরিমাণ (৳)'}
            </label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill(currentDue)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors"
              >
                {t('sales.fullDue') || 'পুরো বাকি (Full)'}
              </button>
              {currentDue > 10 && (
                <button
                  type="button"
                  onClick={() => handleQuickFill(Math.floor(currentDue / 2))}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  ৫০%
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
              ৳
            </span>
            <input
              type="number"
              min="0.01"
              max={currentDue}
              step="any"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              required
              autoFocus
            />
          </div>

          {/* After payment calculation helper */}
          {numAmount > 0 && numAmount <= currentDue && (
            <div className="flex items-center justify-between text-xs px-2 pt-1 text-slate-500 dark:text-slate-400">
              <span>{t('sales.remainingAfter') || 'আদায়ের পর অবশিষ্ট বাকি:'}</span>
              <span className={`font-bold ${remainingAfterPayment === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(remainingAfterPayment)} {remainingAfterPayment === 0 ? '(সম্পূর্ণ পরিশোধ)' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('sales.paymentMethod') || 'পেমেন্ট মাধ্যম'}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { id: 'CASH', label: 'Cash', icon: Banknote, color: 'text-emerald-600' },
                { id: 'BKASH', label: 'bKash', icon: Smartphone, color: 'text-pink-600' },
                { id: 'NAGAD', label: 'Nagad', icon: Smartphone, color: 'text-orange-600' },
                { id: 'CARD', label: 'Card', icon: CreditCard, color: 'text-sky-600' },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isSelected = paymentMethod === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPaymentMethod(item.id)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-[11px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note / Remarks */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('sales.paymentNote') || 'মন্তব্য / ট্রানজেকশন রেফারেন্স (ঐচ্ছিক)'}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="যেমন: bKash TrxID বা দোকানে এসে দিয়ে গেছেন"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="gap-2 shadow-lg shadow-teal-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('sales.confirmCollect') || 'আদায় সম্পন্ন করুন'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
