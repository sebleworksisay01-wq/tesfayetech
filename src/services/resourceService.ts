import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Resource, UserBookmark, UserDownload, SiteSettings, AuditLog, ContactMessage } from '../types';
import { SEED_RESOURCES } from '../data/seedResources';

export const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: 'TesfayeTech',
  tagline: 'Technology, Knowledge, Solutions.',
  logoText: 'TesfayeTech',
  logoUrl: '',
  favicon: '',
  primaryColor: '#101C32',
  secondaryColor: '#2563EB',
  accentColor: '#55D6FF',
  typography: 'Inter / Sans-Serif',
  themePreference: 'system',
  footerText: 'TesfayeTech — Technology, Knowledge, Solutions. Multipurpose enterprise knowledge repository and solutions hub.',
  expertName: 'Marcus Vance',
  expertTitle: 'Principal Cloud Architect & Systems Security Engineer',
  expertBio: 'Over 15 years advising enterprise engineering teams on cloud-native security, Kubernetes zero-trust, and high-availability operations.',
  expertAvatarUrl: '',
  contactEmail: 'contact@tesfayetech.io',
  contactPhone: '+1 (555) 019-2834',
  contactLocation: 'Global Technology Operations & Advisory',
  socialLinks: {
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    twitter: 'https://x.com',
    youtube: 'https://youtube.com',
  },
  heroHeading: 'Technology, Knowledge, Solutions.',
  heroSubheading: 'A professional multipurpose technology platform for IT experts, consultants, software engineers, and enterprise innovators.',
  heroDescription: 'Discover software solutions, technical architecture manuals, troubleshooting runbooks, and consulting resources for technology professionals.',
  heroPrimaryBtnText: 'Explore Knowledge Hub',
  heroPrimaryBtnPath: '/library',
  heroSecondaryBtnText: 'Create Free Account',
  heroSecondaryBtnPath: '/register',
  heroBackgroundStyle: 'cyber-grid',
  showHero: true,
  showStats: true,
  showModules: true,
  showFeaturedResources: true,
  showServices: true,
  showTestimonials: true,
  showAboutExpert: true,
  showNewsletter: true,
  modules: [
    {
      id: 'library',
      label: 'Resource Library',
      description: 'Comprehensive repository of technical documents, code modules, and engineering blueprints.',
      path: '/library',
      icon: 'Layers',
      enabled: true,
      order: 1,
      showOnHome: true,
    },
    {
      id: 'solutions',
      label: 'Software Solutions',
      description: 'Ready-to-deploy automation scripts, Terraform IaC blueprints, and PowerShell compliance suites.',
      path: '/solutions',
      icon: 'FileCode2',
      enabled: true,
      order: 2,
      showOnHome: true,
    },
    {
      id: 'manuals',
      label: 'Technical Manuals',
      description: 'High-availability infrastructure specifications, consensus clustering, and disaster recovery manuals.',
      path: '/manuals',
      icon: 'BookOpen',
      enabled: true,
      order: 3,
      showOnHome: true,
    },
    {
      id: 'troubleshooting',
      label: 'Troubleshooting Guides',
      description: 'Step-by-step diagnostic workflows, memory leak investigations, and Sev-1 incident resolution playbooks.',
      path: '/troubleshooting',
      icon: 'Wrench',
      enabled: true,
      order: 4,
      showOnHome: true,
    },
    {
      id: 'tutorials',
      label: 'Tutorials & Courses',
      description: 'Masterclasses on Zero-Trust Kubernetes architectures, enterprise PKI, and multi-cloud networking.',
      path: '/tutorials',
      icon: 'FolderOpen',
      enabled: true,
      order: 5,
      showOnHome: true,
    },
    {
      id: 'services',
      label: 'Consulting & Advisory',
      description: 'Enterprise architecture reviews, cloud migration audits, and incident response readiness.',
      path: '/services',
      icon: 'Briefcase',
      enabled: true,
      order: 6,
      showOnHome: true,
    },
    {
      id: 'about',
      label: 'About & Credentials',
      description: 'Professional portfolio, verified industry accreditations, and engineering philosophy.',
      path: '/about',
      icon: 'UserCheck',
      enabled: true,
      order: 7,
      showOnHome: true,
    },
    {
      id: 'contact',
      label: 'Contact & Support',
      description: 'Direct inquiry channel, technical assistance desk, and customized advisory bookings.',
      path: '/contact',
      icon: 'Mail',
      enabled: true,
      order: 8,
      showOnHome: false,
    },
  ],
  stats: [
    { label: 'Technical Manuals & Specs', value: '140+', icon: 'BookOpen' },
    { label: 'Production Scripts & IaC', value: '95+', icon: 'FileCode2' },
    { label: 'Verified Member Downloads', value: '18.5k', icon: 'Download' },
    { label: 'Engineers & Architects', value: '4,200+', icon: 'Users' },
  ],
  testimonials: [
    {
      author: 'David Thorne',
      role: 'VP of Infrastructure Engineering',
      company: 'Apex Financial Technologies',
      quote: 'TesfayeTech blueprints saved our engineering team weeks of work during our Kubernetes Zero-Trust hardening cycle. Pure production gold.',
      rating: 5,
    },
    {
      author: 'Elena Rostova',
      role: 'Lead Cloud Architect',
      company: 'Novus Health Systems',
      quote: 'The PostgreSQL Patroni failover manual and core switch recovery runbooks are mandatory reading for every senior SRE in our org.',
      rating: 5,
    },
    {
      author: 'Marcus Sterling',
      role: 'Principal Security Consultant',
      company: 'Vanguard Cyber Advisors',
      quote: 'Having a configurable platform where verified technical knowledge is published with strict cryptographic integrity is transformative.',
      rating: 5,
    },
  ],
  services: [
    {
      title: 'Enterprise Architecture & Cloud Strategy',
      description: 'Zero-Trust multi-region AWS and hybrid data center architecture blueprints designed for 99.999% availability.',
      deliverables: ['Cloud Architecture Specification', 'IaC Terraform Modules', 'Network Security ACL Blueprint'],
      icon: 'Server',
    },
    {
      title: 'DevOps & Kubernetes Hardening',
      description: 'End-to-end cluster security audits, admission controller policies, Kyverno rules, and CIS benchmark alignment.',
      deliverables: ['Cluster Security Audit Report', 'Kyverno & OPA Policies', 'Automated Hardening Script Suite'],
      icon: 'Shield',
    },
    {
      title: 'Sev-1 Incident Response & Disaster Recovery',
      description: 'Rapid diagnostic triage protocols, active directory recovery frameworks, and cold-restart network playbooks.',
      deliverables: ['Custom Incident Runbooks', 'Postmortem Root-Cause Analysis', 'DR Drill Simulations'],
      icon: 'Wrench',
    },
  ],
  featuredResourceIds: ['res-k8s-hardening', 'res-core-switch-dr', 'res-ad-kerberos', 'res-aws-multiaz-vpc'],
  defaultLanguage: 'English (US)',
  seoTitle: 'TesfayeTech — Technology, Knowledge, Solutions.',
  seoDescription: 'Enterprise technology platform for IT experts, consultants, systems administrators, and software solution providers.',
  registrationEnabled: true,
  allowPublicDownloads: true,
  categories: [
    'Security & DevOps',
    'Networking & Infrastructure',
    'Sysadmin & Security',
    'Cloud Architecture',
    'Troubleshooting & Runbooks',
    'Databases & Storage',
    'Cloud & Containers',
  ],
  supportedResourceTypes: [
    { id: 'solution', label: 'Software Solutions', enabled: true },
    { id: 'manual', label: 'Technical Manuals', enabled: true },
    { id: 'guide', label: 'Troubleshooting Guides', enabled: true },
    { id: 'tutorial', label: 'Tutorials & Courses', enabled: true },
    { id: 'article', label: 'Blog & Articles', enabled: true },
    { id: 'project', label: 'Projects & Portfolio', enabled: true },
  ],
};

