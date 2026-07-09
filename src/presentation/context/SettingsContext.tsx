import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { settingsService } from '../../services/settingsService';

export interface AppSettings {
  appName: string;
  logoUrl: string;
  timezone: string;
}

const DEFAULTS: AppSettings = {
  appName: 'ASOPOGUA',
  logoUrl: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

interface SettingsContextType {
  settings: AppSettings;
  loaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function hasToken(): boolean {
  return !!localStorage.getItem('authToken');
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  const fetch = useCallback(() => {
    let cancelled = false;
    if (!hasToken()) {
      setLoaded(true);
      document.title = DEFAULTS.appName;
      return;
    }
    settingsService
      .getGeneralSettings()
      .then((s) => {
        if (cancelled) return;
        setSettings({
          appName: s.appName || DEFAULTS.appName,
          logoUrl: s.logoUrl || '',
          timezone: s.timezone || DEFAULTS.timezone,
        });
        setLoaded(true);
        document.title = s.appName || DEFAULTS.appName;
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
        document.title = DEFAULTS.appName;
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    fetch();
    window.addEventListener('authTokenChanged', fetch);
    return () => window.removeEventListener('authTokenChanged', fetch);
  }, [fetch]);

  return (
    <SettingsContext.Provider value={{ settings, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) return DEFAULTS;
  return ctx.settings;
}