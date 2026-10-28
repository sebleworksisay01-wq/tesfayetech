import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Loader2, AlertCircle, Info, Phone, User, Mail } from 'lucide-react';
import { TelebirrLogo } from '../common/TelebirrLogo';
import { PaymentItemType } from '../../types/payment';
import { initiateTelebirrPayment } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

interface TelebirrCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  amount: number; // in ETB
  itemType: PaymentItemType;
  itemId?: string;
  onSuccess?: (outTradeNo: string) => void;
}

export function TelebirrCheckoutModal({
  isOpen,
  onClose,
  title,
  description,
  amount,
  itemType,
  itemId,
  onSuccess,
}: TelebirrCheckoutModalProps) {
  const { user, userProfile } = useAuth();

  const [customerName, setCustomerName] = useState(userProfile?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState('09');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate phone number format (must be valid Ethiopian format, e.g. 09... or 07... or +251...)
    const cleanPhone = customerPhone.replace(/\s+/g, '');
    const phoneRegex = /^(?:\+251|251|0)?[79]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage('Please enter a valid Ethiopian mobile number (e.g. 0911234567 or 0712345678).');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name or company name.');
      return;
    }

    setLoading(true);
    try {
      // Generate a deterministic idempotency key for this session
      const idempotencyKey = `idemp-${user?.uid || 'guest'}-${itemId || 'custom'}-${Date.now().toString().slice(0, 8)}`;

      const res = await initiateTelebirrPayment({
        title,
        description,
        amount,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        itemType,
        itemId,
        userId: user?.uid,
        idempotencyKey,
      });

      if (res.success && res.paymentUrl) {
        if (onSuccess) {
          onSuccess(res.payment.outTradeNo);
        }
        // Redirect to Telebirr H5 payment or simulation gateway
        window.location.href = res.paymentUrl;
      } else {
        throw new Error(res.message || 'Unable to establish connection to Telebirr.');
      }
    } catch (err) {
      console.error('Telebirr initiation error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-5 bg-[#101C32] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <TelebirrLogo size="sm" showSubtitle={false} />
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Secure Checkout</span>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
                  Order Summary
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{title}</h3>
                {description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{description}</p>
                )}
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 font-semibold uppercase">
                {itemType.replace('_', ' ')}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Amount Payable:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>{' '}
                <span className="text-xs font-extrabold text-[#00B5E2]">ETB</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment Method</label>
            <div className="p-3.5 rounded-xl border-2 border-[#00B5E2] bg-cyan-50/50 dark:bg-cyan-950/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TelebirrLogo size="md" />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Official Mobile Payment Gateway
                </span>
              </div>
              <span className="w-5 h-5 rounded-full bg-[#00B5E2] flex items-center justify-center text-white text-xs font-bold">
                ✓
              </span>
            </div>
          </div>

          {/* Customer Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Phone size={14} className="text-blue-500" />
                Telebirr Mobile Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="09XXXXXXXX or 07XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-[#00B5E2] focus:border-transparent outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The Ethio Telecom phone linked to your Telebirr account for authorization.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <User size={14} className="text-blue-500" />
                Full Name / Organization <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Abebe Bikila"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#00B5E2] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Mail size={14} className="text-blue-500" />
                Email Address (For Instant Receipt)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#00B5E2] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00B5E2] to-[#0090B5] hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Connecting to Telebirr Gateway...</span>
                </>
              ) : (
                <>
                  <span>Pay {amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB with Telebirr</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>256-bit RSA Encrypted & Verified with Ethio Telecom</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
