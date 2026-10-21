import React from 'react';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

interface NotFoundProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function NotFound({ onNavigate }: NotFoundProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
        <FileQuestion size={40} />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">404</h1>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Page Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          The technical document or route you are attempting to access does not exist or may have been relocated in the catalog.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Home size={14} /> Return to Homepage
        </button>
        <button
          onClick={() => onNavigate('/library')}
          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Browse Library
        </button>
      </div>
    </div>
  );
}
