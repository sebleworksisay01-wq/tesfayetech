import React from 'react';
import { Briefcase, CheckCircle2, ArrowRight, Shield, Server, Wrench, Clock, FileCheck } from 'lucide-react';
import { SiteSettings } from '../types';

interface ServicesPageProps {
  siteSettings: SiteSettings;
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function ServicesPage({ siteSettings, onNavigate }: ServicesPageProps) {
  const services = siteSettings.services || [];

  const engagementModels = [
    {
      title: 'Architecture Review Sprint',
      duration: '2 — 4 Weeks',
      bestFor: 'Organizations redesigning cloud topology, migrating to Kubernetes, or adopting Zero-Trust.',
      features: [
        'Complete infrastructure security posture audit',
        'Infrastructure as Code (Terraform/Ansible) refactoring',
        'Disaster recovery RTO/RPO validation',
        'Final executive roadmap and technical specification',
      ],
    },
    {
      title: 'DevOps & SRE Advisory Retainer',
      duration: 'Monthly Partnership',
      bestFor: 'Growing technology businesses needing principal architect oversight and compliance guidance.',
      features: [
        'Dedicated bi-weekly architectural steering calls',
        'Automated CI/CD security & policy gate implementation',
        'Priority peer review of PRs for critical infrastructure',
        'Quarterly CIS benchmark and Kyverno policy tuning',
      ],
    },
    {
      title: 'Sev-1 Incident Postmortem & DR Drills',
      duration: 'On-Demand / Retainer',
      bestFor: 'Enterprises needing forensic root-cause analysis or disaster recovery fire-drills.',
      features: [
        'Exhaustive forensic analysis of kernel/network outages',
        'Custom standard operating procedure (SOP) authoring',
        'Tabletop simulation drills with engineering leads',
        'Executive remediation presentation',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="bg-[#101C32] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700 text-[#55D6FF] text-xs font-semibold">
            <Briefcase size={14} /> Enterprise Practice & Advisory
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Consulting & Advisory Services</h1>
          <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
            Hands-on technical advisory, Zero-Trust network design, and high-availability systems engineering delivered by principal architects.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-md transition-colors cursor-pointer flex items-center gap-2"
            >
              Inquire About an Engagement <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Core Practice Areas */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Core Advisory Disciplines</h2>
          <p className="text-xs text-slate-500 mt-1">Specialized engineering practices tailored to your infrastructure scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <Server size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{svc.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{svc.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Deliverables</div>
                {svc.deliverables.map((d, di) => (
                  <div key={di} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Engagement Models */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Structured Engagement Models</h2>
          <p className="text-xs text-slate-500 mt-1">Predictable timelines and direct communication channels with senior engineers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {engagementModels.map((model, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">{model.duration}</span>
                  <Clock size={16} className="text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{model.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{model.bestFor}</p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {model.features.map((feat, fi) => (
                    <div key={fi} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <FileCheck size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onNavigate('/contact')}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Schedule Scoping Discussion
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