// 1. Resources Services
export async function getResources(): Promise<Resource[]> {
  try {
    const q = query(collection(db, 'resources'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return SEED_RESOURCES;
    }
    const items: Resource[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...(docSnap.data() as Omit<Resource, 'id'>) });
    });
    return items;
  } catch (err) {
    console.warn('Falling back to local seed resources:', err);
    return SEED_RESOURCES;
  }
}

export async function getResourceById(id: string): Promise<Resource | null> {
  try {
    const docRef = doc(db, 'resources', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Resource, 'id'>) };
    }
  } catch (err) {
    console.warn('Could not fetch from Firestore, checking seed resources:', err);
  }
  const seed = SEED_RESOURCES.find(r => r.id === id);
  return seed || null;
}

export async function saveResource(resourceData: Omit<Resource, 'id'> & { id?: string }, userUid: string, userEmail: string): Promise<string> {
  const resourceId = resourceData.id || `res-${Date.now()}`;
  const now = new Date().toISOString();
  const payload: Resource = {
    ...resourceData,
    id: resourceId,
    createdAt: resourceData.createdAt || now,
    updatedAt: now,
    downloadCount: resourceData.downloadCount ?? 0,
  };

  try {
    await setDoc(doc(db, 'resources', resourceId), payload);
    await createAuditLog({
      action: resourceData.id ? 'UPDATE_RESOURCE' : 'CREATE_RESOURCE',
      targetType: 'resource',
      targetId: resourceId,
      details: `Resource "${payload.title}" (${payload.resourceType}) was saved.`,
      performedBy: userEmail,
      performedByUid: userUid,
      performedAt: now,
    });
    return resourceId;
  } catch (err) {
    return handleFirestoreError(err, OperationType.WRITE, `resources/${resourceId}`);
  }
}

