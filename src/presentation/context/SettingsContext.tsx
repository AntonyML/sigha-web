import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { settingsService } from '../../services/settingsService';
import { hexToHsl } from '../../utils/colorUtils';

export interface AppSettings {
  appName: string;
  logoUrl: string;
  timezone: string;
}

export interface InterfaceSettings {
  theme: string;
  density: string;
  typography: string;
  brandColor: string;
}

const GENERAL_DEFAULTS: AppSettings = {
  appName: 'ASOPOGUA',
  logoUrl: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const INTERFACE_DEFAULTS: InterfaceSettings = {
  theme: 'light',
  density: 'comfortable',
  typography: 'system-ui, -apple-system, sans-serif',
  brandColor: '#2563eb',
};

interface SettingsContextType {
  general: AppSettings;
  interface: InterfaceSettings;
  loaded: boolean;
  updateGeneral: (s: AppSettings) => void;
  updateInterface: (s: InterfaceSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function hasToken(): boolean {
  return !!localStorage.getItem('authToken');
}

function applyInterfaceSettings(s: InterfaceSettings): void {
  const root = document.documentElement;

  /* Theme */
  if (s.theme === 'dark') {
    root.classList.add('dark');
  } else if (s.theme === 'light') {
    root.classList.remove('dark');
  } else {
    /* 'system' — match OS preference */
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    root.classList.toggle('dark', mq.matches);
  }

  /* Brand color (HEX → HSL) */
  if (s.brandColor) {
    root.style.setProperty('--primary', hexToHsl(s.brandColor));
  }

  /* Typography */
  root.style.setProperty('--font-family', s.typography);

  /* Density */
  root.dataset.density = s.density;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [general, setGeneral] = useState<AppSettings>(GENERAL_DEFAULTS);
  const [interfaceSettings, setInterfaceSettings] = useState<InterfaceSettings>(INTERFACE_DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  const fetch = useCallback(() => {
    let cancelled = false;
    if (!hasToken()) {
      setLoaded(true);
      document.title = GENERAL_DEFAULTS.appName;
      applyInterfaceSettings(INTERFACE_DEFAULTS);
      return;
    }

    Promise.all([
      settingsService.getGeneralSettings().catch(() => null),
      settingsService.getInterfaceSettings().catch(() => null),
    ]).then(([generalData, interfaceData]) => {
      if (cancelled) return;

      if (generalData) {
        setGeneral({
          appName: generalData.appName || GENERAL_DEFAULTS.appName,
          logoUrl: generalData.logoUrl || '',
          timezone: generalData.timezone || GENERAL_DEFAULTS.timezone,
        });
        document.title = generalData.appName || GENERAL_DEFAULTS.appName;
      } else {
        setGeneral(GENERAL_DEFAULTS);
        document.title = GENERAL_DEFAULTS.appName;
      }

      const iface: InterfaceSettings = {
        theme: interfaceData?.theme || INTERFACE_DEFAULTS.theme,
        density: interfaceData?.density || INTERFACE_DEFAULTS.density,
        typography: interfaceData?.typography || INTERFACE_DEFAULTS.typography,
        brandColor: interfaceData?.brandColor || INTERFACE_DEFAULTS.brandColor,
      };
      setInterfaceSettings(iface);
      applyInterfaceSettings(iface);

      setLoaded(true);
    }).catch(() => {
      if (cancelled) return;
      setGeneral(GENERAL_DEFAULTS);
      setInterfaceSettings(INTERFACE_DEFAULTS);
      applyInterfaceSettings(INTERFACE_DEFAULTS);
      document.title = GENERAL_DEFAULTS.appName;
      setLoaded(true);
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    fetch();
    window.addEventListener('authTokenChanged', fetch);
    return () => window.removeEventListener('authTokenChanged', fetch);
  }, [fetch]);

  const updateGeneral = useCallback((s: AppSettings) => {
    setGeneral(s);
    document.title = s.appName;
  }, []);

  const updateInterface = useCallback((s: InterfaceSettings) => {
    setInterfaceSettings(s);
    applyInterfaceSettings(s);
  }, []);

  return (
    <SettingsContext.Provider value={{ general, interface: interfaceSettings, loaded, updateGeneral, updateInterface }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) return GENERAL_DEFAULTS;
  return ctx.general;
}

export function useInterfaceSettings(): InterfaceSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) return INTERFACE_DEFAULTS;
  return ctx.interface;
}

export function useInterfaceSettingsUpdate(): (s: InterfaceSettings) => void {
  const ctx = useContext(SettingsContext);
  return ctx?.updateInterface ?? (() => {});
}

export function useGeneralSettingsUpdate(): (s: AppSettings) => void {
  const ctx = useContext(SettingsContext);
  return ctx?.updateGeneral ?? (() => {});
}
