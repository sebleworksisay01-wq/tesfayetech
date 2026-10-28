import React, { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  Users,
  Settings,
  History,
  Mail,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Download,
  Database,
  Lock,
  Unlock,
  Eye,
  FileText,
  Save,
  RotateCcw,
  Palette,
  Navigation,
  Layout,
  Sliders,
  Globe,
  Tag,
  Share2,
  MessageSquare,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Briefcase,
  BookOpen,
  FolderOpen,
  CreditCard,
  FileDown,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  Resource,
  UserProfile,
  SiteSettings,
  AuditLog,
  ContactMessage,
  ResourceType,
  FileFormat,
  Visibility,
  PublicationStatus,
  PlatformModule,
} from '../types';
import { PaymentRecord } from '../types/payment';
import { Badge } from '../components/common/Badge';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { TelebirrLogo } from '../components/common/TelebirrLogo';
import { ReceiptModal } from '../components/payment/ReceiptModal';
import {
  saveResource,
  removeResource,
  saveSiteSettings,
  getAuditLogs,
  getContactMessages,
  updateContactMessageStatus,
  seedDatabase,
  DEFAULT_SETTINGS,
} from '../services/resourceService';
import { getAllUsers, updateUserStatus, updateUserRole } from '../services/userService';
import {
  getAdminPayments,
  recheckAdminPayment,
  markManualPaymentVerified,
} from '../services/paymentService';

