import React, { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, SlidersHorizontal, BookOpen, Layers } from 'lucide-react';
import { Resource } from '../types';
import { ResourceCard } from '../components/common/ResourceCard';
import { useAuth } from '../context/AuthContext';

interface ResourceLibraryProps {
  resources: Resource[];
  bookmarks: string[];
  onBookmarkToggle: (resourceId: string) => void;
  onNavigate: (path: string, params?: Record<string, string>) => void;
  initialType?: string;
  initialCategory?: string;
}

const ITEMS_PER_PAGE = 8;

export function ResourceLibrary({
  resources,
  bookmarks,
  onBookmarkToggle,
  onNavigate,
  initialType = 'all',
  initialCategory = 'all',
}: ResourceLibraryProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'title'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract unique categories and formats
  const categories = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => r.category && set.add(r.category));
    return Array.from(set);
  }, [resources]);

  const formats = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => r.fileType && set.add(r.fileType));
    return Array.from(set);
  }, [resources]);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Must be published unless admin
      if (resource.status !== 'published') return false;

      // Search match
      const query = searchTerm.toLowerCase().trim();
      const matchSearch =
        !query ||
        resource.title.toLowerCase().includes(query) ||
        resource.shortDescription.toLowerCase().includes(query) ||
        resource.tags.some((t) => t.toLowerCase().includes(query)) ||
        resource.category.toLowerCase().includes(query) ||
        resource.fileName.toLowerCase().includes(query);

      // Category match
      const matchCategory = selectedCategory === 'all' || resource.category === selectedCategory;

      // Type match
      const matchType = selectedType === 'all' || resource.resourceType === selectedType;

      // Format match
      const matchFormat = selectedFormat === 'all' || resource.fileType === selectedFormat;

      // Visibility match
      const matchVisibility =
        selectedVisibility === 'all' ||
        (selectedVisibility === 'public' && resource.visibility === 'public') ||
        (selectedVisibility === 'members_only' && resource.visibility === 'members_only');

      return matchSearch && matchCategory && matchType && matchFormat && matchVisibility;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'downloads') {
        return (b.downloadCount || 0) - (a.downloadCount || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [resources, searchTerm, selectedCategory, selectedType, selectedFormat, selectedVisibility, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE) || 1;
  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredResources.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredResources, currentPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedFormat('all');
    setSelectedVisibility('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-[#101C32] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#55D6FF] tracking-wide uppercase">
            <Layers size={14} /> Comprehensive Catalog
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">IT Resource Library</h1>
          <p className="text-sm text-slate-300">
            Search and filter enterprise technical documentation, deployment scripts, architecture blueprints, and recovery runbooks.
          </p>
        </div>

        {/* Search Input */}
        <div className="mt-6 relative max-w-xl">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by keywords, tags (e.g. k8s, bgp, kerberos), title, or file name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Quick Type Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
            {[
              { id: 'all', label: 'All Resources' },
              { id: 'solution', label: 'Software Solutions' },
              { id: 'manual', label: 'Technical Manuals' },
              { id: 'guide', label: 'Troubleshooting Guides' },
              { id: 'tutorial', label: 'Tutorials & Articles' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedType(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'downloads' | 'title')}
              aria-label="Sort resources"
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="newest">Recently Published</option>
              <option value="downloads">Most Downloaded</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Detailed Filter Dropdowns */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Category Filter */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* File Format Filter */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">File Format</label>
            <select
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Formats</option>
              {formats.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility Filter */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Access Level</label>
            <select
              value={selectedVisibility}
              onChange={(e) => {
                setSelectedVisibility(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Access Levels</option>
              <option value="public">Publicly Available</option>
              <option value="members_only">Members Only</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredResources.length}</span>{' '}
          matching resources
          {searchTerm && <span> for &ldquo;{searchTerm}&rdquo;</span>}
        </div>
        <div>
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Resource Grid or Empty State */}
      {paginatedResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isBookmarked={bookmarks.includes(resource.id)}
              onBookmarkToggle={onBookmarkToggle}
              onSelect={(id) => onNavigate('/resource', { id })}
              isMemberOrVerified={Boolean(user)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Matching Resources</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We couldn&apos;t find any technical documents or scripts matching your current search criteria and filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 rounded-lg hover:bg-blue-100 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNumber = idx + 1;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
