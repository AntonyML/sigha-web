export interface OrganizationSummary {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  isPrimary: boolean;
}

export interface ActiveOrganization {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface ActiveOrganizationResponse {
  accessToken: string;
  refreshToken?: string;
  activeOrganization: ActiveOrganization;
  organizations: OrganizationSummary[];
}
