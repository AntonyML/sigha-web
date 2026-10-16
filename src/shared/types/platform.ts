/**
 * SaaS platform-plane types. Mirrors the API contract exposed by
 * `GET/POST/PATCH /platform/organizations` (sigha-api).
 */

export const PLATFORM_ROLES = ['PLATFORM_OWNER', 'PLATFORM_SUPPORT'] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const PLAN_TIERS = ['BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const ORGANIZATION_STATUSES = ['ACTIVE', 'SUSPENDED', 'ARCHIVED'] as const;
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];

export interface PlatformBrandingOverrides {
  displayName?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface PlatformOrganization {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  status: OrganizationStatus;
  planTier: PlanTier;
  isActive: boolean;
  brandingOverrides: PlatformBrandingOverrides | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlatformOrganizationPayload {
  name: string;
  slug?: string;
  planTier?: PlanTier;
}

export interface UpdatePlatformOrganizationPayload {
  name?: string;
  status?: OrganizationStatus;
  planTier?: PlanTier;
  isActive?: boolean;
  brandingOverrides?: PlatformBrandingOverrides;
}

export interface PlatformStepUpResponse {
  accessToken: string;
  expiresAt: string;
}