export async function removeResource(resourceId: string, userUid: string, userEmail: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'resources', resourceId));
    await createAuditLog({
      action: 'DELETE_RESOURCE',
      targetType: 'resource',
      targetId: resourceId,
      details: `Resource ID ${resourceId} permanently removed.`,
      performedBy: userEmail,
      performedByUid: userUid,
      performedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `resources/${resourceId}`);
  }
}

export async function incrementResourceDownload(resourceId: string): Promise<void> {
  try {
    const docRef = doc(db, 'resources', resourceId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const current = snap.data() as Resource;
      await updateDoc(docRef, {
        downloadCount: (current.downloadCount || 0) + 1,
      });
    }
  } catch (err) {
    console.warn('Could not increment download count in cloud database:', err);
  }
}

// 2. Bookmarks Subcollection: /users/{userId}/bookmarks/{resourceId}
export async function getUserBookmarks(userId: string): Promise<string[]> {
  try {
    const bRef = collection(db, 'users', userId, 'bookmarks');
    const snap = await getDocs(bRef);
    return snap.docs.map(d => d.data().resourceId || d.id);
  } catch (err) {
    console.warn('Error fetching bookmarks:', err);
    return [];
  }
}

export async function toggleUserBookmark(userId: string, resourceId: string, isCurrentlyBookmarked: boolean): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId, 'bookmarks', resourceId);
    if (isCurrentlyBookmarked) {
      await deleteDoc(docRef);
      return false;
    } else {
      await setDoc(docRef, {
        resourceId,
        createdAt: new Date().toISOString(),
      });
      return true;
    }
  } catch (err) {
    return handleFirestoreError(err, OperationType.WRITE, `users/${userId}/bookmarks/${resourceId}`);
  }
}

// 3. User Downloads Subcollection: /users/{userId}/downloads/{downloadId}
export async function recordUserDownload(userId: string, resource: Resource): Promise<void> {
  try {
    const downloadId = `dl-${Date.now()}`;
    const payload: UserDownload = {
      resourceId: resource.id,
      resourceTitle: resource.title,
      fileName: resource.fileName,
      downloadedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId, 'downloads', downloadId), payload);
  } catch (err) {
    console.warn('Failed recording user download record:', err);
  }
}

