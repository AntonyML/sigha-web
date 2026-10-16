import type { OrganizationStatus, PlanTier, PlatformBrandingOverrides } from './platform';

export interface OrganizationSummary {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  isPrimary: boolean;
  status?: OrganizationStatus;
  planTier?: PlanTier;
  brandingOverrides?: PlatformBrandingOverrides | null;
}

export interface ActiveOrganization {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  status?: OrganizationStatus;
  planTier?: PlanTier;
  brandingOverrides?: PlatformBrandingOverrides | null;
}

export interface ActiveOrganizationResponse {
  accessToken: string;
  refreshToken?: string;
  activeOrganization: ActiveOrganization;
  organizations: OrganizationSummary[];
}
