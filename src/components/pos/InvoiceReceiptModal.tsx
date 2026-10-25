'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Printer, CheckCircle } from 'lucide-react';
import { SaleRecord } from '@/redux/api/salesApi';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Pharmacy } from '@/redux/api/pharmacyApi';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleRecord | null;
  pharmacy?: Pharmacy | null;
}

export function InvoiceReceiptModal({
  isOpen,
  onClose,
  sale,
  pharmacy,
}: InvoiceReceiptModalProps) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-6">
        {/* Success Banner */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Sale Completed Successfully!</span>
            <p className="text-emerald-700/80 dark:text-emerald-300/80">
              Invoice #{sale.invoiceNumber} recorded into inventory ledger.
            </p>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div
          id="printable-receipt"
          className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm font-mono text-xs text-slate-800 dark:text-slate-200 space-y-4"
        >
          {/* Receipt Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1">
            <h2 className="text-base font-extrabold uppercase tracking-wider font-sans text-slate-900 dark:text-slate-100">
              {pharmacy?.name || 'PharmaFlow Pharmacy'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              {pharmacy?.address || 'Dhaka, Bangladesh'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              Tel: {pharmacy?.phone || '+8801700000000'}
            </p>
          </div>

          {/* Invoice Meta */}
          <div className="flex justify-between text-[11px] pb-2 border-b border-slate-200 dark:border-slate-700">
            <div>
              <p>
                <strong>Invoice:</strong> {sale.invoiceNumber}
              </p>
              <p>
                <strong>Customer:</strong> {sale.customerName || 'Walk-in Customer'}
              </p>
            </div>
            <div className="text-right">
              <p>
                <strong>Date:</strong> {formatDate(sale.createdAt)}
              </p>
              <p>
                <strong>Method:</strong> {sale.paymentMethod}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-1.5 py-2 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex justify-between font-bold text-[11px] pb-1 text-slate-600 dark:text-slate-400">
              <span>Item & Qty</span>
              <span>Total</span>
            </div>
            {sale.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{item.medicineName}</span>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(item.subtotal || item.quantity * item.unitPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Bill Calculation */}
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Subtotal:</span>
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount:</span>
                <span>-{formatCurrency(sale.discount)}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>VAT / Tax:</span>
                <span>+{formatCurrency(sale.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <span>TOTAL PAID:</span>
              <span className="text-teal-700 dark:text-teal-400">{formatCurrency(sale.finalAmount)}</span>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 text-[10px] text-slate-400 dark:text-slate-500 font-sans">
            Thank you for choosing {pharmacy?.name || 'PharmaFlow'}!
            <br />
            Medicines once sold cannot be returned without receipt.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Done / Next Customer
          </Button>
          <Button variant="primary" className="flex-1 gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
