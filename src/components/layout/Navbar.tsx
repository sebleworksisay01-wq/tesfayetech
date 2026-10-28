import React, { useState } from 'react';
import {
  Terminal,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  Shield,
  LogOut,
  FolderOpen,
  FileCode2,
  BookOpen,
  Wrench,
  Layers,
  Briefcase,
  UserCheck,
  Mail,
  ChevronDown,
  LayoutDashboard,
  Cpu,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SiteSettings, PlatformModule } from '../../types';
import { TelebirrLogo } from '../common/TelebirrLogo';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string, params?: Record<string, string>) => void;
  siteSettings: SiteSettings;
}

export function Navbar({ currentPath, onNavigate, siteSettings }: NavbarProps) {
  const { user, userProfile, isAdmin, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);

  // Map module icon names to Lucide icons
  const getModuleIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'filecode2':
      case 'code':
        return FileCode2;
      case 'bookopen':
      case 'book':
        return BookOpen;
      case 'wrench':
      case 'tool':
        return Wrench;
      case 'folderopen':
      case 'folder':
        return FolderOpen;
      case 'briefcase':
      case 'service':
        return Briefcase;
      case 'usercheck':
      case 'user':
        return UserCheck;
      case 'mail':
        return Mail;
      default:
        return Layers;
    }
  };

  // Only display modules that are ENABLED, sorted by order
  const enabledModules = (siteSettings.modules || [])
    .filter((m) => m.enabled)
    .sort((a, b) => a.order - b.order);

  // Split modules into primary top-level navigation links vs dropdown items
  const primaryModules = enabledModules.slice(0, 3);
  const secondaryModules = enabledModules.slice(3);

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setModulesDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#101C32] text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity (Centralized Configuration) */}
          <div
            onClick={() => handleLinkClick('/')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            {siteSettings.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt={siteSettings.siteTitle || 'TesfayeTech'}
                className="w-10 h-10 rounded-lg object-contain bg-slate-900 border border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
                <Cpu size={22} className="text-[#55D6FF]" />
              </div>
            )}
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                {siteSettings.logoText || siteSettings.siteTitle || 'TesfayeTech'}
              </span>
              <p className="text-[10px] text-slate-300 font-medium tracking-wide">
                {siteSettings.tagline || 'Technology, Knowledge, Solutions.'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (Dynamically rendered based on enabled modules) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleLinkClick('/')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentPath === '/'
                  ? 'text-[#55D6FF] bg-slate-800/80 font-semibold'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Home
            </button>

            {primaryModules.map((module) => (
              <button
                key={module.id}
                onClick={() => handleLinkClick(module.path)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentPath === module.path
                    ? 'text-[#55D6FF] bg-slate-800/80 font-semibold'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {module.label}
              </button>
            ))}

            {secondaryModules.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  More Sections
                  <ChevronDown size={14} className={`transition-transform ${modulesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {modulesDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-60 rounded-xl bg-[#101C32] border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {secondaryModules.map((module) => {
                      const Icon = getModuleIcon(module.icon);
                      return (
                        <button
                          key={module.id}
                          onClick={() => handleLinkClick(module.path)}
                          className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Icon size={16} className="text-[#55D6FF] shrink-0" />
                          <div>
                            <div className="font-semibold">{module.label}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">{module.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Direct Pay with Telebirr button */}
            <button
              onClick={() => handleLinkClick('/pay')}
              className={`ml-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPath === '/pay' || currentPath === '/checkout'
                  ? 'bg-[#00B5E2] text-white shadow-md'
                  : 'text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40'
              }`}
            >
              <TelebirrLogo size="sm" showSubtitle={false} variant="icon-only" />
              <span>Pay with Telebirr</span>
            </button>
          </nav>

          {/* Right Action Icons & Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-300" /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer text-sm font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {userProfile?.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate text-slate-200">
                    {userProfile?.fullName || user.email?.split('@')[0]}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold">
                      ADMIN
                    </span>
                  )}
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#101C32] border border-slate-700 shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-sm font-bold text-white truncate">{userProfile?.fullName || 'Member'}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleLinkClick('/dashboard')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard size={16} className="text-blue-400" /> Member Dashboard
                    </button>

                    <button
                      onClick={() => handleLinkClick('/pay')}
                      className="w-full text-left px-4 py-2 text-sm text-cyan-300 hover:text-cyan-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <CreditCard size={16} className="text-[#00B5E2]" /> Pay with Telebirr
                    </button>

                    <button
                      onClick={() => handleLinkClick('/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon size={16} className="text-cyan-400" /> User Profile & Bookmarks
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleLinkClick('/admin')}
                        className="w-full text-left px-4 py-2 text-sm text-amber-300 hover:text-amber-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
                      >
                        <Shield size={16} /> Administrator Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={async () => {
                          await logoutUser();
                          setUserDropdownOpen(false);
                          onNavigate('/');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLinkClick('/login')}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                {siteSettings.registrationEnabled !== false && (
                  <button
                    onClick={() => handleLinkClick('/register')}
                    className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Create Free Account
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-300 hover:text-white"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-300" /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D1728] border-b border-slate-800 px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => handleLinkClick('/')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              currentPath === '/' ? 'text-[#55D6FF] bg-slate-800 font-semibold' : 'text-slate-200'
            }`}
          >
            Home
          </button>

          {enabledModules.map((module) => {
            const Icon = getModuleIcon(module.icon);
            return (
              <button
                key={module.id}
                onClick={() => handleLinkClick(module.path)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                  currentPath === module.path
                    ? 'text-[#55D6FF] bg-slate-800 font-semibold'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={16} className="text-[#55D6FF]" />
                {module.label}
              </button>
            );
          })}

          <div className="border-t border-slate-800 pt-3">
            <button
              onClick={() => handleLinkClick('/pay')}
              className="w-full text-left px-3 py-2 text-sm text-cyan-300 font-bold bg-cyan-950/50 border border-cyan-500/30 rounded-lg flex items-center gap-2 mb-2"
            >
              <TelebirrLogo size="sm" showSubtitle={false} variant="icon-only" /> Pay with Telebirr (ETB)
            </button>
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleLinkClick('/dashboard')}
                  className="w-full text-left px-3 py-2 text-sm text-white font-medium bg-blue-900/40 rounded-lg flex items-center gap-2"
                >
                  <LayoutDashboard size={16} className="text-blue-400" /> Member Dashboard
                </button>
                <button
                  onClick={() => handleLinkClick('/profile')}
                  className="w-full text-left px-3 py-2 text-sm text-slate-200 rounded-lg flex items-center gap-2"
                >
                  <UserIcon size={16} className="text-cyan-400" /> User Profile
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleLinkClick('/admin')}
                    className="w-full text-left px-3 py-2 text-sm text-amber-300 font-medium bg-amber-950/30 rounded-lg flex items-center gap-2"
                  >
                    <Shield size={16} /> Administrator Dashboard
                  </button>
                )}
                <button
                  onClick={async () => {
                    await logoutUser();
                    setMobileMenuOpen(false);
                    onNavigate('/');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-rose-400 rounded-lg flex items-center gap-2"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handleLinkClick('/login')}
                  className="w-full py-2 text-center text-sm font-medium text-slate-200 bg-slate-800 rounded-lg"
                >
                  Sign In
                </button>
                {siteSettings.registrationEnabled !== false && (
                  <button
                    onClick={() => handleLinkClick('/register')}
                    className="w-full py-2 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg"
                  >
                    Create Free Account
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
