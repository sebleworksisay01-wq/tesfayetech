import React, { useState, useEffect } from 'react';
import { MailCheck, RefreshCw, Send, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface VerifyEmailProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
  emailParam?: string;
}

export function VerifyEmail({ onNavigate, emailParam }: VerifyEmailProps) {
  const { unverifiedEmail, resendVerification, refreshAuthStatus } = useAuth();
  const targetEmail = emailParam || unverifiedEmail || '';

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setStatusMessage(null);
    setIsError(false);

    const res = await resendVerification();
    setResending(false);
    setStatusMessage(res.message);
    setIsError(!res.success);
    if (res.success) {
      setCooldown(60); // 60 seconds cooldown
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusMessage(null);
    const verified = await refreshAuthStatus();
    setChecking(false);

    if (verified) {
      setStatusMessage('Verification confirmed! Redirecting to your member dashboard...');
      setIsError(false);
      setTimeout(() => {
        onNavigate('/dashboard');
      }, 1500);
    } else {
      setStatusMessage('Your email has not been confirmed yet. Please click the link in the email sent by Firebase Authentication, or check your spam folder.');
      setIsError(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
          <MailCheck size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Verify Your Email</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            We sent an email verification link to{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{targetEmail || 'your email address'}</span>.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldAlert size={15} className="text-blue-500" /> Next Steps:
          </div>
          <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
            <li>Check your email inbox for an email from <strong>TesfayeTech / Firebase</strong>.</li>
            <li>Click the verification link provided inside the email.</li>
            <li>Once confirmed in your browser, return here and click <strong>&ldquo;I Have Verified My Email&rdquo;</strong> below.</li>
          </ol>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 text-left ${
              isError
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            }`}
          >
            {isError ? <AlertCircle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking Verification Status...' : 'I Have Verified My Email'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send size={13} />
            {cooldown > 0 ? `Resend Link (${cooldown}s cooldown)` : resending ? 'Dispatching Link...' : 'Resend Verification Email'}
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={() => onNavigate('/login')}
            className="font-medium text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            Back to Sign In
          </button>
          <button
            onClick={() => onNavigate('/contact')}
            className="hover:underline cursor-pointer"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
