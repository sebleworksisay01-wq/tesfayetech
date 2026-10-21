import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SiteSettings } from '../types';
import { getSiteSettings, saveSiteSettings, DEFAULT_SETTINGS } from '../services/resourceService';
import { useAuth } from './AuthContext';

interface SiteSettingsContextType {
  siteSettings: SiteSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<{ success: boolean; message: string }>;
  reloadSettings: () => Promise<void>;
  resetToDefaults: () => Promise<{ success: boolean; message: string }>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const reloadSettings = useCallback(async () => {
    try {
      const fetched = await getSiteSettings();
      setSiteSettings(fetched);
    } catch (err) {
      console.warn('Using default settings fallback:', err);
      setSiteSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  // Dynamically synchronize document title, meta description, and CSS variables
  useEffect(() => {
    if (siteSettings.siteTitle) {
      document.title = `${siteSettings.siteTitle} — ${siteSettings.tagline || 'Technology, Knowledge, Solutions.'}`;
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && siteSettings.seoDescription) {
      metaDesc.setAttribute('content', siteSettings.seoDescription);
    }

    // Apply dynamic theme colors to root document style
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

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<{ success: boolean; message: string }> => {
    try {
      const merged = { ...siteSettings, ...newSettings };
      setSiteSettings(merged); // Optimistic UI update

      if (user) {
        await saveSiteSettings(newSettings, user.uid, user.email || 'admin');
      }
      return { success: true, message: 'Settings saved and applied across platform.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings.';
      return { success: false, message: msg };
    }
  };

  const resetToDefaults = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setSiteSettings(DEFAULT_SETTINGS);
      if (user) {
        await saveSiteSettings(DEFAULT_SETTINGS, user.uid, user.email || 'admin');
      }
      return { success: true, message: 'Platform settings reset to default NexusTech configuration.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset settings.';
      return { success: false, message: msg };
    }
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        siteSettings,
        loading,
        updateSettings,
        reloadSettings,
        resetToDefaults,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
