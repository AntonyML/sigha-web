import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authService } from '@/infrastructure/api/services/authService';
import { settingsService } from '@/infrastructure/api/services/settingsService';
import { hexToHsl } from '@/shared/lib/colorUtils';
import type { ActiveOrganization, OrganizationSummary } from '@/shared/types/organization';

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
  appName: 'SIGHA',
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
  organizations: OrganizationSummary[];
  activeOrganization: ActiveOrganization | null;
  selectionRequired: boolean;
  switchOrganization: (organizationId: number) => Promise<ActiveOrganization>;
  updateGeneral: (s: AppSettings) => void;
  updateInterface: (s: InterfaceSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function hasToken(): boolean {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
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
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<ActiveOrganization | null>(null);
  const [selectionRequired, setSelectionRequired] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetch = useCallback(() => {
    let cancelled = false;

    const resetToDefaults = () => {
      setGeneral(GENERAL_DEFAULTS);
      setInterfaceSettings(INTERFACE_DEFAULTS);
      applyInterfaceSettings(INTERFACE_DEFAULTS);
      document.title = GENERAL_DEFAULTS.appName;
    };

    if (!hasToken()) {
      setOrganizations([]);
      setActiveOrganization(null);
      setSelectionRequired(false);
      resetToDefaults();
      setLoaded(true);
      return () => { cancelled = true; };
    }

    setLoaded(false);

    const load = async () => {
      if (authService.hasPendingOrganizationSelection()) {
        setOrganizations([]);
        setActiveOrganization(null);
        setSelectionRequired(true);
        resetToDefaults();
        setLoaded(true);
        return;
      }

      try {
        const orgs = await authService.getOrganizations();
        if (cancelled) return;
        setOrganizations(orgs);

        const activeId = authService.getActiveOrganizationId();
        const active = orgs.find((org) => org.id === activeId);
        if (!active) {
          setActiveOrganization(null);
          setSelectionRequired(true);
          resetToDefaults();
          setLoaded(true);
          return;
        }

        setActiveOrganization(active);
        setSelectionRequired(false);

        const [generalData, interfaceData] = await Promise.all([
          settingsService.getGeneralSettings().catch(() => null),
          settingsService.getInterfaceSettings().catch(() => null),
        ]);
        if (cancelled) return;

        setGeneral({
          appName: active.name,
          logoUrl: active.logoUrl || generalData?.logoUrl || '',
          timezone: generalData?.timezone || GENERAL_DEFAULTS.timezone,
        });
        document.title = active.name;

        const iface: InterfaceSettings = {
          theme: interfaceData?.theme || INTERFACE_DEFAULTS.theme,
          density: interfaceData?.density || INTERFACE_DEFAULTS.density,
          typography: interfaceData?.typography || INTERFACE_DEFAULTS.typography,
          brandColor: interfaceData?.brandColor || INTERFACE_DEFAULTS.brandColor,
        };
        setInterfaceSettings(iface);
        applyInterfaceSettings(iface);
        setLoaded(true);
      } catch {
        if (cancelled) return;
        setOrganizations([]);
        setActiveOrganization(null);
        setSelectionRequired(true);
        resetToDefaults();
        setLoaded(true);
      }
    };

    void load();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // Only fetch on mount if we have valid auth (token + user)
    // The authTokenChanged event will trigger fetch after login
    if (hasToken()) {
      fetch();
    }
    window.addEventListener('authTokenChanged', fetch);
    return () => window.removeEventListener('authTokenChanged', fetch);
  }, [fetch]);

  const switchOrganization = useCallback(async (organizationId: number) => {
    const response = await authService.switchActiveOrganization(organizationId);
    const organization = response.activeOrganization;
    setOrganizations(response.organizations);
    setActiveOrganization(organization);
    setSelectionRequired(false);
    setGeneral((current) => ({
      ...current,
      appName: organization.name,
      logoUrl: organization.logoUrl || current.logoUrl,
    }));
    document.title = organization.name;
    return organization;
  }, []);

  const updateGeneral = useCallback((s: AppSettings) => {
    const next = { ...s, appName: activeOrganization?.name ?? s.appName };
    setGeneral(next);
    document.title = next.appName;
  }, [activeOrganization]);

  const updateInterface = useCallback((s: InterfaceSettings) => {
    setInterfaceSettings(s);
    applyInterfaceSettings(s);
  }, []);

  return (
    <SettingsContext.Provider value={{
      general,
      interface: interfaceSettings,
      loaded,
      organizations,
      activeOrganization,
      selectionRequired,
      switchOrganization,
      updateGeneral,
      updateInterface,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) return GENERAL_DEFAULTS;
  return ctx.general;
}

export function useOrganizationSettings() {
  const ctx = useContext(SettingsContext);
  return {
    organizations: ctx?.organizations ?? [],
    activeOrganization: ctx?.activeOrganization ?? null,
    selectionRequired: ctx?.selectionRequired ?? false,
    loaded: ctx?.loaded ?? true,
    switchOrganization: ctx?.switchOrganization ?? (async () => {
      throw new Error('SettingsProvider no está disponible');
    }),
  };
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
