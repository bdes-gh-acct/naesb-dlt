import { Details } from './details';
import { withOrganizationPage } from '../OrganizationPage';

export const OrganizationDetails = () => {
  const DetailsWithPage = withOrganizationPage(Details);

  return <DetailsWithPage />;
};
