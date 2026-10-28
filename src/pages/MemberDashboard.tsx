import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Bookmark,
  Download,
  CheckCircle2,
  Clock,
  Shield,
  User,
  KeyRound,
  Search,
  ExternalLink,
  BookOpen,
  FileCode2,
  Wrench,
  FolderOpen,
  ArrowRight,
  Sparkles,
  CreditCard,
  Printer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Resource, UserDownload } from '../types';
import { PaymentRecord } from '../types/payment';
import { ResourceCard } from '../components/common/ResourceCard';
import { getUserDownloads } from '../services/resourceService';
import { getMyPayments } from '../services/paymentService';
import { Badge } from '../components/common/Badge';
import { TelebirrLogo } from '../components/common/TelebirrLogo';
import { ReceiptModal } from '../components/payment/ReceiptModal';

interface MemberDashboardProps {
  resources: Resource[];
  bookmarks: string[];
  onBookmarkToggle: (resourceId: string) => void;
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function MemberDashboard({
  resources,
  bookmarks,
  onBookmarkToggle,
  onNavigate,
}: MemberDashboardProps) {
  const { user, userProfile, isAdmin, resetPassword } = useAuth();
  const [userDownloads, setUserDownloads] = useState<UserDownload[]>([]);
  const [userPayments, setUserPayments] = useState<PaymentRecord[]>([]);
  const [loadingDownloads, setLoadingDownloads] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [passwordResetNotice, setPasswordResetNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks' | 'history' | 'payments'>('overview');

  useEffect(() => {
    if (user) {
      getUserDownloads(user.uid)
        .then((dls) => setUserDownloads(dls))
        .finally(() => setLoadingDownloads(false));

      getMyPayments(user.uid, user.email || undefined)
        .then((p) => setUserPayments(p))
        .catch((e) => console.warn('Could not load user payments:', e))
        .finally(() => setLoadingPayments(false));
    }
  }, [user]);

  // Bookmarked resource items
  const bookmarkedResources = resources.filter((r) => bookmarks.includes(r.id));

  // Recently added resources
  const recentResources = [...resources]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Popular guides
  const popularGuides = [...resources]
    .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
    .slice(0, 4);

  const handleTriggerPasswordReset = async () => {
    if (!user?.email) return;
    const res = await resetPassword(user.email);
    setPasswordResetNotice(res.message);
    setTimeout(() => setPasswordResetNotice(null), 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#101C32] text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700 text-[#55D6FF] text-xs font-semibold">
              <CheckCircle2 size={13} className="text-emerald-400" /> Verified Member Account
            </span>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                <Shield size={13} /> Administrator Privileges
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {userProfile?.fullName || user?.email?.split('@')[0] || 'Engineer'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Your member portal grants unrestricted access to all protected disaster recovery runbooks, PowerShell hardening modules, and architecture blueprints.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={() => onNavigate('/library')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Search size={14} /> Search Entire Catalog
            </button>
            <button
              onClick={() => onNavigate('/profile')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <User size={14} /> Edit Profile
            </button>
            <button
              onClick={handleTriggerPasswordReset}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound size={14} /> Request Password Reset Email
            </button>
          </div>

          {passwordResetNotice && (
            <p className="text-xs text-emerald-400 font-semibold pt-1">
              ✓ {passwordResetNotice}
            </p>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
            <Bookmark size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{bookmarks.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Saved Bookmarks</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Download size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{userDownloads.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Recorded Downloads</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-[#00B5E2]">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{userPayments.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Telebirr Orders</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Shield size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Active Member</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Email Verified ✓</div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Overview & Highlights
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'bookmarks'
              ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Saved Bookmarks ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Download History ({userDownloads.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'border-[#00B5E2] text-[#00B5E2]'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TelebirrLogo size="sm" showSubtitle={false} /> My Payments ({userPayments.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-10">
          {/* Recently Added Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-blue-500" /> Recently Published Resources
              </h2>
              <button
                onClick={() => onNavigate('/library')}
                className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                Browse All ({resources.length}) →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isBookmarked={bookmarks.includes(resource.id)}
                  onBookmarkToggle={onBookmarkToggle}
                  onSelect={(id) => onNavigate('/resource', { id })}
                  isMemberOrVerified={true}
                />
              ))}
            </div>
          </section>

          {/* Popular Guides Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download size={18} className="text-emerald-500" /> Most Downloaded by Members
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularGuides.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isBookmarked={bookmarks.includes(resource.id)}
                  onBookmarkToggle={onBookmarkToggle}
                  onSelect={(id) => onNavigate('/resource', { id })}
                  isMemberOrVerified={true}
                />
              ))}
            </div>
          </section>

          {/* Resource Disciplines Quick Navigation */}
          <section className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Direct Discipline Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <button
                onClick={() => onNavigate('/solutions')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-slate-200 font-bold transition-all shadow-2xs cursor-pointer"
              >
                <FileCode2 size={24} className="text-blue-500" />
                Software Solutions
              </button>
              <button
                onClick={() => onNavigate('/manuals')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-slate-200 font-bold transition-all shadow-2xs cursor-pointer"
              >
                <BookOpen size={24} className="text-sky-500" />
                Technical Manuals
              </button>
              <button
                onClick={() => onNavigate('/troubleshooting')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-slate-200 font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Wrench size={24} className="text-amber-500" />
                Troubleshooting Guides
              </button>
              <button
                onClick={() => onNavigate('/tutorials')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex flex-col items-center justify-center gap-2 text-slate-800 dark:text-slate-200 font-bold transition-all shadow-2xs cursor-pointer"
              >
                <FolderOpen size={24} className="text-cyan-500" />
                Tutorials & Articles
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Saved Bookmarks</h2>
          {bookmarkedResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bookmarkedResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isBookmarked={true}
                  onBookmarkToggle={onBookmarkToggle}
                  onSelect={(id) => onNavigate('/resource', { id })}
                  isMemberOrVerified={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <Bookmark size={32} className="mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Bookmarks Saved</h3>
              <p className="text-xs max-w-sm mx-auto">
                Click the bookmark icon on any guide or script in the library to save it here for fast reference.
              </p>
              <button
                onClick={() => onNavigate('/library')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500"
              >
                Browse Resource Library
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Personal Download History</h2>
          <p className="text-xs text-slate-500">
            Recorded in your private member account subcollection. Only you have access to this log.
          </p>

          {loadingDownloads ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading history...</div>
          ) : userDownloads.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Resource Title</th>
                      <th className="px-6 py-3.5">File Name</th>
                      <th className="px-6 py-3.5">Downloaded Timestamp</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {userDownloads.map((dl, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {dl.resourceTitle}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500">{dl.fileName}</td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(dl.downloadedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => onNavigate('/resource', { id: dl.resourceId })}
                            className="font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                          >
                            Revisit Guide →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
              <Download size={32} className="mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Downloads Recorded Yet</h3>
              <p className="text-xs">When you download technical packages, your history will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Telebirr Payments */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TelebirrLogo size="sm" showSubtitle={false} /> Your Telebirr Payment History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All retainers, advisory engagements, and digital package purchases authorized via your mobile wallet.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/pay')}
              className="px-4 py-2 rounded-xl bg-[#00B5E2] hover:bg-[#009fc7] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              + Make New Payment
            </button>
          </div>

          {loadingPayments ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading your transactions...</div>
          ) : userPayments.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Reference & Title</th>
                      <th className="px-6 py-3.5">Amount (ETB)</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Telebirr Trade No</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {userPayments.map((p) => {
                      const isSuccess = p.status === 'SUCCESS';
                      return (
                        <tr key={p.outTradeNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">{p.title}</div>
                            <div className="font-mono text-[10px] text-slate-400">{p.outTradeNo}</div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                            {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSuccess
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : p.status === 'PENDING'
                                  ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-500">
                            {p.telebirrTradeNo || '—'}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isSuccess ? (
                              <button
                                onClick={() => setSelectedReceipt(p)}
                                className="font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                              >
                                <Printer size={13} /> View Receipt
                              </button>
                            ) : (
                              <button
                                onClick={() => onNavigate('/payment-result', { outTradeNo: p.outTradeNo })}
                                className="font-bold text-slate-600 dark:text-slate-400 hover:underline cursor-pointer"
                              >
                                View Status →
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <CreditCard size={32} className="mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Telebirr Payments Recorded</h3>
              <p className="text-xs max-w-sm mx-auto">
                When you book consulting retainers or settle invoices via Telebirr, your verified transactions and tax receipts will appear here.
              </p>
              <button
                onClick={() => onNavigate('/pay')}
                className="px-4 py-2 bg-[#00B5E2] text-white rounded-xl text-xs font-bold hover:bg-[#009fc7] cursor-pointer"
              >
                Browse Paid Services & Invoices
              </button>
            </div>
          )}
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
