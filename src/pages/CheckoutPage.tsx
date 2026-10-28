import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Briefcase,
  Layers,
  ArrowRight,
  Info,
  Building,
  Hash,
} from 'lucide-react';
import { TelebirrLogo } from '../components/common/TelebirrLogo';
import { TelebirrCheckoutModal } from '../components/payment/TelebirrCheckoutModal';
import { SiteSettings } from '../types';

interface CheckoutPageProps {
  siteSettings: SiteSettings;
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function CheckoutPage({ siteSettings, onNavigate }: CheckoutPageProps) {
  const [selectedOffering, setSelectedOffering] = useState<string>('invoice');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('5000');
  const [invoiceDescription, setInvoiceDescription] = useState('Enterprise Consulting & Architecture Retainer');

  // Modal checkout state
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    amount: number;
    itemType: 'service' | 'consulting' | 'custom_invoice' | 'resource';
    itemId?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    amount: 0,
    itemType: 'custom_invoice',
  });

  const presetOfferings = [
    {
      id: 'arch-sprint',
      title: 'Architecture Review Sprint',
      category: 'consulting',
      price: 25000,
      description: '2 to 4-week complete infrastructure Zero-Trust posture audit and IaC specification.',
      duration: 'Sprint Engagement',
    },
    {
      id: 'devops-retainer',
      title: 'DevOps & SRE Advisory Retainer',
      category: 'service',
      price: 18500,
      description: 'Monthly architectural steering calls, CI/CD policy gates, and PR peer reviews.',
      duration: 'Monthly Retainer',
    },
    {
      id: 'incident-postmortem',
      title: 'Sev-1 Incident Postmortem & DR Drills',
      category: 'consulting',
      price: 12000,
      description: 'Forensic root-cause analysis of kernel/outage events, SOP authoring, and DR fire drills.',
      duration: 'Per Incident Engagement',
    },
    {
      id: 'security-hardening',
      title: 'Cloud Security Hardening & Zero-Trust Audit',
      category: 'service',
      price: 15000,
      description: 'Comprehensive CIS benchmark audit, Kubernetes policy enforcement, and IAM least-privilege.',
      duration: 'Complete Package',
    },
  ];

  const handlePayPreset = (offering: (typeof presetOfferings)[0]) => {
    setCheckoutModal({
      isOpen: true,
      title: offering.title,
      description: offering.description,
      amount: offering.price,
      itemType: offering.category as 'service' | 'consulting',
      itemId: offering.id,
    });
  };

  const handlePayInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(invoiceAmount);
    if (isNaN(amt) || amt <= 0) return;

    setCheckoutModal({
      isOpen: true,
      title: invoiceNumber ? `Invoice Payment #${invoiceNumber}` : 'Custom Invoice Payment',
      description: invoiceDescription,
      amount: amt,
      itemType: 'custom_invoice',
      itemId: invoiceNumber || 'custom-inv',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Banner */}
      <div className="bg-[#101C32] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
              <TelebirrLogo size="sm" showSubtitle={false} /> Official Payment Portal
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
              Ethiopian Birr (ETB)
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Pay for Services, Retainers & Invoices
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Secure, instant payments via Telebirr mobile wallet. Complete payments for principal engineering advisory, disaster recovery kits, or settle corporate invoices online.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 text-sm font-bold">
        <button
          onClick={() => setSelectedOffering('invoice')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            selectedOffering === 'invoice'
              ? 'border-[#00B5E2] text-[#00B5E2]'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText size={18} /> Settle Custom Invoice
        </button>
        <button
          onClick={() => setSelectedOffering('services')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            selectedOffering === 'services'
              ? 'border-[#00B5E2] text-[#00B5E2]'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Briefcase size={18} /> Standard Advisory Packages
        </button>
      </div>

      {/* Section 1: Custom Invoice Payment Form */}
      {selectedOffering === 'invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pay a TesfayeTech Invoice</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your issued invoice number and amount to authorize an instant Telebirr settlement.
              </p>
            </div>

            <form onSubmit={handlePayInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Hash size={14} className="text-blue-500" />
                    Invoice Reference #
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-2026-084"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono outline-none focus:ring-2 focus:ring-[#00B5E2]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <span className="text-[#00B5E2] font-black">ETB</span>
                    Amount to Pay (ETB) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00B5E2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <FileText size={14} className="text-blue-500" />
                  Description / Service Details
                </label>
                <input
                  type="text"
                  value={invoiceDescription}
                  onChange={(e) => setInvoiceDescription(e.target.value)}
                  placeholder="e.g. Q4 Cloud Advisory & Infrastructure Hardening Retainer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#00B5E2]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00B5E2] to-[#0090B5] hover:opacity-95 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TelebirrLogo size="sm" showSubtitle={false} />
                  <span>Proceed to Telebirr Checkout</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                Telebirr Payment Guarantee
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Transactions are processed through Ethio Telecom's encrypted mobile money infrastructure. Instant digital receipts with cryptographic verification hashes are generated upon payment confirmation.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Official Merchant ID: 100845</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Immediate VAT/Official Receipt</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Zero Transaction Fee to Client</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Info size={14} /> Need a custom PO or bank wire?
              </div>
              <p>For enterprise wire transfers or corporate purchase orders, please contact our financial desk.</p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Standard Advisory Packages */}
      {selectedOffering === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {presetOfferings.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
                    {pkg.duration}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold capitalize">
                    {pkg.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pkg.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{pkg.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Fixed Fee</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {pkg.price.toLocaleString()}{' '}
                    <span className="text-xs font-bold text-[#00B5E2]">ETB</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePayPreset(pkg)}
                  className="px-5 py-2.5 rounded-xl bg-[#00B5E2] hover:bg-[#009fc7] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <TelebirrLogo size="sm" showSubtitle={false} />
                  <span>Book with Telebirr</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModal.isOpen && (
        <TelebirrCheckoutModal
          isOpen={checkoutModal.isOpen}
          onClose={() => setCheckoutModal((prev) => ({ ...prev, isOpen: false }))}
          title={checkoutModal.title}
          description={checkoutModal.description}
          amount={checkoutModal.amount}
          itemType={checkoutModal.itemType}
          itemId={checkoutModal.itemId}
        />
      )}
    </div>
  );
}
