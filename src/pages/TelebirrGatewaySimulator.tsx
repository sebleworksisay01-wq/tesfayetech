import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Smartphone,
} from 'lucide-react';
import { TelebirrLogo } from '../components/common/TelebirrLogo';
import { simulateGatewayAction, getPaymentStatus } from '../services/paymentService';
import { PaymentRecord } from '../types/payment';

interface TelebirrGatewaySimulatorProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function TelebirrGatewaySimulator({ onNavigate }: TelebirrGatewaySimulatorProps) {
  const [outTradeNo, setOutTradeNo] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('0.00');
  const [title, setTitle] = useState<string>('TesfayeTech Service');
  const [payment, setPayment] = useState<PaymentRecord | null>(null);

  const [pin, setPin] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1799); // 30 min countdown

  // Parse query parameters
  useEffect(() => {
    const hash = window.location.hash;
    const queryIdx = hash.indexOf('?');
    if (queryIdx !== -1) {
      const searchParams = new URLSearchParams(hash.substring(queryIdx));
      const ref = searchParams.get('outTradeNo') || '';
      const tok = searchParams.get('token');
      const amt = searchParams.get('amount') || '0.00';
      const ttl = searchParams.get('title') || 'TesfayeTech Service';

      setOutTradeNo(ref);
      setToken(tok);
      setAmount(amt);
      setTitle(ttl);

      if (ref) {
        getPaymentStatus(ref)
          .then((p) => {
            setPayment(p);
            setAmount(p.amount.toFixed(2));
            setTitle(p.title);
          })
          .catch((err) => console.warn('Could not load payment status:', err));
      }
    }
  }, []);

  // 30 minute countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAuthorize = async () => {
    if (pin.length < 4) {
      setErrorNotice('Please enter your 4-6 digit Telebirr security PIN.');
      return;
    }

    setSubmitting(true);
    setErrorNotice(null);

    try {
      await simulateGatewayAction(outTradeNo, token, 'approve');
      // Redirect to payment result page
      onNavigate('/payment-result', { outTradeNo });
    } catch (err) {
      console.error('Authorization simulation error:', err);
      setErrorNotice('Communication with Telebirr failed. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSimulateCancel = async () => {
    setSubmitting(true);
    try {
      await simulateGatewayAction(outTradeNo, token, 'cancel');
      onNavigate('/payment-result', { outTradeNo });
    } catch (err) {
      setSubmitting(false);
    }
  };

  const handleSimulateFail = async () => {
    setSubmitting(true);
    try {
      await simulateGatewayAction(outTradeNo, token, 'fail');
      onNavigate('/payment-result', { outTradeNo });
    } catch (err) {
      setSubmitting(false);
    }
  };

  const handleSimulateExpire = async () => {
    setSubmitting(true);
    try {
      await simulateGatewayAction(outTradeNo, token, 'expire');
      onNavigate('/payment-result', { outTradeNo });
    } catch (err) {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-100 dark:bg-[#070D18] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Ethio Telecom Official Header */}
        <div className="bg-[#00B5E2] text-white p-6 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md">
                <TelebirrLogo size="sm" variant="icon-only" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white">telebirr</span>
                <span className="text-[10px] block font-bold text-slate-100 uppercase tracking-widest">
                  Ethio Telecom
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-white text-xs font-mono font-semibold">
              <Clock size={12} />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-xs text-cyan-100 font-medium">Merchant: TesfayeTech Enterprise Services</p>
            <div className="text-3xl font-black text-white mt-1">
              {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
              <span className="text-sm font-bold">ETB</span>
            </div>
            <p className="text-[11px] text-cyan-100 mt-1 truncate">Order Ref: {outTradeNo || 'TT-CHECKOUT'}</p>
          </div>
        </div>

        {/* Portal Body */}
        <div className="p-6 space-y-6">
          {/* Order Details Preview */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Service / Product:</span>
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer Mobile:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {payment?.customerPhone || '09XXXXXXXX'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Short Code:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">100845</span>
            </div>
          </div>

          {/* Interactive PIN Authorization */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock size={14} className="text-[#00B5E2]" />
                Enter Telebirr Security PIN
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Test PIN: 1234</span>
            </label>

            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-[#00B5E2] focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
            />
            <p className="text-[11px] text-center text-slate-400">
              In live production, Telebirr prompts you via USSD/SMS push on your phone.
            </p>
          </div>

          {errorNotice && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={handleAuthorize}
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-[#00B5E2] hover:bg-[#009fc7] text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <RotateCcw size={16} className="animate-spin" />
                Authorizing with Ethio Telecom...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Confirm & Pay {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                <ArrowRight size={16} />
              </span>
            )}
          </button>

          {/* Simulation & Test Controls Box */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Developer Sandbox Controls
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                onClick={handleSimulateCancel}
                disabled={submitting}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateFail}
                disabled={submitting}
                className="p-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 font-semibold transition-colors cursor-pointer"
              >
                Wrong PIN
              </button>
              <button
                onClick={handleSimulateExpire}
                disabled={submitting}
                className="p-2 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 font-semibold transition-colors cursor-pointer"
              >
                Expire
              </button>
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 text-center border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Ethio Telecom Telebirr Secure Payment Processing</span>
        </div>
      </div>
    </div>
  );
}
