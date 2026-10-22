import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Bookmark,
  Share2,
  Lock,
  CheckCircle2,
  Calendar,
  User,
  Tag,
  Shield,
  FileText,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { Resource } from '../types';
import { Badge } from '../components/common/Badge';
import { FileIcon } from '../components/common/FileIcon';
import { ResourceCard } from '../components/common/ResourceCard';
import { useAuth } from '../context/AuthContext';
import { recordUserDownload, incrementResourceDownload } from '../services/resourceService';

interface ResourceDetailsProps {
  resourceId: string;
  resources: Resource[];
  bookmarks: string[];
  onBookmarkToggle: (resourceId: string) => void;
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function ResourceDetails({
  resourceId,
  resources,
  bookmarks,
  onBookmarkToggle,
  onNavigate,
}: ResourceDetailsProps) {
  const { user, isVerified } = useAuth();
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const resource = resources.find((r) => r.id === resourceId);

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resource Not Found</h2>
        <p className="text-sm text-slate-500">The technical resource you requested does not exist or may have been removed.</p>
        <button
          onClick={() => onNavigate('/library')}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(resource.id);
  const isMembersOnly = resource.visibility === 'members_only';
  const canDownload = !isMembersOnly || (user && user.emailVerified);

  // Related resources in the same category
  const relatedResources = resources
    .filter((r) => r.id !== resource.id && (r.category === resource.category || r.resourceType === resource.resourceType))
    .slice(0, 3);

  // Handle file download
  const handleDownload = async () => {
    setDownloadError(null);

    // Gating check
    if (isMembersOnly && !user) {
      setDownloadError('Authentication required: Please sign in or create an account to download members-only technical resources.');
      return;
    }

    if (isMembersOnly && user && !user.emailVerified) {
      setDownloadError('Verification required: Please verify your email address to unlock protected downloads.');
      return;
    }

    try {
      // Create download blob
      const contentToDownload = resource.fileData || `# ${resource.title}\nVersion: ${resource.version}\nAuthor: ${resource.author}\nDate: ${resource.createdAt}\nLicense: ${resource.license || 'TesfayeTech Member License'}\n\n${resource.content}`;
      const blob = new Blob([contentToDownload], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resource.fileName || `${resource.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Record download and increment counter
      if (user) {
        await recordUserDownload(user.uid, resource);
      }
      await incrementResourceDownload(resource.id);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadError('Failed to initiate secure download. Please check your connection and try again.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('/library')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Library
        </button>
      </div>

      {/* Main Grid: Content (8 cols) and Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Resource Technical Body */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{resource.resourceType.toUpperCase()}</Badge>
              <Badge variant="secondary">{resource.category}</Badge>
              {isMembersOnly ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
                  <Lock size={12} /> Members Only
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 size={12} /> Public Resource
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {resource.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {resource.shortDescription}
            </p>

            {/* Author & Meta bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <User size={14} className="text-blue-500" /> {resource.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> Version {resource.version} • Published {new Date(resource.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy link"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                  <span className="text-[11px] font-medium">{copied ? 'Copied' : 'Share'}</span>
                </button>

                {user && (
                  <button
                    type="button"
                    onClick={() => onBookmarkToggle(resource.id)}
                    className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                      isBookmarked
                        ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <Bookmark size={14} className={isBookmarked ? 'fill-blue-600 dark:fill-blue-400' : ''} />
                    <span className="text-[11px] font-medium">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Content / Documentation Viewer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode size={18} className="text-blue-500" /> Technical Documentation & Runbook Steps
              </h2>
              <span className="text-xs text-slate-400">Markdown Format</span>
            </div>

            <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
              {resource.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-xl font-extrabold text-slate-900 dark:text-white mt-8 mb-3 pb-1 border-b border-slate-100 dark:border-slate-800">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('```')) {
                  const lines = paragraph.split('\n');
                  const code = lines.slice(1, -1).join('\n');
                  return (
                    <div key={index} className="my-4 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 text-slate-200">
                      <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between border-b border-slate-800">
                        <span>Code / Configuration Block</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(code);
                            alert('Code copied to clipboard');
                          }}
                          className="hover:text-white text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Copy size={12} /> Copy
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-emerald-300">
                        <code>{code}</code>
                      </pre>
                    </div>
                  );
                }
                return <p key={index} className="leading-relaxed whitespace-pre-line">{paragraph}</p>;
              })}
            </div>

            {/* Tags footer */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
              <Tag size={14} className="text-slate-400" />
              {resource.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Download & Metadata Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Download Action Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-4 sticky top-24">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/80">
                <FileIcon format={resource.fileType} size={28} />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-medium text-slate-500 truncate">Attached Package</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {resource.fileName}
                </div>
              </div>
            </div>

            {/* File Specs */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>File Format:</span>
                <span className="font-bold text-slate-900 dark:text-white">{resource.fileType}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>File Size:</span>
                <span className="font-bold text-slate-900 dark:text-white">{resource.fileSize}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>License:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                  {resource.license || 'TesfayeTech Standard'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Downloads:</span>
                <span className="font-bold text-blue-600 dark:text-cyan-400">{resource.downloadCount}</span>
              </div>
            </div>

            {/* Error message */}
            {downloadError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>{downloadError}</p>
                  {!user && (
                    <div className="pt-1 flex gap-2">
                      <button
                        onClick={() => onNavigate('/login')}
                        className="font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                      >
                        Sign In Now →
                      </button>
                      <button
                        onClick={() => onNavigate('/register')}
                        className="font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                      >
                        Register
                      </button>
                    </div>
                  )}
                  {user && !user.emailVerified && (
                    <button
                      onClick={() => onNavigate('/verify-email')}
                      className="font-bold text-blue-600 dark:text-cyan-400 hover:underline block pt-1"
                    >
                      Verify Email Address →
                    </button>
                  )}
                </div>
              </div>
            )}

            {downloadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={16} /> Download initiated! File saved to your device.
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={handleDownload}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                canDownload
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {canDownload ? (
                <>
                  <Download size={18} /> Download Resource
                </>
              ) : (
                <>
                  <Lock size={18} className="text-amber-400" /> Unlock Protected Download
                </>
              )}
            </button>

            {isMembersOnly && !user && (
              <p className="text-[11px] text-center text-slate-500">
                Requires free registered account with verified email address.
              </p>
            )}

            {resource.sourceUrl && (
              <a
                href={resource.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                External Repository / Source <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Related Resources */}
          {relatedResources.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                Related Documentation
              </h3>
              <div className="space-y-3">
                {relatedResources.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onNavigate('/resource', { id: rel.id })}
                    className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <FileIcon format={rel.fileType} size={14} />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{rel.fileType}</span>
                      <span>•</span>
                      <span>{rel.category}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-blue-600">
                      {rel.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
