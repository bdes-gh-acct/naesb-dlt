import { withOrganizationPage } from '../OrganizationPage';
import { Branding } from './branding';

export const OrganizationBranding = () => {
  const BrandingWithPage = withOrganizationPage(Branding);

  return <BrandingWithPage />;
};