export async function getUserDownloads(userId: string): Promise<UserDownload[]> {
  try {
    const dRef = collection(db, 'users', userId, 'downloads');
    const snap = await getDocs(dRef);
    const downloads: UserDownload[] = [];
    snap.forEach(d => {
      downloads.push({ id: d.id, ...(d.data() as Omit<UserDownload, 'id'>) });
    });
    return downloads.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
  } catch (err) {
    console.warn('Error fetching user downloads:', err);
    return [];
  }
}

// 4. Site Settings: /site_settings/general
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, 'site_settings', 'general');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<SiteSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...data,
        modules: data.modules && data.modules.length > 0 ? data.modules : DEFAULT_SETTINGS.modules,
        stats: data.stats && data.stats.length > 0 ? data.stats : DEFAULT_SETTINGS.stats,
        testimonials: data.testimonials && data.testimonials.length > 0 ? data.testimonials : DEFAULT_SETTINGS.testimonials,
        services: data.services && data.services.length > 0 ? data.services : DEFAULT_SETTINGS.services,
        socialLinks: { ...DEFAULT_SETTINGS.socialLinks, ...(data.socialLinks || {}) },
      };
    }
  } catch (err) {
    console.warn('Settings load error, using default settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSiteSettings(settings: Partial<SiteSettings>, userUid: string, userEmail: string): Promise<void> {
  const docRef = doc(db, 'site_settings', 'general');
  const payload = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  try {
    await setDoc(docRef, payload, { merge: true });
    await createAuditLog({
      action: 'UPDATE_SETTINGS',
      targetType: 'site_settings',
      targetId: 'general',
      details: 'Website title, logo, and homepage highlights updated.',
      performedBy: userEmail,
      performedByUid: userUid,
      performedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'site_settings/general');
  }
}

// 5. Audit Logs: /audit_logs/{logId}
export async function createAuditLog(log: Omit<AuditLog, 'id'>): Promise<void> {
  try {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await setDoc(doc(db, 'audit_logs', logId), log);
  } catch (err) {
    console.warn('Could not record audit log:', err);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const q = query(collection(db, 'audit_logs'), orderBy('performedAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    const logs: AuditLog[] = [];
    snap.forEach(d => {
      logs.push({ id: d.id, ...(d.data() as Omit<AuditLog, 'id'>) });
    });
    return logs;
  } catch (err) {
    console.warn('Error getting audit logs:', err);
    return [];
  }
}

// 6. Contact Messages: /contact_messages/{messageId}
export async function sendContactMessage(name: string, email: string, subject: string, message: string): Promise<void> {
  const messageId = `msg-${Date.now()}`;
  const payload: ContactMessage = {
    name,
    email,
    subject,
    message,
    status: 'unread',
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, 'contact_messages', messageId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `contact_messages/${messageId}`);
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    const msgs: ContactMessage[] = [];
    snap.forEach(d => {
      msgs.push({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) });
    });
    return msgs;
  } catch (err) {
    console.warn('Could not fetch messages:', err);
    return [];
  }
}

export async function updateContactMessageStatus(id: string, status: 'unread' | 'replied' | 'archived'): Promise<void> {
  try {
    await updateDoc(doc(db, 'contact_messages', id), { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `contact_messages/${id}`);
  }
}

// 7. Seed initial catalog into Firestore if requested by Administrator
export async function seedDatabase(userUid: string, userEmail: string): Promise<number> {
  let count = 0;
  for (const item of SEED_RESOURCES) {
    try {
      await setDoc(doc(db, 'resources', item.id), item);
      count++;
    } catch (err) {
      console.warn(`Failed seeding ${item.id}:`, err);
    }
  }
  await createAuditLog({
    action: 'SEED_DATABASE',
    targetType: 'resources',
    targetId: 'all',
    details: `Admin seeded ${count} production resources into Firestore catalog.`,
    performedBy: userEmail,
    performedByUid: userUid,
    performedAt: new Date().toISOString(),
  });
  return count;
}
