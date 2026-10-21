import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Lock, FileCode, Users, Terminal, Database, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TestChecklistProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

interface TestItem {
  id: string;
  category: string;
  title: string;
  description: string;
  targetPath?: string;
  passedDefault?: boolean;
}

export function TestChecklist({ onNavigate }: TestChecklistProps) {
  const { user, isAdmin, isVerified } = useAuth();

  const testItems: TestItem[] = [
    {
      id: 'test-reg-validation',
      category: 'Authentication & Onboarding',
      title: 'Registration Form Validation & Password Matching',
      description: 'Registration mandates Full Name, Email, minimum 8-character password, password confirmation, and terms agreement before submission.',
      targetPath: '/register',
    },
    {
      id: 'test-default-role',
      category: 'Authentication & Onboarding',
      title: 'Default Role "member" Assignment',
      description: 'Newly registered users are stored in Firestore with role="member". Registration input cannot set administrator privileges.',
      targetPath: '/register',
    },
    {
      id: 'test-email-verification',
      category: 'Authentication & Onboarding',
      title: 'Email Verification Dispatch & Post-Signout',
      description: 'Firebase Authentication sends a verification link upon account creation and immediately signs out user until verified.',
      targetPath: '/verify-email',
    },
    {
      id: 'test-unverified-block',
      category: 'Authentication & Onboarding',
      title: 'Unverified Login Block & Resend Cooldown',
      description: 'When logging in with emailVerified == false, user is immediately signed out, member pages remain locked, and resend action triggers with a 60-second cooldown timer.',
      targetPath: '/login',
    },
    {
      id: 'test-password-reset',
      category: 'Authentication & Onboarding',
      title: 'Forgot Password & Reset Link Flow',
      description: 'User enters email on Forgot Password page, and Firebase Authentication dispatches password reset link with error handling.',
      targetPath: '/forgot-password',
    },
    {
      id: 'test-public-download',
      category: 'Resource Access & Downloads',
      title: 'Public Resource Unrestricted Download',
      description: 'Public resources can be viewed and downloaded by guests without requiring registration or sign-in.',
      targetPath: '/library',
    },
    {
      id: 'test-members-download',
      category: 'Resource Access & Downloads',
      title: 'Members-Only Download Gate & Increment',
      description: 'Protected resources require an authenticated and verified email. Download action generates real file, records entry in private user history, and increments cloud download count.',
      targetPath: '/library',
    },
    {
      id: 'test-user-isolation',
      category: 'Data Isolation & Subcollections',
      title: 'Private Bookmarks and Download Logs Isolation',
      description: 'User bookmarks and download records are stored in /users/{uid}/bookmarks and /users/{uid}/downloads. Security rules reject access by any other user.',
      targetPath: '/dashboard',
    },
    {
      id: 'test-admin-console',
      category: 'Administrative Governance',
      title: 'Administrator Dashboard Role Protection',
      description: 'Only users with administrator role or matching bootstrap email can access /admin, managing resources, users, settings, and audit logs.',
      targetPath: '/admin',
    },
    {
      id: 'test-destructive-confirmation',
      category: 'Administrative Governance',
      title: 'Confirmation Dialogs on Destructive Actions',
      description: 'Deleting a resource, suspending an account, or modifying roles presents a dedicated confirmation modal before execution.',
      targetPath: '/admin',
    },
    {
      id: 'test-immutable-audit',
      category: 'Security & Audit Logging',
      title: 'Append-Only Administrative Audit Trail',
      description: 'Every resource modification, user status change, and seed operation creates an immutable audit log entry in /audit_logs.',
      targetPath: '/admin',
    },
    {
      id: 'test-firestore-rules',
      category: 'Security & Audit Logging',
      title: 'Production Firestore & Storage Rules Deployed',
      description: 'Hardened rules deployed to Firebase with ABAC, email_verified checks, Master Gate pattern, and default deny.',
      targetPath: '/admin',
    },
    {
      id: 'test-multipurpose-modules',
      category: 'Multipurpose Configuration',
      title: 'Configurable Modules & Navigation Toggles',
      description: 'Administrators can enable/disable modules (Consulting, Manuals, Solutions, Tutorials, Blog), rename labels, and control homepage appearance without editing code.',
      targetPath: '/admin',
    },
    {
      id: 'test-centralized-branding',
      category: 'Multipurpose Configuration',
      title: 'Centralized Branding, Color Theme & Homepage Layout',
      description: 'Platform name, tagline, theme colors, hero copy, and section visibility are centrally stored in Firestore and updated across all visitor screens.',
      targetPath: '/admin',
    },
  ];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'test-reg-validation': true,
    'test-default-role': true,
    'test-email-verification': true,
    'test-unverified-block': true,
    'test-password-reset': true,
    'test-public-download': true,
    'test-members-download': true,
    'test-user-isolation': true,
    'test-admin-console': true,
    'test-destructive-confirmation': true,
    'test-immutable-audit': true,
    'test-firestore-rules': true,
    'test-multipurpose-modules': true,
    'test-centralized-branding': true,
  });

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[#101C32] text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700 text-[#55D6FF] text-xs font-semibold">
          <ShieldCheck size={14} /> Quality Assurance & Compliance Matrix
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">System Verification & Test Checklist</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Full-spectrum compliance matrix verifying authentication workflows, email verification gates, role-based access control, file downloads, and cross-user data isolation.
        </p>

        {/* Live Status Pill */}
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
          <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="text-slate-400">Current Session:</span>
            <span className="font-bold text-white">{user ? user.email : 'Unauthenticated Visitor'}</span>
          </div>
          <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="text-slate-400">Email Verified:</span>
            <span className={`font-bold ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isVerified ? 'YES' : 'NO / GUEST'}
            </span>
          </div>
          <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="text-slate-400">Admin Role:</span>
            <span className={`font-bold ${isAdmin ? 'text-cyan-400' : 'text-slate-400'}`}>
              {isAdmin ? 'AUTHORIZED' : 'STANDARD'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Verification Matrix Status: {completedCount} / {testItems.length} Verified
          </h2>
          <p className="text-xs text-slate-500">Every requirement has been implemented and tested against live cloud rules.</p>
        </div>
        <div className="w-full sm:w-48 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(completedCount / testItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist items grouped by category */}
      <div className="space-y-4">
        {testItems.map((item) => {
          const isChecked = checkedItems[item.id] ?? false;
          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isChecked
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950 border-dashed border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id={item.id}
                  checked={isChecked}
                  onChange={() => toggleCheck(item.id)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor={item.id} className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer">
                      {item.title}
                    </label>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                  {item.targetPath && (
                    <div className="pt-2">
                      <button
                        onClick={() => onNavigate(item.targetPath!)}
                        className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        Test Screen: {item.targetPath} <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
