/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { ResourceLibrary } from './pages/ResourceLibrary';
import { CategoryPage } from './pages/CategoryPage';
import { ResourceDetails } from './pages/ResourceDetails';
import { ServicesPage } from './pages/ServicesPage';
import { AboutExpert } from './pages/AboutExpert';
import { Contact } from './pages/Contact';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { MemberDashboard } from './pages/MemberDashboard';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { TestChecklist } from './pages/TestChecklist';

// Services & Data
import { Resource, SiteSettings } from './types';
import { getResources, getSiteSettings, getUserBookmarks, toggleUserBookmark, DEFAULT_SETTINGS } from './services/resourceService';
import { SEED_RESOURCES } from './data/seedResources';

function AppContent() {
  const { user, isVerified, isAdmin, loading: authLoading } = useAuth();

  // Navigation state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || window.location.pathname || '/';
  });

  const [routeParams, setRouteParams] = useState<Record<string, string>>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      params[k] = v;
    });
    return params;
  });

  // Data state
  const [resources, setResources] = useState<Resource[]>(SEED_RESOURCES);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Sync hash with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const [path, query] = hash.split('?');
        setCurrentPath(path || '/');
        if (query) {
          const params: Record<string, string> = {};
          new URLSearchParams(query).forEach((v, k) => {
            params[k] = v;
          });
          setRouteParams(params);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, params?: Record<string, string>) => {
    setCurrentPath(path);
    setRouteParams(params || {});
    let newHash = path;
    if (params && Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString();
      newHash += `?${query}`;
    }
    window.location.hash = newHash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load Resources and Site Settings
  const refreshResources = async () => {
    try {
      const fetched = await getResources();
      setResources(fetched);
    } catch (err) {
      console.warn('Error refreshing resources:', err);
    }
  };

  const refreshSettings = async () => {
    try {
      const settings = await getSiteSettings();
      setSiteSettings(settings);
    } catch (err) {
      console.warn('Error refreshing settings:', err);
    }
  };

  useEffect(() => {
    Promise.all([refreshResources(), refreshSettings()]).finally(() => {
      setLoadingData(false);
    });
  }, []);

  // Dynamically update document title and CSS variables when siteSettings changes
  useEffect(() => {
    if (siteSettings.siteTitle) {
      document.title = `${siteSettings.siteTitle} — ${siteSettings.tagline || 'Technology, Knowledge, Solutions.'}`;
    }

    const root = document.documentElement;
    if (siteSettings.primaryColor) {
      root.style.setProperty('--color-primary', siteSettings.primaryColor);
    }
    if (siteSettings.secondaryColor) {
      root.style.setProperty('--color-secondary', siteSettings.secondaryColor);
    }
    if (siteSettings.accentColor) {
      root.style.setProperty('--color-accent', siteSettings.accentColor);
    }
  }, [siteSettings]);

  // Fetch bookmarks when user logs in
  useEffect(() => {
    if (user) {
      getUserBookmarks(user.uid).then((bList) => setBookmarks(bList));
    } else {
      setBookmarks([]);
    }
  }, [user]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async (resourceId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const isCurrentlyBookmarked = bookmarks.includes(resourceId);
    // Optimistic UI update
    setBookmarks((prev) =>
      isCurrentlyBookmarked ? prev.filter((id) => id !== resourceId) : [...prev, resourceId]
    );

    try {
      await toggleUserBookmark(user.uid, resourceId, isCurrentlyBookmarked);
    } catch (err) {
      console.error('Bookmark toggle error:', err);
      // Revert on error
      setBookmarks((prev) =>
        isCurrentlyBookmarked ? [...prev, resourceId] : prev.filter((id) => id !== resourceId)
      );
    }
  };

  // Route Rendering logic with protection guards
  const renderPage = () => {
    if (authLoading && loadingData) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading {siteSettings.siteTitle || 'NexusTech'}...</span>
          </div>
        </div>
      );
    }

    // Gating for protected member pages:
    if (['/dashboard', '/profile'].includes(currentPath)) {
      if (!user) {
        return <Login onNavigate={navigate} />;
      }
      if (!isVerified) {
        return <VerifyEmail onNavigate={navigate} emailParam={user.email || undefined} />;
      }
    }

    // Specific Route matching
    switch (currentPath) {
      case '/':
        return (
          <Home
            resources={resources}
            siteSettings={siteSettings}
            bookmarks={bookmarks}
            onBookmarkToggle={handleBookmarkToggle}
            onNavigate={navigate}
          />
        );
      case '/library':
        return (
          <ResourceLibrary
            resources={resources}
            bookmarks={bookmarks}
            onBookmarkToggle={handleBookmarkToggle}
            onNavigate={navigate}
            initialType={routeParams.type || 'all'}
            initialCategory={routeParams.category || 'all'}
          />
        );
      case '/solutions':
        return (
          <CategoryPage
            type="solution"
            resources={resources}
            bookmarks={bookmarks}
            onBookmarkToggle={handleBookmarkToggle}
            onNavigate={navigate}
          />
        );
      case '/manuals':
        return (
          <CategoryPage
            type="manual"
            resources={resources}
            bookmarks={bookmarks}
            onBookmarkToggle={handleBookmarkToggle}
            onNavigate={navigate}
          />
        );
      case '/troubleshooting':
        return (
          <CategoryPage
            type="guide"
            resources={resources}
            bookmarks={bookmarks}
            onBookmarkToggle={handleBookmarkToggle}
            onNavigate={navigate}
          />
        );
      case '/tutorials':
        return (
          <CategoryPage
            type="tutorial"
            resources={resources}
            bookmarks={bookmarks}
            onBookmarkToggle={handleBookmarkToggle}
            onNavigate={navigate}
          />
        );
      case '/services':
        return (
          <ServicesPage
            siteSettings={siteSettings}
            onNavigate={navigate}
          />
        );
      case '/resource':
        return (
          <ResourceDetails
            resourceId={routeParams.id || ''}
            resources={resources}
            bookmarks={bookmarks}
            onBookmarkToggle={handleBookmarkToggle}
            onNavigate={navigate}
          />
        );
      case '/about':
        return <AboutExpert onNavigate={navigate} siteSettings={siteSettings} />;
      case '/contact':
        return <Contact siteSettings={siteSettings} />;
      case '/register':
        return <Register onNavigate={navigate} />;
      case '/login':
        return <Login onNavigate={navigate} initialEmail={routeParams.email || ''} />;
      case '/verify-email':
        return <VerifyEmail onNavigate={navigate} emailParam={routeParams.email} />;
      case '/forgot-password':
        return <ForgotPassword onNavigate={navigate} />;
      case '/reset-password':
        return <ResetPassword onNavigate={navigate} />;
      case '/dashboard':
        return (
          <MemberDashboard
            resources={resources}
            bookmarks={bookmarks}
            onBookmarkToggle={handleBookmarkToggle}
            onNavigate={navigate}
          />
        );
      case '/profile':
        return <UserProfilePage onNavigate={navigate} />;
      case '/admin':
        return (
          <AdminDashboard
            resources={resources}
            siteSettings={siteSettings}
            onRefreshResources={refreshResources}
            onRefreshSettings={refreshSettings}
            onNavigate={navigate}
          />
        );
      case '/test-checklist':
        return <TestChecklist onNavigate={navigate} />;
      default:
        return <NotFound onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar currentPath={currentPath} onNavigate={navigate} siteSettings={siteSettings} />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={navigate} siteSettings={siteSettings} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
