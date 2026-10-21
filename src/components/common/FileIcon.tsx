import React from 'react';
import { FileText, FileSpreadsheet, FileCode, Archive, File } from 'lucide-react';
import { FileFormat } from '../../types';

interface FileIconProps {
  format: FileFormat | string;
  className?: string;
  size?: number;
}

export function FileIcon({ format, className = '', size = 20 }: FileIconProps) {
  const normalized = format?.toUpperCase();

  switch (normalized) {
    case 'PDF':
      return <FileText size={size} className={`text-red-500 ${className}`} />;
    case 'DOCX':
    case 'DOC':
      return <FileText size={size} className={`text-blue-600 ${className}`} />;
    case 'XLSX':
    case 'XLS':
    case 'CSV':
      return <FileSpreadsheet size={size} className={`text-emerald-500 ${className}`} />;
    case 'SCRIPT':
    case 'YAML':
    case 'JSON':
    case 'PY':
    case 'SH':
    case 'PS1':
      return <FileCode size={size} className={`text-amber-500 ${className}`} />;
    case 'ZIP':
    case 'TAR':
    case 'GZ':
      return <Archive size={size} className={`text-purple-500 ${className}`} />;
    default:
      return <File size={size} className={`text-slate-400 ${className}`} />;
  }
}
