import React from 'react';
import { Bookmark, Download, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Resource } from '../../types';
import { Badge } from './Badge';
import { FileIcon } from './FileIcon';

interface ResourceCardProps {
  resource: Resource;
  isBookmarked?: boolean;
  onBookmarkToggle?: (resourceId: string) => void;
  onSelect: (resourceId: string) => void;
  isMemberOrVerified?: boolean;
}

export function ResourceCard({
  resource,
  isBookmarked = false,
  onBookmarkToggle,
  onSelect,
  isMemberOrVerified = false,
}: ResourceCardProps) {
  const isMembersOnly = resource.visibility === 'members_only';

  const getTypeVariant = (type: Resource['resourceType']) => {
    switch (type) {
      case 'solution':
        return 'primary';
      case 'manual':
        return 'secondary';
      case 'guide':
        return 'warning';
      case 'tutorial':
        return 'accent';
      default:
        return 'neutral';
    }
  };

  return (
    <div
      onClick={() => onSelect(resource.id)}
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-lg hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={getTypeVariant(resource.resourceType)} size="sm">
              {resource.resourceType.toUpperCase()}
            </Badge>
            <Badge variant="neutral" size="sm">
              {resource.category}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isMembersOnly ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                <Lock size={11} /> Members Only
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} /> Public
              </span>
            )}

            {onBookmarkToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkToggle(resource.id);
                }}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
                    : 'text-slate-400 hover:text-slate-600 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
              >
                <Bookmark size={15} className={isBookmarked ? 'fill-blue-600 dark:fill-blue-400' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">
          {resource.title}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
          {resource.shortDescription}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {resource.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 py-0.5">
              +{resource.tags.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <FileIcon format={resource.fileType} size={16} />
          <span className="font-semibold text-slate-700 dark:text-slate-300">{resource.fileType}</span>
          <span>•</span>
          <span>{resource.fileSize}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-slate-500">
            <Download size={13} /> {resource.downloadCount}
          </span>
          <span className="text-blue-600 dark:text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Details <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}
