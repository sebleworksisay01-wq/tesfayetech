import React from 'react';
import {
  Award,
  ShieldCheck,
  Server,
  Terminal,
  Cpu,
  CheckCircle,
  ExternalLink,
  Mail,
  Linkedin,
  Github,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { SiteSettings } from '../types';

interface AboutExpertProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
  siteSettings: SiteSettings;
}

export function AboutExpert({ onNavigate, siteSettings }: AboutExpertProps) {
  const certifications = [
    { name: 'CISSP', issuer: '(ISC)²', desc: 'Certified Information Systems Security Professional' },
    { name: 'CKA', issuer: 'CNCF / Linux Foundation', desc: 'Certified Kubernetes Administrator' },
    { name: 'AWS Solutions Architect Pro', issuer: 'Amazon Web Services', desc: 'Enterprise Multi-Tier Cloud Architect' },
    { name: 'RHCA', issuer: 'Red Hat', desc: 'Red Hat Certified Architect in Infrastructure' },
    { name: 'CCIE Emeritus', issuer: 'Cisco Systems', desc: 'Enterprise Infrastructure & Core Switching' },
    { name: 'HashiCorp Terraform Associate', issuer: 'HashiCorp', desc: 'Infrastructure as Code Specialist' },
  ];

  const careerHighlights = [
    {
      period: '2020 — Present',
      role: 'Principal Cloud & Zero-Trust Infrastructure Architect',
      org: `${siteSettings.siteTitle || 'TesfayeTech'} Enterprise Practice`,
      summary: 'Advises Fortune 500 banks, healthcare networks, and SaaS providers on container security posture, automated compliance, and multi-region disaster recovery.',
    },
    {
      period: '2015 — 2020',
      role: 'Senior Director of Infrastructure Engineering & CISO Advisor',
      org: 'Enterprise Cloud Platforms',
      summary: 'Directed global 24/7 SRE and NOC operations overseeing 12,000+ bare-metal and hybrid virtual hosts. Maintained 99.999% uptime across Tier-4 data centers.',
    },
    {
      period: '2010 — 2015',
      role: 'Lead Network & Systems Security Engineer',
      org: 'Global Telco Infrastructure',
      summary: 'Designed multi-homed BGP routing, MPLS backbones, and enterprise Active Directory consolidation for over 45,000 concurrent endpoints.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <div className="bg-[#101C32] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700 text-[#55D6FF] text-xs font-semibold">
            <ShieldCheck size={14} /> {siteSettings.siteTitle || 'TesfayeTech'} Principal Practice
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            {siteSettings.expertName || 'Marcus Vance'}
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 font-medium">
            {siteSettings.expertTitle || 'Principal Infrastructure Architect, Systems Security Engineer & SRE Advisor'}
          </p>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            {siteSettings.expertBio ||
              `${siteSettings.siteTitle || 'TesfayeTech'} provides an adaptable platform connecting enterprise engineers with battle-tested architectures, automated runbooks, and high-availability systems engineering.`}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-md transition-colors cursor-pointer"
            >
              Consulting Inquiries →
            </button>
            <button
              onClick={() => onNavigate('/services')}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-xs text-slate-200 transition-colors cursor-pointer"
            >
              Consulting Services
            </button>
            <button
              onClick={() => onNavigate('/library')}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-xs text-slate-200 transition-colors cursor-pointer"
            >
              Published Blueprints
            </button>
          </div>
        </div>
      </div>

      {/* Architecture Philosophy Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Engineering Philosophy</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Core principles embedded in every runbook, script, and architecture published on {siteSettings.siteTitle || 'TesfayeTech'}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero-Trust by Default</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Perimeters are an illusion. Every microservice, pod, database connection, and management endpoint must authenticate via mutual TLS (mTLS) with short-lived tokens and explicit least-privilege RBAC.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Deterministic Automation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              If an infrastructure component cannot be destroyed and cleanly reproduced from Git-versioned Infrastructure as Code (IaC) in under 15 minutes, it is technical debt waiting to fail.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Production-Tested Realism</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every playbook on {siteSettings.siteTitle || 'TesfayeTech'} has been executed during real-world Severity-1 incidents. No theoretical academic exercises; only scripts proven under live enterprise loads.
            </p>
          </div>
        </div>
      </section>

      {/* Professional Certifications & Accreditations */}
      <section className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award size={20} className="text-blue-600 dark:text-cyan-400" /> Professional Certifications & Accreditations
          </h2>
          <p className="text-xs text-slate-500 mt-1">Verified industry credentials maintained in active standing.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((c, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-blue-600 dark:text-cyan-400">{c.name}</span>
                <CheckCircle size={14} className="text-emerald-500" />
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.desc}</div>
              <div className="text-[11px] text-slate-400">Issuer: {c.issuer}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Career Trajectory */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Career Milestones</h2>
        <div className="space-y-4">
          {careerHighlights.map((job, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="text-xs font-bold text-blue-600 dark:text-cyan-400">{job.period}</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{job.role}</h3>
                <div className="text-xs font-medium text-slate-500">{job.org}</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 leading-relaxed">{job.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
