import React, { useState } from 'react';
import { User, Mail, Briefcase, Building, FileText, CheckCircle2, Shield, KeyRound, LogOut, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

interface UserProfilePageProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function UserProfilePage({ onNavigate }: UserProfilePageProps) {
  const { user, userProfile, isAdmin, updateUserProfileData, resetPassword, logoutUser } = useAuth();

  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [jobTitle, setJobTitle] = useState(userProfile?.jobTitle || '');
  const [company, setCompany] = useState(userProfile?.company || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (!fullName.trim()) {
      setMessage('Full name cannot be empty.');
      setIsError(true);
      return;
    }

    setSaving(true);
    try {
      await updateUserProfileData({
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        bio: bio.trim(),
      });
      setMessage('Profile updated successfully.');
      setIsError(false);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed to update profile.');
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const res = await resetPassword(user.email);
    setMessage(res.message);
    setIsError(!res.success);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">User Profile & Account</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal professional credentials, review verification status, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-extrabold mx-auto shadow-md">
              {fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{fullName || 'IT Member'}</h2>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
              <Badge variant={userProfile?.role === 'admin' ? 'warning' : 'primary'}>
                {userProfile?.role?.toUpperCase() || 'MEMBER'}
              </Badge>
              <Badge variant="success">ACTIVE ACCOUNT</Badge>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Email Verification:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Account Created:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={async () => {
                  await logoutUser();
                  onNavigate('/');
                }}
                className="w-full py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut size={14} /> Sign Out of Account
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Professional Information</h2>
            <p className="text-xs text-slate-500">Update how your name and credentials appear across the hub.</p>
          </div>

          {message && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                isError
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              }`}
            >
              {isError ? <AlertCircle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Title / Engineering Role
                </label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Lead SRE / Cloud Architect"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enterprise / Organization
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Acme Financial Technologies"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Technical Bio & Focus
              </label>
              <textarea
                rows={3}
                maxLength={500}
                placeholder="Briefly state your infrastructure focus, technologies of interest, or certifications..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>

              <button
                type="button"
                onClick={handlePasswordReset}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound size={14} /> Reset Password via Email
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
