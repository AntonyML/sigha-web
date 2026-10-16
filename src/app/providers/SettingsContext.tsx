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

function organizationAppName(organization: ActiveOrganization): string {
  return organization.brandingOverrides?.displayName ?? organization.name;
}

function organizationLogoUrl(organization: ActiveOrganization): string {
  return organization.brandingOverrides?.logoUrl ?? organization.logoUrl ?? '';
}

interface SettingsContextType {
  general: AppSettings;
  interface: InterfaceSettings;
  loaded: boolean;
  organizations: OrganizationSummary[];
  activeOrganization: ActiveOrganization | null;
  selectionRequired: boolean;
  switchOrganization: (organizationId: number) => Promise<ActiveOrganization>;
  updateActiveOrganization: (organization: ActiveOrganization) => void;
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
  const [globalBrandColor, setGlobalBrandColor] = useState(INTERFACE_DEFAULTS.brandColor);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<ActiveOrganization | null>(null);
  const [selectionRequired, setSelectionRequired] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetch = useCallback(() => {
    let cancelled = false;

    const resetToDefaults = () => {
      setGeneral(GENERAL_DEFAULTS);
      setInterfaceSettings(INTERFACE_DEFAULTS);
      setGlobalBrandColor(INTERFACE_DEFAULTS.brandColor);
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
          appName: organizationAppName(active),
          logoUrl: organizationLogoUrl(active),
          timezone: generalData?.timezone || GENERAL_DEFAULTS.timezone,
        });
        document.title = organizationAppName(active);

        const globalBrandColor = interfaceData?.brandColor ?? INTERFACE_DEFAULTS.brandColor;
        setGlobalBrandColor(globalBrandColor);

        const iface: InterfaceSettings = {
          theme: interfaceData?.theme || INTERFACE_DEFAULTS.theme,
          density: interfaceData?.density || INTERFACE_DEFAULTS.density,
          typography: interfaceData?.typography || INTERFACE_DEFAULTS.typography,
          brandColor: active.brandingOverrides?.primaryColor ?? globalBrandColor,
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
    let active = true;
    let cleanup: (() => void) | undefined;
    void Promise.resolve().then(() => {
      if (!active) return;
      const maybeCleanup = (() => {
    // Only fetch on mount if we have valid auth (token + user)
    // The authTokenChanged event will trigger fetch after login
    if (hasToken()) {
      fetch();
    }
    window.addEventListener('authTokenChanged', fetch);
    return () => window.removeEventListener('authTokenChanged', fetch);

      })();
      if (typeof maybeCleanup === "function") cleanup = maybeCleanup;
    });
    return () => {
      active = false;
      cleanup?.();
    };
  }, [fetch]);

  const switchOrganization = useCallback(async (organizationId: number) => {
    const response = await authService.switchActiveOrganization(organizationId);
    const organization = response.activeOrganization;
    const appName = organizationAppName(organization);
    setOrganizations(response.organizations);
    setActiveOrganization(organization);
    setSelectionRequired(false);
    setGeneral((current) => ({
      ...current,
      appName,
      logoUrl: organizationLogoUrl(organization),
    }));
    document.title = appName;
    const nextInterfaceSettings = {
      ...interfaceSettings,
      brandColor: organization.brandingOverrides?.primaryColor ?? globalBrandColor,
    };
    setInterfaceSettings(nextInterfaceSettings);
    applyInterfaceSettings(nextInterfaceSettings);
    return organization;
  }, [globalBrandColor, interfaceSettings]);

  const updateActiveOrganization = useCallback((organization: ActiveOrganization) => {
    const currentActive = activeOrganization?.id === organization.id ? activeOrganization : null;
    const nextOrganization: ActiveOrganization = {
      ...currentActive,
      ...organization,
      brandingOverrides: organization.brandingOverrides === undefined
        ? currentActive?.brandingOverrides ?? null
        : organization.brandingOverrides,
    };
    const appName = organizationAppName(nextOrganization);
    setActiveOrganization(nextOrganization);
    setOrganizations((current) => current.map((item) => (
      item.id === nextOrganization.id ? { ...item, ...nextOrganization } : item
    )));
    setGeneral((current) => ({
      ...current,
      appName,
      logoUrl: organizationLogoUrl(nextOrganization),
    }));
    document.title = appName;
    const nextInterfaceSettings = {
      ...interfaceSettings,
      brandColor: nextOrganization.brandingOverrides?.primaryColor ?? globalBrandColor,
    };
    setInterfaceSettings(nextInterfaceSettings);
    applyInterfaceSettings(nextInterfaceSettings);
  }, [activeOrganization, globalBrandColor, interfaceSettings]);

  const updateGeneral = useCallback((s: AppSettings) => {
    const next = {
      ...s,
      appName: activeOrganization ? organizationAppName(activeOrganization) : s.appName,
      logoUrl: activeOrganization ? organizationLogoUrl(activeOrganization) : '',
    };
    setGeneral(next);
    document.title = next.appName;
  }, [activeOrganization]);

  const updateInterface = useCallback((s: InterfaceSettings) => {
    const nextGlobalBrandColor = s.brandColor ?? INTERFACE_DEFAULTS.brandColor;
    setGlobalBrandColor(nextGlobalBrandColor);
    const next = {
      ...s,
      brandColor: activeOrganization?.brandingOverrides?.primaryColor ?? nextGlobalBrandColor,
    };
    setInterfaceSettings(next);
    applyInterfaceSettings(next);
  }, [activeOrganization]);

  return (
    <SettingsContext.Provider value={{
      general,
      interface: interfaceSettings,
      loaded,
      organizations,
      activeOrganization,
      selectionRequired,
      switchOrganization,
      updateActiveOrganization,
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
    updateActiveOrganization: ctx?.updateActiveOrganization ?? (() => {}),
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
