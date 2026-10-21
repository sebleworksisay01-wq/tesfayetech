import React from 'react';
import { FileCode2, BookOpen, Wrench, FolderOpen, ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { Resource, ResourceType } from '../types';
import { ResourceCard } from '../components/common/ResourceCard';
import { useAuth } from '../context/AuthContext';

interface CategoryPageProps {
  type: ResourceType;
  resources: Resource[];
  bookmarks: string[];
  onBookmarkToggle: (resourceId: string) => void;
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function CategoryPage({
  type,
  resources,
  bookmarks,
  onBookmarkToggle,
  onNavigate,
}: CategoryPageProps) {
  const { user } = useAuth();

  const configMap: Record<ResourceType, {
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    accent: string;
    description: string;
  }> = {
    solution: {
      title: 'Software Solutions & Tooling',
      subtitle: 'Production-ready automation scripts, Infrastructure-as-Code modules, and PowerShell utilities.',
      icon: FileCode2,
      accent: 'text-blue-400',
      description: 'Tested scripts and templates that automate tedious server configurations, enforce CIS baseline benchmarks, and manage multi-region cloud infrastructures without vendor lock-in.',
    },
    manual: {
      title: 'Technical Manuals & Architectures',
      subtitle: 'Authoritative system designs, high-availability clusters, and disaster recovery procedures.',
      icon: BookOpen,
      accent: 'text-sky-400',
      description: 'Comprehensive specifications detailing consensus protocols, Active Directory domain forest migrations, BGP redundancy, and resilient database clustering topologies.',
    },
    guide: {
      title: 'Troubleshooting Guides & Runbooks',
      subtitle: 'Actionable diagnostic workflows, root-cause analyses, and Sev-1 incident triage procedures.',
      icon: Wrench,
      accent: 'text-amber-400',
      description: 'Emergency step-by-step resolution guides for kernel memory exhaustion, network broadcast loops, ransomware containment, and service outages.',
    },
    tutorial: {
      title: 'Tutorials & Technical Courses',
      subtitle: 'Deep-dive educational guides and architectural blueprints for senior engineers.',
      icon: FolderOpen,
      accent: 'text-cyan-400',
      description: 'Foundational masterclasses covering internal enterprise Public Key Infrastructure (PKI), Zero-Trust network policies, and modern security posture management.',
    },
    article: {
      title: 'Technical Articles & Perspectives',
      subtitle: 'Engineering insights, cloud industry perspectives, and architectural post-mortems.',
      icon: BookOpen,
      accent: 'text-indigo-400',
      description: 'In-depth analyses of enterprise technologies, distributed systems design patterns, operational excellence, and technical leadership insights.',
    },
    project: {
      title: 'Projects & Case Studies',
      subtitle: 'Real-world system implementations, architecture reference blueprints, and case studies.',
      icon: ShieldCheck,
      accent: 'text-emerald-400',
      description: 'Documented multi-region enterprise deployments, infrastructure transformations, zero-downtime database migrations, and production reference code.',
    },
  };

  const config = configMap[type] || configMap.solution;
  const Icon = config.icon;
  const filtered = resources.filter((r) => r.resourceType === type && r.status === 'published');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb / Back button */}
      <div>
        <button
          onClick={() => onNavigate('/library')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to All Resources
        </button>
      </div>

      {/* Category Banner */}
      <div className="bg-[#101C32] text-white rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative max-w-3xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-white">
              <Icon size={24} className={config.accent} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#55D6FF]">
                Resource Discipline
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold">{config.title}</h1>
            </div>
          </div>

          <p className="text-base text-slate-300 font-medium">{config.subtitle}</p>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">{config.description}</p>
        </div>
      </div>

      {/* Resources List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Available Documents ({filtered.length})
          </h2>
          <span className="text-xs text-slate-500">Verified & Certified</span>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((resource) => (
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500">
            No resources available in this discipline yet. Check back soon or visit our full library.
          </div>
        )}
      </div>
    </div>
  );
}
