/* eslint-disable @typescript-eslint/naming-convention */
import { useAuth0 } from '@auth0/auth0-react';
import { get } from 'lodash';

export const useOrgMsp = () => {
  const { user } = useAuth0();
  const mspId = get(user, 'https://naesbdlt.org/org_msp');
  const org_name = get(user, 'https://naesbdlt.org/org_name');
  return { mspId, org_name };
};
