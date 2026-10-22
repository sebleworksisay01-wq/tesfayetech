import React from 'react';
import { KeyRound, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface ResetPasswordProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
          <KeyRound size={24} className="text-[#55D6FF]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Password Reset Link</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Firebase Authentication password reset links must be opened directly from the email message you received.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-500" /> Instructions:
          </div>
          <p className="text-[11px] leading-relaxed">
            1. Open the email message with subject <em>&ldquo;Reset your password for TesfayeTech&rdquo;</em> in your mail client.
          </p>
          <p className="text-[11px] leading-relaxed">
            2. Click the secure cryptographic link to specify your new password on the Firebase secure portal.
          </p>
          <p className="text-[11px] leading-relaxed">
            3. Once changed, return here and sign in with your updated credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/login')}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          Proceed to Sign In <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
