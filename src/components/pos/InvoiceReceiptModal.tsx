'use client';

import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (isOpen && sale) {
      const originalTitle = document.title;
      const pharmacyName = pharmacy?.name || 'PharmaFlow';
      document.title = `${sale.invoiceNumber} - ${pharmacyName}`;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [isOpen, sale, pharmacy]);

  if (!sale) return null;

  const handlePrint = () => {
    const receiptEl = document.getElementById('printable-receipt');
    if (!receiptEl) return;

    const pharmacyName = pharmacy?.name || 'PharmaFlow';
    const printDocTitle = `${sale.invoiceNumber} - ${pharmacyName}`;

    // Ensure document.title is set on main window
    document.title = printDocTitle;

    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${printDocTitle}</title>
          <style>
            @page {
              margin: 6mm;
              size: auto;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              font-size: 11px;
              color: #0f172a;
              background-color: #ffffff;
              padding: 10px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-wrap {
              width: 100%;
              max-width: 380px;
              margin: 0 auto;
              border: 1px dashed #cbd5e1;
              border-radius: 8px;
              padding: 16px;
              background: #ffffff;
            }
            /* Flex and layout utilities */
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .font-extrabold { font-weight: 800; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            .text-base { font-size: 14px; }
            .text-xs { font-size: 11px; }
            .text-\\[11px\\] { font-size: 11px; }
            .text-\\[10px\\] { font-size: 10px; }
            .block { display: block; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-1\\.5 > * + * { margin-top: 6px; }
            .space-y-4 > * + * { margin-top: 14px; }
            .pb-1 { padding-bottom: 4px; }
            .pb-2 { padding-bottom: 8px; }
            .pb-3 { padding-bottom: 12px; }
            .pt-1 { padding-top: 4px; }
            .pt-3 { padding-top: 12px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .border-b { border-bottom-width: 1px; }
            .border-t { border-top-width: 1px; }
            .border-dashed { border-bottom-style: dashed; }
            .border-t.border-dashed { border-top-style: dashed; }
            .border-slate-200 { border-color: #e2e8f0; }
            .border-slate-300 { border-color: #cbd5e1; }
            .text-slate-900 { color: #0f172a; }
            .text-slate-800 { color: #1e293b; }
            .text-slate-700 { color: #334155; }
            .text-slate-600 { color: #475569; }
            .text-slate-500 { color: #64748b; }
            .text-slate-400 { color: #94a3b8; }
            .text-emerald-600 { color: #059669; }
            .text-emerald-700 { color: #047857; }
            .text-rose-600 { color: #e11d48; }
          </style>
        </head>
        <body>
          <div class="receipt-wrap">
            ${receiptEl.innerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 250);
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
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md font-mono text-xs text-slate-800 space-y-4"
        >
          {/* Receipt Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
            <h2 className="text-base font-extrabold uppercase tracking-wider font-sans text-slate-900">
              {pharmacy?.name || 'PharmaFlow Pharmacy'}
            </h2>
            <p className="text-[11px] text-slate-600 font-sans">
              {pharmacy?.address || 'Dhaka, Bangladesh'}
            </p>
            <p className="text-[11px] text-slate-600 font-sans">
              Tel: {pharmacy?.phone || '+8801700000000'}
            </p>
          </div>

          {/* Invoice Meta */}
          <div className="flex justify-between text-[11px] pb-2 border-b border-slate-200 text-slate-700">
            <div>
              <p>
                <strong className="text-slate-900">Invoice:</strong> {sale.invoiceNumber}
              </p>
              <p>
                <strong className="text-slate-900">Customer:</strong> {sale.customerName || 'Walk-in Customer'}
              </p>
            </div>
            <div className="text-right">
              <p>
                <strong className="text-slate-900">Date:</strong> {formatDate(sale.createdAt)}
              </p>
              <p>
                <strong className="text-slate-900">Method:</strong> {sale.paymentMethod}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-1.5 py-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between font-bold text-[11px] pb-1 text-slate-600">
              <span>Item &amp; Qty</span>
              <span>Total</span>
            </div>
            {sale.items.map((item, idx) => {
              const name = item.medicine?.name || (item as any).medicineName || 'Medicine';
              const price = Number(item.unitPrice) || 0;
              const lineTotal = Number(item.totalPrice) || Number((item as any).subtotal) || item.quantity * price;
              return (
                <div key={idx} className="flex justify-between text-xs text-slate-800">
                  <div>
                    <span className="font-semibold text-slate-900">{name}</span>
                    <span className="text-slate-500 block text-[10px]">
                      {item.quantity} x {formatCurrency(price)}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bill Calculation */}
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="text-slate-800 font-medium">{formatCurrency(Number(sale.subTotal || (sale as any).totalAmount) || 0)}</span>
            </div>
            {Number(sale.discount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span className="font-medium">-{formatCurrency(Number(sale.discount))}</span>
              </div>
            )}
            {Number(sale.tax) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>VAT / Tax:</span>
                <span className="font-medium">+{formatCurrency(Number(sale.tax))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200 text-slate-900">
              <span>Total Payable:</span>
              <span className="font-extrabold">{formatCurrency(Number(sale.totalAmount || (sale as any).finalAmount) || 0)}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-700">
              <span className="font-semibold">Paid Amount:</span>
              <span className="font-bold">{formatCurrency(Number(sale.paidAmount) || 0)}</span>
            </div>
            {Number(sale.dueAmount) > 0 && (
              <div className="flex justify-between font-bold text-xs text-rose-600">
                <span>DUE AMOUNT ({sale.paymentStatus || 'DUE'}):</span>
                <span>{formatCurrency(Number(sale.dueAmount))}</span>
              </div>
            )}
            {Number(sale.changeAmount) > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Change Returned:</span>
                <span className="font-medium">{formatCurrency(Number(sale.changeAmount))}</span>
              </div>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 font-sans">
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
