import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Printer,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Download,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { TelebirrLogo } from '../components/common/TelebirrLogo';
import { PaymentRecord, PaymentStatus } from '../types/payment';
import { getPaymentStatus, verifyPaymentWithGateway } from '../services/paymentService';
import { ReceiptModal } from '../components/payment/ReceiptModal';

interface PaymentResultPageProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function PaymentResultPage({ onNavigate }: PaymentResultPageProps) {
  const [outTradeNo, setOutTradeNo] = useState<string>('');
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [pollCount, setPollCount] = useState<number>(0);

  // Extract outTradeNo from hash query
  useEffect(() => {
    const hash = window.location.hash;
    const queryIdx = hash.indexOf('?');
    if (queryIdx !== -1) {
      const searchParams = new URLSearchParams(hash.substring(queryIdx));
      const ref = searchParams.get('outTradeNo');
      if (ref) {
        setOutTradeNo(ref);
      }
    }
  }, []);

  // Fetch and poll payment status
  const fetchStatus = async (ref: string) => {
    try {
      const data = await getPaymentStatus(ref);
      setPayment(data);

      // If pending, attempt server-side verification with gateway
      if (data.status === 'PENDING' || data.status === 'PROCESSING') {
        const verifyRes = await verifyPaymentWithGateway(ref);
        if (verifyRes.status === 'SUCCESS') {
          setPayment(verifyRes.payment || { ...data, status: 'SUCCESS' });
        }
      }
    } catch (err) {
      console.warn('Error fetching payment status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (outTradeNo) {
      fetchStatus(outTradeNo);

      // Auto-poll if status is still pending/processing (up to 5 times)
      const interval = setInterval(() => {
        setPollCount((prev) => {
          if (prev < 6 && payment && (payment.status === 'PENDING' || payment.status === 'PROCESSING')) {
            fetchStatus(outTradeNo);
            return prev + 1;
          }
          return prev;
        });
      }, 4000);

      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [outTradeNo]);

  const handleManualRecheck = async () => {
    if (!outTradeNo) return;
    setVerifying(true);
    try {
      const res = await verifyPaymentWithGateway(outTradeNo);
      if (res.payment) {
        setPayment(res.payment);
      }
    } catch (err) {
      console.error('Error rechecking status:', err);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 space-y-4">
        <TelebirrLogo size="lg" />
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RotateCcw size={16} className="animate-spin text-cyan-500" />
          <span>Verifying transaction status with Telebirr...</span>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Reference Not Found</h2>
        <p className="text-xs text-slate-500">
          We could not locate transaction details for reference <span className="font-mono">{outTradeNo || 'N/A'}</span>.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const status: PaymentStatus = payment.status;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Status Card Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* State 1: SUCCESS */}
        {status === 'SUCCESS' && (
          <div className="p-8 sm:p-10 space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={44} />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <ShieldCheck size={14} /> Telebirr Payment Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white pt-2">
                Thank you, your payment was successful!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Your transaction has been securely verified by Ethio Telecom Telebirr. An official receipt has been issued.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-medium">Amount Paid:</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                  <span className="text-xs font-extrabold text-[#00B5E2]">ETB</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Order Reference:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{payment.outTradeNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Telebirr Trade No:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {payment.telebirrTradeNo || 'TB-CONFIRMED'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Item / Service:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{payment.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Customer Mobile:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{payment.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowReceipt(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={16} /> View & Print Official Receipt
              </button>

              {payment.itemType === 'resource' && payment.itemId ? (
                <button
                  onClick={() => onNavigate('/resource', { id: payment.itemId || '' })}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Access Purchased Resource <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Go to Member Dashboard <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* State 2: PENDING / PROCESSING */}
        {(status === 'PENDING' || status === 'PROCESSING') && (
          <div className="p-8 sm:p-10 space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-[#00B5E2] flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
              <Clock size={44} className="animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
                <RotateCcw size={12} className="animate-spin" /> Authorization in Progress
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white pt-2">
                Awaiting Telebirr Confirmation
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Please complete the payment authorization on your phone or in the Telebirr window. This page will update automatically.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{payment.outTradeNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Due:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {payment.amount.toFixed(2)} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile Number:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{payment.customerPhone}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleManualRecheck}
                disabled={verifying}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00B5E2] hover:bg-[#009fc7] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw size={15} className={verifying ? 'animate-spin' : ''} />
                <span>{verifying ? 'Checking with Telebirr...' : 'Refresh Status'}</span>
              </button>

              {payment.paymentUrl && (
                <a
                  href={payment.paymentUrl}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Re-open Telebirr Portal</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* State 3: FAILED */}
        {status === 'FAILED' && (
          <div className="p-8 sm:p-10 space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <XCircle size={44} />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold">
                Payment Not Completed
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white pt-2">
                Telebirr Payment Failed
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {payment.failureReason ||
                  'The transaction could not be authorized by Telebirr. Please check your account balance or PIN and try again.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('/services')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={15} /> Retry Payment
              </button>
              <button
                onClick={() => onNavigate('/contact')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                Contact Billing Support
              </button>
            </div>
          </div>
        )}

        {/* State 4: CANCELLED */}
        {status === 'CANCELLED' && (
          <div className="p-8 sm:p-10 space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <AlertTriangle size={44} />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                Transaction Cancelled
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white pt-2">
                Payment Was Cancelled
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                You cancelled the checkout session before completing authorization. No funds were debited from your Telebirr wallet.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('/services')}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Return to Services
              </button>
            </div>
          </div>
        )}

        {/* State 5: EXPIRED */}
        {status === 'EXPIRED' && (
          <div className="p-8 sm:p-10 space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto">
              <Clock size={44} />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold">
                Session Expired
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white pt-2">
                Checkout Window Timed Out
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                The 30-minute security window allocated for this Telebirr payment has elapsed. Please generate a fresh checkout session.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('/services')}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Initiate New Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {showReceipt && payment && (
        <ReceiptModal payment={payment} isOpen={showReceipt} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
}
