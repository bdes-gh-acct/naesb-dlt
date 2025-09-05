export interface IOrganization {
  name: string;
  display_name: string;
  id: string;
  metadata: Record<string, string | number>;
  branding: {
    logo_url?: string;
    colors?: IOrganizationColors;
  };
}

export interface IOrganizationColors {
  primary: string;
  page_background: string;
}
