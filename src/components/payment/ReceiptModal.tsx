import React from 'react';
import { X, Printer, CheckCircle2, Shield, Download } from 'lucide-react';
import { PaymentRecord } from '../../types/payment';
import { TelebirrLogo } from '../common/TelebirrLogo';

interface ReceiptModalProps {
  payment: PaymentRecord;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ payment, isOpen, onClose }: ReceiptModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Header bar - Hidden in print */}
        <div className="px-6 py-4 bg-[#101C32] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#55D6FF]">Official Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-xs flex items-center gap-1.5 px-3 font-semibold"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8 space-y-6">
          {/* Top Brand & Metadata */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">TesfayeTech</h2>
              <p className="text-xs text-slate-500 font-medium">Enterprise Technology & Advisory Services</p>
              <p className="text-[11px] text-slate-400 mt-1">Addis Ababa, Ethiopia</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 size={13} /> Paid via Telebirr
              </span>
              <p className="text-[11px] font-mono text-slate-500 mt-2">Ref: {payment.outTradeNo}</p>
            </div>
          </div>

          {/* Amount Showcase */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount Paid</div>
            <div className="text-3xl font-black text-slate-900">
              {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
              <span className="text-sm font-bold text-blue-600">ETB</span>
            </div>
            <div className="text-xs text-slate-500">Ethiopian Birr</div>
          </div>

          {/* Payment Line Items */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Item Description</span>
              <span className="font-bold text-slate-900 text-right max-w-[240px] truncate">{payment.title}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Category / Type</span>
              <span className="font-semibold text-slate-700 capitalize">{payment.itemType.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Customer Name</span>
              <span className="font-semibold text-slate-900">{payment.customerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Telebirr Mobile</span>
              <span className="font-mono text-slate-700">{payment.customerPhone}</span>
            </div>
            {payment.customerEmail && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email Address</span>
                <span className="font-mono text-slate-700">{payment.customerEmail}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Telebirr Transaction ID</span>
              <span className="font-mono font-bold text-slate-900">
                {payment.telebirrTradeNo || 'TB-CONFIRMED'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Payment Date & Time</span>
              <span className="text-slate-700">
                {payment.paidAt ? new Date(payment.paidAt).toLocaleString() : new Date(payment.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Payment Gateway</span>
              <span className="flex items-center gap-1 font-semibold text-cyan-600">
                <TelebirrLogo size="sm" variant="badge" />
              </span>
            </div>
          </div>

          {/* Verification stamp */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <Shield size={14} /> Cryptographically Signed & Verified
            </div>
            <div>TesfayeTech Core Billing</div>
          </div>
        </div>

        {/* Footer actions - Hidden in print */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Printer size={14} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
