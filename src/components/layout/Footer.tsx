import React from 'react';
import { Cpu, ShieldCheck, Mail, MapPin, Phone, Github, Linkedin, Twitter, Youtube, ExternalLink } from 'lucide-react';
import { SiteSettings } from '../../types';

interface FooterProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
  siteSettings: SiteSettings;
}

export function Footer({ onNavigate, siteSettings }: FooterProps) {
  const enabledModules = (siteSettings.modules || []).filter((m) => m.enabled);

  return (
    <footer className="bg-[#101C32] text-slate-300 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div
              onClick={() => onNavigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {siteSettings.logoUrl ? (
                <img
                  src={siteSettings.logoUrl}
                  alt={siteSettings.siteTitle || 'NexusTech'}
                  className="w-9 h-9 rounded-lg object-contain bg-slate-900 border border-slate-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <Cpu size={20} className="text-[#55D6FF]" />
                </div>
              )}
              <div>
                <span className="font-extrabold text-lg text-white">
                  {siteSettings.logoText || siteSettings.siteTitle || 'NexusTech'}
                </span>
                <p className="text-[10px] text-slate-400 font-medium">
                  {siteSettings.tagline || 'Technology, Knowledge, Solutions.'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {siteSettings.footerText ||
                'NexusTech — Technology, Knowledge, Solutions. Professional multipurpose technology platform for IT experts, consultants, and enterprise knowledge sharing.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-md w-fit">
              <ShieldCheck size={14} /> Production Enterprise Verified
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {siteSettings.socialLinks?.github && (
                <a
                  href={siteSettings.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  title="GitHub"
                >
                  <Github size={16} />
                </a>
              )}
              {siteSettings.socialLinks?.linkedin && (
                <a
                  href={siteSettings.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin size={16} />
                </a>
              )}
              {siteSettings.socialLinks?.twitter && (
                <a
                  href={siteSettings.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Twitter / X"
                >
                  <Twitter size={16} />
                </a>
              )}
              {siteSettings.socialLinks?.youtube && (
                <a
                  href={siteSettings.socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  title="YouTube"
                >
                  <Youtube size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Enabled Platform Modules */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              {enabledModules.slice(0, 5).map((mod) => (
                <li key={mod.id}>
                  <button
                    onClick={() => onNavigate(mod.path)}
                    className="hover:text-[#55D6FF] transition-colors cursor-pointer text-left"
                  >
                    {mod.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Standards */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Knowledge & Governance
            </h4>
            <ul className="space-y-2 text-xs">
              {enabledModules.slice(5).map((mod) => (
                <li key={mod.id}>
                  <button
                    onClick={() => onNavigate(mod.path)}
                    className="hover:text-[#55D6FF] transition-colors cursor-pointer text-left"
                  >
                    {mod.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate('/test-checklist')}
                  className="hover:text-[#55D6FF] transition-colors cursor-pointer text-left text-cyan-300 font-semibold"
                >
                  Compliance & Test Matrix →
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Direct Contact
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-blue-400 shrink-0" />
                <span>{siteSettings.contactEmail || 'contact@nexustech.io'}</span>
              </div>
              {siteSettings.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-blue-400 shrink-0" />
                  <span>{siteSettings.contactPhone}</span>
                </div>
              )}
              {siteSettings.contactLocation && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-blue-400 shrink-0" />
                  <span>{siteSettings.contactLocation}</span>
                </div>
              )}
              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                NexusTech provides centralized role-based controls and cryptographic integrity for enterprise knowledge assets.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} {siteSettings.siteTitle || 'NexusTech'}. {siteSettings.tagline || 'Technology, Knowledge, Solutions.'} All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500">Multipurpose Platform v4.0</span>
            <button
              onClick={() => onNavigate('/about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Credentials & Portfolio
            </button>
            <button
              onClick={() => onNavigate('/contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Advisory Desk
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