interface AdminDashboardProps {
  resources: Resource[];
  siteSettings: SiteSettings;
  onRefreshResources: () => Promise<void>;
  onRefreshSettings: () => Promise<void>;
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function AdminDashboard({
  resources,
  siteSettings,
  onRefreshResources,
  onRefreshSettings,
  onNavigate,
}: AdminDashboardProps) {
  const { user, isAdmin, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'users' | 'settings' | 'audit' | 'inquiries' | 'payments'>('overview');
  const [settingsSubTab, setSettingsSubTab] = useState<'branding' | 'modules' | 'homepage' | 'general'>('branding');

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [adminPayments, setAdminPayments] = useState<PaymentRecord[]>([]);
  const [paymentAnalytics, setPaymentAnalytics] = useState<{
    totalRevenueETB: number;
    totalCount: number;
    successCount: number;
    pendingCount: number;
    failedCount: number;
    currency: string;
  }>({
    totalRevenueETB: 0,
    totalCount: 0,
    successCount: 0,
    pendingCount: 0,
    failedCount: 0,
    currency: 'ETB',
  });
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [recheckingRef, setRecheckingRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Search terms
  const [resourceSearch, setResourceSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Editing Resource Modal/State
  const [editingResource, setEditingResource] = useState<Partial<Resource> | null>(null);
  const [isNewResource, setIsNewResource] = useState(false);
  const [savingResource, setSavingResource] = useState(false);

  // Destructive Confirmation Modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmAction: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmAction: async () => {},
  });

  // Settings form state
  const [formSettings, setFormSettings] = useState<SiteSettings>(siteSettings);
  const [savingSettings, setSavingSettings] = useState(false);

  // Category input helper
  const [newCategoryName, setNewCategoryName] = useState('');

  // Custom Navigation Item / Module modal state
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModLabel, setNewModLabel] = useState('');
  const [newModPath, setNewModPath] = useState('');
  const [newModDesc, setNewModDesc] = useState('');

  // Load backend data
  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, logs, msgs, pData] = await Promise.all([
        getAllUsers(),
        getAuditLogs(),
        getContactMessages(),
        getAdminPayments().catch(() => null),
      ]);
      setUsersList(uList);
      setAuditLogs(logs);
      setInquiries(msgs);
      if (pData) {
        setAdminPayments(pData.payments);
        setPaymentAnalytics(pData.analytics);
      }
    } catch (err) {
      console.warn('Error loading admin tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setFormSettings(siteSettings);
  }, [siteSettings]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          Only authenticated users designated with the Administrator role on the trusted backend can access administrative features.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500"
        >
          Return to Public Hub
        </button>
      </div>
    );
  }

  // Handle Resource Save
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource || !user) return;

    if (!editingResource.title || !editingResource.shortDescription || !editingResource.category) {
      setActionMessage({ text: 'Please fill in all mandatory fields.', error: true });
      return;
    }

    setSavingResource(true);
    setActionMessage(null);
    try {
      await saveResource(
        {
          id: editingResource.id,
          title: editingResource.title,
          shortDescription: editingResource.shortDescription,
          content: editingResource.content || '## Technical Documentation\n\nContent pending.',
          category: editingResource.category,
          resourceType: editingResource.resourceType || 'solution',
          tags: Array.isArray(editingResource.tags)
            ? editingResource.tags
            : (editingResource.tags as unknown as string || '').split(',').map((t: string) => t.trim()).filter(Boolean),
          fileName: editingResource.fileName || 'runbook.txt',
          fileType: editingResource.fileType || 'TXT',
          fileSize: editingResource.fileSize || '1.0 MB',
          fileData: editingResource.fileData || '',
          version: editingResource.version || '1.0.0',
          author: editingResource.author || userProfile?.fullName || 'TesfayeTech Expert',
          visibility: editingResource.visibility || 'public',
          status: editingResource.status || 'published',
          sourceUrl: editingResource.sourceUrl || '',
          license: editingResource.license || 'TesfayeTech Enterprise License',
          downloadCount: editingResource.downloadCount || 0,
          createdAt: editingResource.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        user.uid,
        user.email || 'admin'
      );

      await onRefreshResources();
      setEditingResource(null);
      setActionMessage({ text: 'Resource successfully committed to database.' });
    } catch (err: unknown) {
      setActionMessage({ text: err instanceof Error ? err.message : 'Failed to save resource.', error: true });
    } finally {
      setSavingResource(false);
    }
  };

  // Prompt Resource Deletion
  const promptDeleteResource = (resource: Resource) => {
    setModalState({
      isOpen: true,
      title: 'Delete Technical Resource',
      message: `Are you certain you want to permanently delete "${resource.title}"? This will invalidate all direct download links and member bookmarks.`,
      confirmAction: async () => {
        if (!user) return;
        await removeResource(resource.id, user.uid, user.email || 'admin');
        await onRefreshResources();
        setModalState((s) => ({ ...s, isOpen: false }));
        setActionMessage({ text: `Resource "${resource.title}" was permanently removed.` });
      },
    });
  };

  // Prompt User Status Toggle
  const promptUserStatusToggle = (targetUser: UserProfile) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    setModalState({
      isOpen: true,
      title: `${nextStatus === 'suspended' ? 'Suspend' : 'Reactivate'} Member Account`,
      message: `Are you sure you want to change account status for ${targetUser.email} to ${nextStatus.toUpperCase()}?`,
      confirmAction: async () => {
        if (!user) return;
        await updateUserStatus(targetUser.uid, nextStatus, user.uid, user.email || 'admin');
        await loadData();
        setModalState((s) => ({ ...s, isOpen: false }));
        setActionMessage({ text: `Account for ${targetUser.email} set to ${nextStatus}.` });
      },
    });
  };

  // Prompt User Role Toggle
  const promptUserRoleToggle = (targetUser: UserProfile) => {
    const nextRole = targetUser.role === 'admin' ? 'member' : 'admin';
    setModalState({
      isOpen: true,
      title: `Change User Role to ${nextRole.toUpperCase()}`,
      message: `Granting or revoking administrator status directly alters Firestore security rules enforcement for ${targetUser.email}. Confirm role update?`,
      confirmAction: async () => {
        if (!user) return;
        await updateUserRole(targetUser.uid, targetUser.email, nextRole, user.uid, user.email || 'admin');
        await loadData();
        setModalState((s) => ({ ...s, isOpen: false }));
        setActionMessage({ text: `Role for ${targetUser.email} updated to ${nextRole}.` });
      },
    });
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingSettings(true);
    setActionMessage(null);
    try {
      await saveSiteSettings(formSettings, user.uid, user.email || 'admin');
      await onRefreshSettings();
      setActionMessage({ text: 'Platform configuration updated and applied globally.' });
    } catch (err: unknown) {
      setActionMessage({ text: err instanceof Error ? err.message : 'Failed to save settings.', error: true });
    } finally {
      setSavingSettings(false);
    }
  };

  // Reset to Defaults
  const promptResetSettings = () => {
    setModalState({
      isOpen: true,
      title: 'Reset Platform Settings to Default',
      message: 'This will reset website branding, colors, modules, navigation, and homepage copy to standard TesfayeTech defaults. Proceed?',
      confirmAction: async () => {
        if (!user) return;
        setFormSettings(DEFAULT_SETTINGS);
        await saveSiteSettings(DEFAULT_SETTINGS, user.uid, user.email || 'admin');
        await onRefreshSettings();
        setModalState((s) => ({ ...s, isOpen: false }));
        setActionMessage({ text: 'Platform configuration reset to defaults.' });
      },
    });
  };

  // Seed Initial Database
  const handleSeedDatabase = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const count = await seedDatabase(user.uid, user.email || 'admin');
      await onRefreshResources();
      await loadData();
      setActionMessage({ text: `Successfully initialized database with ${count} production resources.` });
    } catch (err: unknown) {
      setActionMessage({ text: err instanceof Error ? err.message : 'Database seeding error', error: true });
    } finally {
      setLoading(false);
    }
  };

  // Filtered lists
  const filteredResources = resources.filter((r) =>
    r.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
    r.category.toLowerCase().includes(resourceSearch.toLowerCase()) ||
    r.fileName.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  const filteredUsers = usersList.filter((u) =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.fullName.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Module toggle helper
  const handleToggleModule = (moduleId: string) => {
    const updated = formSettings.modules.map((m) =>
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    );
    setFormSettings({ ...formSettings, modules: updated });
  };

  // Module home toggle helper
  const handleToggleModuleHome = (moduleId: string) => {
    const updated = formSettings.modules.map((m) =>
      m.id === moduleId ? { ...m, showOnHome: !m.showOnHome } : m
    );
    setFormSettings({ ...formSettings, modules: updated });
  };

  // Module label change helper
  const handleModuleLabelChange = (moduleId: string, newLabel: string) => {
    const updated = formSettings.modules.map((m) =>
      m.id === moduleId ? { ...m, label: newLabel } : m
    );
    setFormSettings({ ...formSettings, modules: updated });
  };

  // Module reordering & deletion helpers
  const handleMoveModule = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formSettings.modules.length) return;
    const newMods = [...formSettings.modules];
    const temp = newMods[index];
    newMods[index] = newMods[targetIndex];
    newMods[targetIndex] = temp;
    newMods.forEach((m, idx) => {
      m.order = idx + 1;
    });
    setFormSettings({ ...formSettings, modules: newMods });
  };

  const handleDeleteModule = (moduleId: string) => {
    setFormSettings({
      ...formSettings,
      modules: formSettings.modules.filter((m) => m.id !== moduleId),
    });
  };

  const handleCreateCustomModule = () => {
    if (!newModLabel.trim() || !newModPath.trim()) return;
    const newId = newModLabel.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newMod: PlatformModule = {
      id: newId,
      label: newModLabel.trim(),
      path: newModPath.startsWith('/') ? newModPath.trim() : `/${newModPath.trim()}`,
      description: newModDesc.trim() || `${newModLabel.trim()} section.`,
      icon: 'Layers',
      enabled: true,
      order: formSettings.modules.length + 1,
      showOnHome: true,
    };
    setFormSettings({
      ...formSettings,
      modules: [...formSettings.modules, newMod],
    });
    setNewModLabel('');
    setNewModPath('');
    setNewModDesc('');
    setShowAddModule(false);
  };

  // Preset Template Applicator
  const applyPresetTemplate = (templateKey: 'default' | 'consultant' | 'knowledge_base' | 'solutions_code' | 'academy') => {
    if (templateKey === 'consultant') {
      setFormSettings({
        ...formSettings,
        siteTitle: 'TesfayeTech Consulting',
        tagline: 'Enterprise Cloud Architecture & Advisory',
        heroHeading: 'Enterprise Cloud Architecture & Advisory',
        heroSubheading: 'Specialized infrastructure engineering, Zero-Trust security postures, and incident response readiness.',
        heroDescription: 'Partner with senior infrastructure architects to review multi-region designs, optimize Kubernetes resilience, and implement deterministic DevOps pipelines.',
        heroPrimaryBtnText: 'Consulting Services',
        heroPrimaryBtnPath: '/services',
        heroSecondaryBtnText: 'Schedule Technical Advisory',
        heroSecondaryBtnPath: '/contact',
        expertName: 'Marcus Vance',
        expertTitle: 'Principal Cloud & Security Infrastructure Architect',
        expertBio: 'Over 15 years advising enterprise engineering teams on cloud-native security, Kubernetes zero-trust, and high-availability operations.',
        modules: [
          { id: 'services', label: 'Consulting Services', description: 'Enterprise architecture reviews, cloud migration audits, and incident readiness.', path: '/services', icon: 'Briefcase', enabled: true, order: 1, showOnHome: true },
          { id: 'manuals', label: 'Technical Specifications', description: 'Authoritative system designs, high-availability clusters, and disaster recovery specs.', path: '/manuals', icon: 'BookOpen', enabled: true, order: 2, showOnHome: true },
          { id: 'solutions', label: 'Reference Blueprints', description: 'Production-ready automation modules and Terraform IaC templates.', path: '/solutions', icon: 'FileCode2', enabled: true, order: 3, showOnHome: true },
          { id: 'about', label: 'About Principal', description: 'Verified credentials, industry certifications, and engineering philosophy.', path: '/about', icon: 'UserCheck', enabled: true, order: 4, showOnHome: true },
          { id: 'contact', label: 'Contact & Hire', description: 'Direct consulting inquiry channel and advisory bookings.', path: '/contact', icon: 'Mail', enabled: true, order: 5, showOnHome: false },
          { id: 'library', label: 'Resource Catalog', description: 'All available technical documents and code modules.', path: '/library', icon: 'Layers', enabled: false, order: 6, showOnHome: false },
          { id: 'troubleshooting', label: 'Troubleshooting Guides', description: 'Diagnostic runbooks and emergency resolution procedures.', path: '/troubleshooting', icon: 'Wrench', enabled: false, order: 7, showOnHome: false },
          { id: 'tutorials', label: 'Tutorials & Courses', description: 'In-depth masterclasses and engineering articles.', path: '/tutorials', icon: 'FolderOpen', enabled: false, order: 8, showOnHome: false },
        ],
        showServices: true,
        showTestimonials: true,
        showAboutExpert: true,
      });
      setActionMessage({ text: 'Applied "IT Consultant & Advisory" template! Review settings and click "Save & Apply Settings" below.' });
    } else if (templateKey === 'knowledge_base') {
      setFormSettings({
        ...formSettings,
        siteTitle: 'TesfayeTech Knowledge Base',
        tagline: 'Engineering Manuals & Sev-1 Runbooks',
        heroHeading: 'Definitive IT Runbooks & System Manuals',
        heroSubheading: 'Battle-tested operational playbooks, disaster recovery procedures, and infrastructure documentation for engineering teams.',
        heroDescription: 'Search verified diagnostic workflows, database failover procedures, and high-availability configuration manuals.',
        heroPrimaryBtnText: 'Browse Runbooks',
        heroPrimaryBtnPath: '/manuals',
        heroSecondaryBtnText: 'Troubleshooting Guides',
        heroSecondaryBtnPath: '/troubleshooting',
        modules: [
          { id: 'manuals', label: 'Technical Manuals', description: 'High-availability infrastructure specifications and disaster recovery procedures.', path: '/manuals', icon: 'BookOpen', enabled: true, order: 1, showOnHome: true },
          { id: 'troubleshooting', label: 'Troubleshooting Guides', description: 'Diagnostic runbooks, memory leak investigations, and Sev-1 playbooks.', path: '/troubleshooting', icon: 'Wrench', enabled: true, order: 2, showOnHome: true },
          { id: 'library', label: 'Knowledge Repository', description: 'Comprehensive catalog of verified IT documentation.', path: '/library', icon: 'Layers', enabled: true, order: 3, showOnHome: true },
          { id: 'solutions', label: 'Automated Fixes', description: 'Remediation scripts and configuration compliance tools.', path: '/solutions', icon: 'FileCode2', enabled: true, order: 4, showOnHome: true },
          { id: 'contact', label: 'Support & Escalation', description: 'Technical assistance desk and inquiry channel.', path: '/contact', icon: 'Mail', enabled: true, order: 5, showOnHome: false },
          { id: 'services', label: 'Consulting & Advisory', description: 'Advisory services.', path: '/services', icon: 'Briefcase', enabled: false, order: 6, showOnHome: false },
          { id: 'about', label: 'About Knowledge Hub', description: 'Editorial standards and engineering philosophy.', path: '/about', icon: 'UserCheck', enabled: true, order: 7, showOnHome: false },
          { id: 'tutorials', label: 'Tutorials & Courses', description: 'Masterclasses.', path: '/tutorials', icon: 'FolderOpen', enabled: false, order: 8, showOnHome: false },
        ],
        showServices: false,
        showTestimonials: true,
        showAboutExpert: false,
      });
      setActionMessage({ text: 'Applied "Enterprise Knowledge Base & Runbooks" template! Review settings and click "Save & Apply Settings" below.' });
    } else if (templateKey === 'solutions_code') {
      setFormSettings({
        ...formSettings,
        siteTitle: 'TesfayeTech Solutions & Code',
        tagline: 'Production Code, IaC & Automation Tooling',
        heroHeading: 'Production IaC & DevOps Automation Code',
        heroSubheading: 'Drop-in Terraform modules, Bash automation suites, and CI/CD pipeline blueprints tested for enterprise compliance.',
        heroDescription: 'Download verified scripts, Kubernetes manifests, and PowerShell compliance modules ready for production pipelines.',
        heroPrimaryBtnText: 'Download Code Modules',
        heroPrimaryBtnPath: '/solutions',
        heroSecondaryBtnText: 'View Full Catalog',
        heroSecondaryBtnPath: '/library',
        modules: [
          { id: 'solutions', label: 'Software Solutions', description: 'Automation scripts, Terraform IaC, and PowerShell suites.', path: '/solutions', icon: 'FileCode2', enabled: true, order: 1, showOnHome: true },
          { id: 'library', label: 'Code & Document Library', description: 'Full repository of scripts, manifests, and technical specs.', path: '/library', icon: 'Layers', enabled: true, order: 2, showOnHome: true },
          { id: 'manuals', label: 'Architecture Docs', description: 'System specs and reference designs.', path: '/manuals', icon: 'BookOpen', enabled: true, order: 3, showOnHome: true },
          { id: 'tutorials', label: 'Implementation Guides', description: 'Step-by-step guides for deploying solutions.', path: '/tutorials', icon: 'FolderOpen', enabled: true, order: 4, showOnHome: true },
          { id: 'contact', label: 'Developer Support', description: 'Direct contact with engineering team.', path: '/contact', icon: 'Mail', enabled: true, order: 5, showOnHome: false },
          { id: 'services', label: 'Enterprise Customization', description: 'Tailored automation pipelines.', path: '/services', icon: 'Briefcase', enabled: false, order: 6, showOnHome: false },
          { id: 'about', label: 'About Developers', description: 'Engineering standards.', path: '/about', icon: 'UserCheck', enabled: true, order: 7, showOnHome: false },
          { id: 'troubleshooting', label: 'Bug & Issue Guides', description: 'Fix guides.', path: '/troubleshooting', icon: 'Wrench', enabled: false, order: 8, showOnHome: false },
        ],
        showServices: false,
      });
      setActionMessage({ text: 'Applied "Software Solutions & Code Library" template! Review settings and click "Save & Apply Settings" below.' });
    } else if (templateKey === 'academy') {
      setFormSettings({
        ...formSettings,
        siteTitle: 'TesfayeTech Academy',
        tagline: 'Masterclasses & Technical Certifications',
        heroHeading: 'Advanced Enterprise IT Courses & Tutorials',
        heroSubheading: 'In-depth masterclasses, hands-on lab runbooks, and certification preparation for senior engineers.',
        heroDescription: 'Elevate your cloud, Kubernetes, and network security skills with production-grounded coursework designed by senior architects.',
        heroPrimaryBtnText: 'Start Learning',
        heroPrimaryBtnPath: '/tutorials',
        heroSecondaryBtnText: 'Browse Course Manuals',
        heroSecondaryBtnPath: '/manuals',
        modules: [
          { id: 'tutorials', label: 'Tutorials & Courses', description: 'Deep-dive masterclasses, video courses, and hands-on labs.', path: '/tutorials', icon: 'FolderOpen', enabled: true, order: 1, showOnHome: true },
          { id: 'manuals', label: 'Study Guides & Manuals', description: 'Comprehensive reference architectures and exam specs.', path: '/manuals', icon: 'BookOpen', enabled: true, order: 2, showOnHome: true },
          { id: 'library', label: 'Learning Resources', description: 'All course materials, cheat sheets, and downloadable assets.', path: '/library', icon: 'Layers', enabled: true, order: 3, showOnHome: true },
          { id: 'solutions', label: 'Lab Code & Exercises', description: 'Downloadable exercise files and sample scripts.', path: '/solutions', icon: 'FileCode2', enabled: true, order: 4, showOnHome: true },
          { id: 'about', label: 'Instructor Credentials', description: 'Instructor profile and industry certifications.', path: '/about', icon: 'UserCheck', enabled: true, order: 5, showOnHome: true },
          { id: 'contact', label: 'Student Inquiries', description: 'Direct contact with course instructors.', path: '/contact', icon: 'Mail', enabled: true, order: 6, showOnHome: false },
          { id: 'services', label: 'Corporate Training', description: 'Team workshops.', path: '/services', icon: 'Briefcase', enabled: false, order: 7, showOnHome: false },
          { id: 'troubleshooting', label: 'Lab Troubleshooting', description: 'Debugging lab environments.', path: '/troubleshooting', icon: 'Wrench', enabled: false, order: 8, showOnHome: false },
        ],
        showServices: false,
      });
      setActionMessage({ text: 'Applied "Technology Academy & Courses" template! Review settings and click "Save & Apply Settings" below.' });
    } else {
      setFormSettings({
        ...DEFAULT_SETTINGS,
      });
      setActionMessage({ text: 'Reset to "Full Multipurpose Technology Platform" default! Review settings and click "Save & Apply Settings" below.' });
    }
  };

  // Add category helper
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (!formSettings.categories.includes(newCategoryName.trim())) {
      setFormSettings({
        ...formSettings,
        categories: [...formSettings.categories, newCategoryName.trim()],
      });
    }
    setNewCategoryName('');
  };

  // Remove category helper
  const handleRemoveCategory = (cat: string) => {
    setFormSettings({
      ...formSettings,
      categories: formSettings.categories.filter((c) => c !== cat),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        isDestructive={true}
        onConfirm={modalState.confirmAction}
        onCancel={() => setModalState((s) => ({ ...s, isOpen: false }))}
      />

      {/* Admin Header */}
      <div className="bg-[#101C32] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Shield size={14} /> TesfayeTech Central Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Platform Management Console</h1>
          <p className="text-xs text-slate-400">
            Configure multipurpose modules, brand identity, navigation, and security rules for <strong className="text-white">{formSettings.siteTitle}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDatabase}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Seed standard production resources into Firestore"
          >
            <Database size={14} /> Seed Production Resources
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            actionMessage.error
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-[11px] font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: Layers },
          { id: 'payments', label: `Telebirr Revenue (${adminPayments.length})`, icon: CreditCard },
          { id: 'settings', label: 'Platform & Website Settings', icon: Settings },
          { id: 'resources', label: `Resources (${resources.length})`, icon: FileCode2 },
          { id: 'users', label: `User Accounts (${usersList.length})`, icon: Users },
          { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: History },
          { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                setActionMessage(null);
              }}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Telebirr Total Revenue</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {paymentAnalytics.totalRevenueETB.toLocaleString()}{' '}
                <span className="text-xs font-extrabold text-[#00B5E2]">ETB</span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                {paymentAnalytics.successCount} Settled Orders
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Configured Platform Name</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">{formSettings.siteTitle}</div>
              <div className="text-[11px] text-blue-600 dark:text-cyan-400 mt-2 font-medium truncate">{formSettings.tagline}</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Active Enabled Modules</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {(formSettings.modules || []).filter((m) => m.enabled).length} / {(formSettings.modules || []).length}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Configurable Multipurpose</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Registered Accounts</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{usersList.length}</div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-2 font-medium">Verified Auth Profiles</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Total Resource Downloads</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {resources.reduce((acc, r) => acc + (r.downloadCount || 0), 0)}
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
                {inquiries.filter((m) => m.status === 'unread').length} Unread Inquiries
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setActiveTab('settings');
                setSettingsSubTab('branding');
              }}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left hover:border-blue-500 transition-colors shadow-2xs cursor-pointer space-y-1"
            >
              <div className="text-blue-600 dark:text-cyan-400 font-bold text-sm flex items-center gap-1.5">
                <Palette size={16} /> Customize Brand & Colors
              </div>
              <p className="text-xs text-slate-500">Adjust website title, tagline, logo, colors, and footer copy.</p>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                setSettingsSubTab('modules');
              }}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left hover:border-blue-500 transition-colors shadow-2xs cursor-pointer space-y-1"
            >
              <div className="text-blue-600 dark:text-cyan-400 font-bold text-sm flex items-center gap-1.5">
                <Navigation size={16} /> Configure Modules & Navigation
              </div>
              <p className="text-xs text-slate-500">Enable/disable solutions, manuals, tutorials, consulting, or blog.</p>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                setSettingsSubTab('homepage');
              }}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left hover:border-blue-500 transition-colors shadow-2xs cursor-pointer space-y-1"
            >
              <div className="text-blue-600 dark:text-cyan-400 font-bold text-sm flex items-center gap-1.5">
                <Layout size={16} /> Homepage Layout & Sections
              </div>
              <p className="text-xs text-slate-500">Toggle sections, edit hero headline, statistics, and testimonials.</p>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CENTRALIZED WEBSITE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Preset Platform Templates Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-[#101C32] to-blue-950 text-white rounded-2xl p-5 sm:p-6 border border-blue-500/30 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#55D6FF] flex items-center gap-1.5">
                  <Sparkles size={13} /> Fast Adaptation Presets
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white">Preset Platform Templates</h3>
                <p className="text-xs text-slate-300">
                  Switch the entire platform layout, modules, hero copy, and navigation in one click for your target business model.
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-2.5 py-1 rounded-lg self-start sm:self-auto border border-slate-700">
                Current: {formSettings.siteTitle}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {[
                {
                  id: 'default',
                  title: 'Full Platform',
                  subtitle: 'TesfayeTech All-in-One Hub',
                  icon: Globe,
                  desc: 'All 8 modules enabled, balanced resources & consulting.',
                },
                {
                  id: 'consultant',
                  title: 'IT Consultant',
                  subtitle: 'Advisory & Portfolio',
                  icon: Briefcase,
                  desc: 'Services, client reviews, architecture specs, booking channel.',
                },
                {
                  id: 'knowledge_base',
                  title: 'Knowledge Base',
                  subtitle: 'Manuals & Sev-1 Runbooks',
                  icon: BookOpen,
                  desc: 'System manuals, troubleshooting workflows, incident triage.',
                },
                {
                  id: 'solutions_code',
                  title: 'Solutions & Code',
                  subtitle: 'DevOps & IaC Repository',
                  icon: FileCode2,
                  desc: 'Terraform modules, PowerShell automation, script library.',
                },
                {
                  id: 'academy',
                  title: 'Training Academy',
                  subtitle: 'Courses & Masterclasses',
                  icon: FolderOpen,
                  desc: 'Structured tutorials, study guides, video masterclasses.',
                },
              ].map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyPresetTemplate(tpl.id as 'default' | 'consultant' | 'knowledge_base' | 'solutions_code' | 'academy')}
                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-400 transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="w-7 h-7 rounded-lg bg-blue-600/40 text-[#55D6FF] flex items-center justify-center">
                          <Icon size={14} />
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 group-hover:text-cyan-300">Apply →</span>
                      </div>
                      <div className="font-bold text-xs text-white group-hover:text-[#55D6FF]">{tpl.title}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{tpl.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 dark:bg-slate-850 p-1.5 rounded-2xl text-xs font-semibold">
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'branding', label: '1. Branding & Theme', icon: Palette },
                { id: 'modules', label: '2. Modules & Navigation', icon: Navigation },
                { id: 'homepage', label: '3. Homepage Sections & Hero', icon: Layout },
                { id: 'general', label: '4. General & Governance', icon: Sliders },
              ].map((sub) => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSettingsSubTab(sub.id as typeof settingsSubTab)}
                    className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      settingsSubTab === sub.id
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={13} />
                    {sub.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={promptResetSettings}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset all settings to TesfayeTech defaults"
            >
              <RotateCcw size={12} /> Reset to Defaults
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* SUBTAB A: BRANDING & THEME */}
            {settingsSubTab === 'branding' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Palette size={18} className="text-blue-500" /> Brand Identity & Color Theme
                  </h2>
                  <p className="text-xs text-slate-500">
                    Updating these attributes updates the navbar, headings, badges, and layout across the entire platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Platform Name *</label>
                    <input
                      type="text"
                      required
                      value={formSettings.siteTitle}
                      onChange={(e) => setFormSettings({ ...formSettings, siteTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Brand Tagline *</label>
                    <input
                      type="text"
                      required
                      value={formSettings.tagline}
                      onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Navbar Logo Text</label>
                    <input
                      type="text"
                      value={formSettings.logoText}
                      onChange={(e) => setFormSettings({ ...formSettings, logoText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Custom Logo Image URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={formSettings.logoUrl || ''}
                      onChange={(e) => setFormSettings({ ...formSettings, logoUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                    />
                  </div>
                </div>

                {/* Color Palette */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Theme Color Palette</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Primary Color (Navy / Header)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formSettings.primaryColor}
                          onChange={(e) => setFormSettings({ ...formSettings, primaryColor: e.target.value })}
                          className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formSettings.primaryColor}
                          onChange={(e) => setFormSettings({ ...formSettings, primaryColor: e.target.value })}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Secondary Color (Action Blue)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formSettings.secondaryColor}
                          onChange={(e) => setFormSettings({ ...formSettings, secondaryColor: e.target.value })}
                          className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formSettings.secondaryColor}
                          onChange={(e) => setFormSettings({ ...formSettings, secondaryColor: e.target.value })}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Accent Color (High-Tech Cyan)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formSettings.accentColor}
                          onChange={(e) => setFormSettings({ ...formSettings, accentColor: e.target.value })}
                          className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formSettings.accentColor}
                          onChange={(e) => setFormSettings({ ...formSettings, accentColor: e.target.value })}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Social Info */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact & Social Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={formSettings.contactEmail}
                        onChange={(e) => setFormSettings({ ...formSettings, contactEmail: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={formSettings.contactPhone || ''}
                        onChange={(e) => setFormSettings({ ...formSettings, contactPhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Operating Location</label>
                      <input
                        type="text"
                        value={formSettings.contactLocation || ''}
                        onChange={(e) => setFormSettings({ ...formSettings, contactLocation: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <label className="block font-semibold mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        value={formSettings.socialLinks?.linkedin || ''}
                        onChange={(e) => setFormSettings({
                          ...formSettings,
                          socialLinks: { ...formSettings.socialLinks, linkedin: e.target.value },
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">GitHub URL</label>
                      <input
                        type="url"
                        value={formSettings.socialLinks?.github || ''}
                        onChange={(e) => setFormSettings({
                          ...formSettings,
                          socialLinks: { ...formSettings.socialLinks, github: e.target.value },
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Twitter / X URL</label>
                      <input
                        type="url"
                        value={formSettings.socialLinks?.twitter || ''}
                        onChange={(e) => setFormSettings({
                          ...formSettings,
                          socialLinks: { ...formSettings.socialLinks, twitter: e.target.value },
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">YouTube URL</label>
                      <input
                        type="url"
                        value={formSettings.socialLinks?.youtube || ''}
                        onChange={(e) => setFormSettings({
                          ...formSettings,
                          socialLinks: { ...formSettings.socialLinks, youtube: e.target.value },
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                      />
                    </div>
                  </div>
                </div>

                {/* Expert / Organization Profile Configuration */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Lead Expert / Company / Organization Profile
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure the professional profile or corporate identity featured across the About page, consulting highlights, and published blueprints.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Lead Expert / Organization Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Marcus Vance or TesfayeTech Advisory"
                        value={formSettings.expertName || ''}
                        onChange={(e) => setFormSettings({ ...formSettings, expertName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Professional Title / Practice Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Principal Cloud & Security Architect"
                        value={formSettings.expertTitle || ''}
                        onChange={(e) => setFormSettings({ ...formSettings, expertTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                      />
                    </div>
                  </div>
                  <div className="text-xs">
                    <label className="block font-semibold mb-1">Bio / Practice Overview</label>
                    <textarea
                      rows={2}
                      placeholder="Brief overview of background, engineering focus, and advisory practice..."
                      value={formSettings.expertBio || ''}
                      onChange={(e) => setFormSettings({ ...formSettings, expertBio: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Footer Copyright & Description Text</label>
                  <textarea
                    rows={2}
                    value={formSettings.footerText || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, footerText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs"
                  />
                </div>
              </div>
            )}

            {/* SUBTAB B: MODULES & NAVIGATION */}
            {settingsSubTab === 'modules' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Navigation size={18} className="text-blue-500" /> Platform Modules & Navigation Control
                    </h2>
                    <p className="text-xs text-slate-500">
                      Adapt the platform for consultants, training libraries, or software repositories by enabling or disabling modules, changing labels, and reordering navigation items.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddModule(!showAddModule)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs transition-colors"
                  >
                    <Plus size={14} /> {showAddModule ? 'Cancel' : 'Add Custom Navigation Link'}
                  </button>
                </div>

                {/* Inline Add Custom Module / Link Form */}
                {showAddModule && (
                  <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 space-y-3 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Plus size={14} className="text-blue-500" /> New Navigation Item
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Display Label *</label>
                        <input
                          type="text"
                          placeholder="e.g. Case Studies"
                          value={newModLabel}
                          onChange={(e) => setNewModLabel(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Destination Path *</label>
                        <input
                          type="text"
                          placeholder="e.g. /cases or /library"
                          value={newModPath}
                          onChange={(e) => setNewModPath(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Short Description</label>
                        <input
                          type="text"
                          placeholder="Brief description for menu tooltips"
                          value={newModDesc}
                          onChange={(e) => setNewModDesc(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddModule(false)}
                        className="px-3 py-1 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateCustomModule}
                        disabled={!newModLabel.trim() || !newModPath.trim()}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Add to Navigation
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {(formSettings.modules || []).map((mod, index) => (
                    <div
                      key={mod.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* Order Reorder Controls */}
                        <div className="flex flex-col gap-1 items-center shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveModule(index, 'up')}
                            className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-slate-600 dark:text-slate-300"
                            title="Move item up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">#{index + 1}</span>
                          <button
                            type="button"
                            disabled={index === (formSettings.modules.length - 1)}
                            onClick={() => handleMoveModule(index, 'down')}
                            className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-slate-600 dark:text-slate-300"
                            title="Move item down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={mod.label}
                              onChange={(e) => handleModuleLabelChange(mod.id, e.target.value)}
                              className="font-bold text-sm bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            />
                            <span className="text-[10px] text-slate-400 font-mono">({mod.path})</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px]">{mod.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mod.showOnHome}
                            onChange={() => handleToggleModuleHome(mod.id)}
                            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                          />
                          <span className="text-[11px] text-slate-600 dark:text-slate-300">Show on Home</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleToggleModule(mod.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                            mod.enabled
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                          }`}
                        >
                          {mod.enabled ? 'Enabled' : 'Disabled'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteModule(mod.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Remove module"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB C: HOMEPAGE SECTIONS & HERO */}
            {settingsSubTab === 'homepage' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layout size={18} className="text-blue-500" /> Homepage Sections & Copy Configuration
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configure the hero heading, CTA buttons, and choose which sections appear on the homepage.
                  </p>
                </div>

                {/* Section Visibility Toggles */}
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Homepage Section Visibility</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSettings.showHero}
                        onChange={(e) => setFormSettings({ ...formSettings, showHero: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>Hero Section</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSettings.showStats}
                        onChange={(e) => setFormSettings({ ...formSettings, showStats: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>Key Stats Bar</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSettings.showModules}
                        onChange={(e) => setFormSettings({ ...formSettings, showModules: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>Platform Modules</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSettings.showFeaturedResources}
                        onChange={(e) => setFormSettings({ ...formSettings, showFeaturedResources: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>Featured Content</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSettings.showServices}
                        onChange={(e) => setFormSettings({ ...formSettings, showServices: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>Consulting Services</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSettings.showTestimonials}
                        onChange={(e) => setFormSettings({ ...formSettings, showTestimonials: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>Testimonials</span>
                    </label>
                  </div>
                </div>

                {/* Hero Content */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Hero Heading *</label>
                    <input
                      type="text"
                      required
                      value={formSettings.heroHeading}
                      onChange={(e) => setFormSettings({ ...formSettings, heroHeading: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Hero Subtitle *</label>
                    <textarea
                      rows={2}
                      required
                      value={formSettings.heroSubheading}
                      onChange={(e) => setFormSettings({ ...formSettings, heroSubheading: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Hero Description</label>
                    <textarea
                      rows={2}
                      value={formSettings.heroDescription || ''}
                      onChange={(e) => setFormSettings({ ...formSettings, heroDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1">Primary Button Text & Destination</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formSettings.heroPrimaryBtnText}
                          onChange={(e) => setFormSettings({ ...formSettings, heroPrimaryBtnText: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                        />
                        <input
                          type="text"
                          value={formSettings.heroPrimaryBtnPath}
                          onChange={(e) => setFormSettings({ ...formSettings, heroPrimaryBtnPath: e.target.value })}
                          className="w-32 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Secondary Button Text & Destination</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formSettings.heroSecondaryBtnText}
                          onChange={(e) => setFormSettings({ ...formSettings, heroSecondaryBtnText: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                        />
                        <input
                          type="text"
                          value={formSettings.heroSecondaryBtnPath}
                          onChange={(e) => setFormSettings({ ...formSettings, heroSecondaryBtnPath: e.target.value })}
                          className="w-32 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB D: GENERAL GOVERNANCE & SEO */}
            {settingsSubTab === 'general' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders size={18} className="text-blue-500" /> General Governance & SEO Configuration
                  </h2>
                  <p className="text-xs text-slate-500">
                    Control member registration availability, search engine optimization tags, and catalog categories.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">SEO Page Title</label>
                    <input
                      type="text"
                      value={formSettings.seoTitle || ''}
                      onChange={(e) => setFormSettings({ ...formSettings, seoTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Default Language</label>
                    <input
                      type="text"
                      value={formSettings.defaultLanguage || 'English (US)'}
                      onChange={(e) => setFormSettings({ ...formSettings, defaultLanguage: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-xs">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={formSettings.seoDescription || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, seoDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs"
                  />
                </div>

                {/* Membership and Access Toggles */}
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-2 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-slate-500">Platform Access Controls</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSettings.registrationEnabled}
                        onChange={(e) => setFormSettings({ ...formSettings, registrationEnabled: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Allow Public Member Registration
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-400 pl-6">
                      When disabled, the registration link is hidden from public visitors, allowing private or invitation-only member pools.
                    </p>
                  </div>
                </div>

                {/* Categories Management */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Resource Categories</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New category name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 cursor-pointer"
                    >
                      Add Category
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {formSettings.categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Remove Category"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Global Settings Save Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">Changes take effect across all visitors and active sessions.</span>
              <button
                type="submit"
                disabled={savingSettings}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl disabled:opacity-50 shadow-md cursor-pointer flex items-center gap-2 text-xs"
              >
                <Save size={15} /> {savingSettings ? 'Saving Global Settings...' : 'Save & Publish Platform Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: RESOURCES MANAGER */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources by title or filename..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <button
              onClick={() => {
                setEditingResource({
                  title: '',
                  shortDescription: '',
                  content: '## Overview\n\n### Requirements\n\n### Step-by-Step Instructions\n\n```bash\n# code here\n```\n',
                  category: formSettings.categories[0] || 'Security & DevOps',
                  resourceType: 'solution',
                  tags: ['TesfayeTech', 'Security'],
                  fileName: 'runbook.sh',
                  fileType: 'SCRIPT',
                  fileSize: '500 KB',
                  fileData: '#!/usr/bin/env bash\necho "Running script..."\n',
                  version: '1.0.0',
                  author: userProfile?.fullName || 'TesfayeTech Author',
                  visibility: 'members_only',
                  status: 'published',
                  downloadCount: 0,
                });
                setIsNewResource(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={15} /> Create New Technical Resource
            </button>
          </div>

          {/* Resources Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Title & Category</th>
                    <th className="px-4 py-3.5">Type & Format</th>
                    <th className="px-4 py-3.5">Access Level</th>
                    <th className="px-4 py-3.5">Downloads</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredResources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-3.5 max-w-sm">
                        <div className="font-bold text-slate-900 dark:text-white truncate">{res.title}</div>
                        <div className="text-[11px] text-slate-400">{res.category} • {res.fileName}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold">{res.resourceType.toUpperCase()}</span>
                        <span className="text-slate-400 block text-[10px]">{res.fileType} • {res.fileSize}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {res.visibility === 'members_only' ? (
                          <Badge variant="warning">Members Only</Badge>
                        ) : (
                          <Badge variant="success">Public</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-blue-600 dark:text-cyan-400">
                        {res.downloadCount || 0}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={res.status === 'published' ? 'primary' : 'neutral'}>
                          {res.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingResource(res);
                            setIsNewResource(false);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Edit Resource"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => promptDeleteResource(res)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete Resource"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Resource Editor Modal */}
      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isNewResource ? 'Create New Technical Resource' : 'Edit Technical Resource'}
              </h2>
              <button
                onClick={() => setEditingResource(null)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={editingResource.title || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  maxLength={500}
                  value={editingResource.shortDescription || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    value={editingResource.category || formSettings.categories[0]}
                    onChange={(e) => setEditingResource({ ...editingResource, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                  >
                    {formSettings.categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Discipline Type *</label>
                  <select
                    value={editingResource.resourceType || 'solution'}
                    onChange={(e) => setEditingResource({ ...editingResource, resourceType: e.target.value as ResourceType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                  >
                    <option value="solution">Software Solution</option>
                    <option value="manual">Technical Manual</option>
                    <option value="guide">Troubleshooting Guide</option>
                    <option value="tutorial">Tutorial / Course</option>
                    <option value="article">Article / Blog</option>
                    <option value="project">Project / Portfolio</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Access Visibility *</label>
                  <select
                    value={editingResource.visibility || 'public'}
                    onChange={(e) => setEditingResource({ ...editingResource, visibility: e.target.value as Visibility })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                  >
                    <option value="public">Public (Everyone)</option>
                    <option value="members_only">Members Only (Verified Login)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold mb-1">File Name *</label>
                  <input
                    type="text"
                    required
                    value={editingResource.fileName || ''}
                    onChange={(e) => setEditingResource({ ...editingResource, fileName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Format</label>
                  <select
                    value={editingResource.fileType || 'TXT'}
                    onChange={(e) => setEditingResource({ ...editingResource, fileType: e.target.value as FileFormat })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                    <option value="TXT">TXT</option>
                    <option value="ZIP">ZIP</option>
                    <option value="SCRIPT">SCRIPT</option>
                    <option value="YAML">YAML</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Version</label>
                  <input
                    type="text"
                    value={editingResource.version || '1.0.0'}
                    onChange={(e) => setEditingResource({ ...editingResource, version: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Publication Status</label>
                  <select
                    value={editingResource.status || 'published'}
                    onChange={(e) => setEditingResource({ ...editingResource, status: e.target.value as PublicationStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Technical Documentation (Markdown) *</label>
                <textarea
                  rows={8}
                  required
                  value={editingResource.content || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, content: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Downloadable Content Payload</label>
                <textarea
                  rows={4}
                  placeholder="Raw file content emitted when user downloads..."
                  value={editingResource.fileData || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, fileData: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingResource}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50"
                >
                  {savingResource ? 'Saving Resource...' : 'Commit to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search registered members by email or name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="text-xs text-slate-500">
              Total Accounts: <span className="font-bold text-slate-800 dark:text-slate-200">{usersList.length}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">User Identity</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Registered Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{u.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={u.role === 'admin' ? 'warning' : 'primary'}>
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={u.status === 'active' ? 'success' : 'danger'}>
                          {u.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => promptUserRoleToggle(u)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-[11px] font-semibold cursor-pointer"
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => promptUserStatusToggle(u)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                            u.status === 'active'
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Immutable Administrator Activity Log
            </h2>
            <button
              onClick={loadData}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} /> Refresh
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-4 py-3.5">Details</th>
                    <th className="px-4 py-3.5">Performed By</th>
                    <th className="px-5 py-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-3.5 font-bold font-mono text-blue-600 dark:text-cyan-400">
                        {log.action}
                      </td>
                      <td className="px-4 py-3.5 max-w-md">{log.details}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">{log.performedBy}</td>
                      <td className="px-5 py-3.5 text-right text-slate-400 text-[11px]">
                        {new Date(log.performedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Inquiries Received via Contact Desk ({inquiries.length})
          </h2>

          <div className="space-y-3">
            {inquiries.map((msg) => (
              <div
                key={msg.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{msg.subject}</h3>
                    <p className="text-xs text-slate-400">
                      From: <strong className="text-slate-700 dark:text-slate-200">{msg.name}</strong> ({msg.email})
                    </p>
                  </div>
                  <Badge variant={msg.status === 'unread' ? 'warning' : 'success'}>
                    {msg.status.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Received: {new Date(msg.createdAt).toLocaleString()}</span>
                  {msg.status === 'unread' && (
                    <button
                      onClick={async () => {
                        if (msg.id) {
                          await updateContactMessageStatus(msg.id, 'replied');
                          await loadData();
                        }
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      Mark as Handled / Replied
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: TELEBIRR PAYMENTS MANAGEMENT & AUDITING */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Revenue Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Total Settled Revenue</span>
                <span className="p-1 rounded-md bg-cyan-100 dark:bg-cyan-950 text-[#00B5E2]">
                  <CreditCard size={14} />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {paymentAnalytics.totalRevenueETB.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs font-extrabold text-[#00B5E2]">ETB</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
                ✓ Cryptographically Verified
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Completed Transactions</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {paymentAnalytics.successCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Paid via Telebirr Wallet</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Pending Authorization</div>
              <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                {paymentAnalytics.pendingCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Awaiting Customer PIN</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Cancelled / Failed</div>
              <div className="text-2xl font-black text-slate-500 mt-1">
                {paymentAnalytics.failedCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Zero Client Charges</p>
            </div>
          </div>

          {/* Action Bar & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Search by order ref, customer, phone, or title..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-[#00B5E2] outline-none"
                />
              </div>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
              >
                <option value="ALL">All Statuses ({adminPayments.length})</option>
                <option value="SUCCESS">Success Only</option>
                <option value="PENDING">Pending Only</option>
                <option value="FAILED">Failed / Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Export CSV
                  const headers = 'OrderRef,Title,Customer,Phone,Email,AmountETB,Status,TelebirrTradeNo,CreatedAt,PaidAt\n';
                  const rows = adminPayments
                    .map((p) =>
                      [
                        p.outTradeNo,
                        `"${p.title.replace(/"/g, '""')}"`,
                        `"${p.customerName.replace(/"/g, '""')}"`,
                        p.customerPhone,
                        p.customerEmail || '',
                        p.amount,
                        p.status,
                        p.telebirrTradeNo || '',
                        p.createdAt,
                        p.paidAt || '',
                      ].join(',')
                    )
                    .join('\n');
                  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `tesfayetech_telebirr_payments_${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Export financial records to CSV"
              >
                <FileDown size={14} /> Export CSV
              </button>

              <button
                onClick={() => onNavigate('/pay')}
                className="px-3.5 py-2 rounded-xl bg-[#00B5E2] hover:bg-[#009fc7] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                + Test Checkout
              </button>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Order Ref & Title</th>
                    <th className="px-5 py-3.5">Customer & Phone</th>
                    <th className="px-5 py-3.5">Amount (ETB)</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Telebirr Trade No</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {adminPayments
                    .filter((p) => {
                      if (paymentFilter === 'SUCCESS' && p.status !== 'SUCCESS') return false;
                      if (paymentFilter === 'PENDING' && p.status !== 'PENDING' && p.status !== 'PROCESSING') return false;
                      if (paymentFilter === 'FAILED' && p.status !== 'FAILED' && p.status !== 'CANCELLED' && p.status !== 'EXPIRED') return false;
                      if (!paymentSearch) return true;
                      const q = paymentSearch.toLowerCase();
                      return (
                        p.outTradeNo.toLowerCase().includes(q) ||
                        p.title.toLowerCase().includes(q) ||
                        p.customerName.toLowerCase().includes(q) ||
                        p.customerPhone.toLowerCase().includes(q) ||
                        (p.telebirrTradeNo && p.telebirrTradeNo.toLowerCase().includes(q))
                      );
                    })
                    .map((p) => {
                      const isSuccess = p.status === 'SUCCESS';
                      const isRechecking = recheckingRef === p.outTradeNo;
                      return (
                        <tr key={p.outTradeNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate">{p.title}</div>
                            <div className="font-mono text-[10px] text-slate-400">{p.outTradeNo}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-900 dark:text-white">{p.customerName}</div>
                            <div className="font-mono text-[10px] text-slate-400">{p.customerPhone}</div>
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                            {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                            <span className="text-[10px] text-[#00B5E2]">ETB</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSuccess
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : p.status === 'PENDING' || p.status === 'PROCESSING'
                                  ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                            {p.telebirrTradeNo || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            {isSuccess && (
                              <button
                                onClick={() => setSelectedReceipt(p)}
                                className="text-blue-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                                title="Print Receipt"
                              >
                                Receipt
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                setRecheckingRef(p.outTradeNo);
                                try {
                                  const updated = await recheckAdminPayment(p.outTradeNo);
                                  setAdminPayments((prev) =>
                                    prev.map((item) => (item.outTradeNo === p.outTradeNo ? updated : item))
                                  );
                                  setActionMessage({ text: `Order ${p.outTradeNo} rechecked with Telebirr server.` });
                                } catch (e) {
                                  setActionMessage({ text: 'Recheck failed', error: true });
                                } finally {
                                  setRecheckingRef(null);
                                }
                              }}
                              disabled={isRechecking}
                              className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
                              title="Recheck order status with Telebirr gateway"
                            >
                              {isRechecking ? 'Checking...' : 'Recheck'}
                            </button>
                            {!isSuccess && (
                              <button
                                onClick={async () => {
                                  const reason = window.prompt(
                                    `Manually verify ${p.outTradeNo}? Enter justification for audit log:`
                                  );
                                  if (!reason) return;
                                  try {
                                    const updated = await markManualPaymentVerified(
                                      p.outTradeNo,
                                      user?.email || 'admin',
                                      reason
                                    );
                                    setAdminPayments((prev) =>
                                      prev.map((item) => (item.outTradeNo === p.outTradeNo ? updated : item))
                                    );
                                    setActionMessage({ text: `Order ${p.outTradeNo} manually verified.` });
                                  } catch (e) {
                                    setActionMessage({ text: 'Manual verification failed', error: true });
                                  }
                                }}
                                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                                title="Manually approve order"
                              >
                                Reconcile
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
