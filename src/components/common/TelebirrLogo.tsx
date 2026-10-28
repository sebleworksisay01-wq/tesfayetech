import React from 'react';

interface TelebirrLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'full' | 'icon-only' | 'badge';
  darkMode?: boolean;
}

export function TelebirrLogo({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'full',
  darkMode = false,
}: TelebirrLogoProps) {
  const sizeMap = {
    sm: { icon: 20, text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 28, text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 36, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 48, text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  // Official Telebirr SVG mark (cyan and lime spiral curves)
  const Icon = () => (
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <circle cx="50" cy="50" r="48" fill="#00B5E2" />
      {/* Outer spiral lime wing */}
      <path
        d="M50 14C30.12 14 14 30.12 14 50C14 62.4 20.3 73.34 29.89 79.8C25.13 72.8 22.3 64.3 22.3 55.2C22.3 39.8 34.8 27.3 50.2 27.3C61.4 27.3 71.1 33.9 75.5 43.4C71.3 26.6 56.1 14 50 14Z"
        fill="#78BE20"
      />
      {/* Inner white dynamic mobile curve */}
      <path
        d="M50 32C40.06 32 32 40.06 32 50C32 59.94 40.06 68 50 68C56.2 68 61.7 64.9 65 60.1C61.8 62.6 57.7 64.1 53.3 64.1C44.4 64.1 37.2 56.9 37.2 48C37.2 39.1 44.4 31.9 53.3 31.9C57.7 31.9 61.8 33.4 65 35.9C61.7 31.1 56.2 32 50 32Z"
        fill="#FFFFFF"
      />
      {/* Dynamic central pulse point */}
      <circle cx="58" cy="50" r="8" fill="#FFFFFF" />
      <circle cx="58" cy="50" r="4.5" fill="#78BE20" />
    </svg>
  );

  if (variant === 'icon-only') {
    return <Icon />;
  }

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-semibold text-xs ${className}`}
      >
        <Icon />
        <span>telebirr</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <Icon />
      <div className="flex flex-col leading-tight">
        <span
          className={`font-black tracking-tight ${currentSize.text} ${
            darkMode ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}
        >
          tele<span className="text-[#00B5E2]">birr</span>
        </span>
        {showSubtitle && (
          <span
            className={`font-semibold tracking-wide uppercase ${currentSize.sub} text-[#78BE20]`}
          >
            ethio telecom
          </span>
        )}
      </div>
    </div>
  );
}
