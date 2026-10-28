import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Server,
  Terminal,
  FileCode2,
  BookOpen,
  Wrench,
  FolderOpen,
  Download,
  Users,
  CheckCircle,
  Briefcase,
  Star,
  Quote,
  Layers,
  Cpu,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Resource, SiteSettings, PlatformModule } from '../types';
import { ResourceCard } from '../components/common/ResourceCard';
import { useAuth } from '../context/AuthContext';
import { TelebirrLogo } from '../components/common/TelebirrLogo';


interface HomeProps {
  resources: Resource[];
  siteSettings: SiteSettings;
  bookmarks: string[];
  onBookmarkToggle: (resourceId: string) => void;
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function Home({
  resources,
  siteSettings,
  bookmarks,
  onBookmarkToggle,
  onNavigate,
}: HomeProps) {
  const { user } = useAuth();

  // Helper to map module icon names
  const getIconComponent = (iconName: string) => {
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
      case 'server':
        return Server;
      case 'shield':
        return ShieldCheck;
      case 'download':
        return Download;
      case 'users':
        return Users;
      default:
        return Layers;
    }
  };

  // Featured resources
  const featured = resources
    .filter((r) => siteSettings.featuredResourceIds?.includes(r.id) || r.visibility === 'public')
    .slice(0, 4);

  // Enabled modules marked for display on home
  const homeModules = (siteSettings.modules || []).filter((m) => m.enabled && m.showOnHome);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section (Fully Configurable) */}
      {siteSettings.showHero !== false && (
        <section className="relative overflow-hidden bg-[#101C32] text-white pt-16 pb-24 border-b border-slate-800">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#55D6FF_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          
          {/* Accent glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[#55D6FF] text-xs font-semibold tracking-wide">
                <Cpu size={14} /> {siteSettings.tagline || 'Technology, Knowledge, Solutions.'}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                {siteSettings.heroHeading || 'Technology, Knowledge, Solutions.'}
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium">
                {siteSettings.heroSubheading ||
                  'A professional multipurpose technology platform for IT experts, consultants, software engineers, and enterprise innovators.'}
              </p>

              {siteSettings.heroDescription && (
                <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  {siteSettings.heroDescription}
                </p>
              )}

              {/* Dynamic CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => onNavigate(siteSettings.heroPrimaryBtnPath || '/library')}
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {siteSettings.heroPrimaryBtnText || 'Explore Knowledge Hub'} <ArrowRight size={18} />
                </button>

                {!user ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(siteSettings.heroSecondaryBtnPath || '/register')}
                    className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {siteSettings.heroSecondaryBtnText || 'Create Free Account'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('/dashboard')}
                    className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-[#55D6FF] bg-slate-800/90 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Open Member Dashboard →
                  </button>
                )}
              </div>

              {/* Micro value badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-400" /> Verified Engineering Blueprints
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-400" /> Enterprise Zero-Trust Security
                </span>
                <button
                  onClick={() => onNavigate('/pay')}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                >
                  <TelebirrLogo size="sm" showSubtitle={false} variant="icon-only" />
                  <span>Instant Telebirr Mobile Payments (ETB)</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Key Stats Bar (Configurable) */}
      {siteSettings.showStats !== false && siteSettings.stats && siteSettings.stats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6">
            {siteSettings.stats.map((stat, i) => {
              const Icon = getIconComponent(stat.icon);
              return (
                <div key={i} className="flex items-center gap-4 p-2">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 shrink-0">
                    <Icon size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Configurable Multipurpose Platform Modules */}
      {siteSettings.showModules !== false && homeModules.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Platform Solutions & Modules
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Adaptable modules configured for technology portfolios, software consulting, manuals, and technical training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeModules.map((mod) => {
              const Icon = getIconComponent(mod.icon);
              return (
                <div
                  key={mod.id}
                  onClick={() => onNavigate(mod.path)}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:border-blue-500/50 dark:hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform">
                      <Icon size={22} className="text-[#55D6FF]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {mod.label}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-cyan-400">
                    <span>Access {mod.label}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Featured Technical Resources */}
      {siteSettings.showFeaturedResources !== false && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-1">
                Curated Repository
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Featured Technical Documentation
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/library')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-cyan-400 hover:underline"
            >
              Browse Full Catalog ({resources.length}) <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((resource) => (
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
        </section>
      )}

      {/* 5. Consulting & Advisory Services (Multipurpose Practice) */}
      {siteSettings.showServices !== false && siteSettings.services && siteSettings.services.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-1">
                Enterprise Solutions
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Technology Consulting & Advisory Practice
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Specialized architectural design, disaster recovery drills, and security compliance assessments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {siteSettings.services.map((svc, idx) => {
                const Icon = getIconComponent(svc.icon);
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{svc.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{svc.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Key Deliverables</div>
                      {svc.deliverables.map((deliv, di) => (
                        <div key={di} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                          <span>{deliv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => onNavigate('/contact')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Inquire About Consulting Engagement →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 6. Client & Engineering Testimonials */}
      {siteSettings.showTestimonials !== false && siteSettings.testimonials && siteSettings.testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Endorsed by Engineering Leaders
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Trusted by infrastructure directors, enterprise SRE teams, and cybersecurity officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {siteSettings.testimonials.map((testi, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <Quote size={24} className="text-blue-500/40" />
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    &ldquo;{testi.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{testi.author}</div>
                    <div className="text-[11px] text-slate-500">{testi.role}</div>
                    <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold">{testi.company}</div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(testi.rating || 5)].map((_, si) => (
                      <Star key={si} size={13} className="fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Membership Callout */}
      {!user && siteSettings.registrationEnabled !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <Lock size={28} className="text-[#55D6FF]" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Unlock Protected Engineering Blueprints & Runbooks
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
              Create an account on {siteSettings.siteTitle || 'TesfayeTech'} to access protected PowerShell modules, disaster recovery runbooks, Terraform templates, and member bookmarks.
            </p>

            <button
              onClick={() => onNavigate('/register')}
              className="px-8 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              Register Free Member Account <ArrowRight size={18} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
