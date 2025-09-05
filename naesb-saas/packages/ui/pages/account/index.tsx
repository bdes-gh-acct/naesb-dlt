import * as React from 'react';
import {
  Card,
  Container,
  Divider,
  Typography,
  CardOverflow,
  Box,
} from '@mui/joy';
import Layout from '../../components/layouts';
import { useUserOrganization } from '../../service/organization';
import AccountModal from '../../components/accountModal/accountModal';
import DidModal from '../../components/accountModal/didModal';
import { ValueDisplay } from '../../components/shared/display/valueDisplay';
import { formatDate } from '../../components/shared/util';

export default function AccountDetails() {
  const { data } = useUserOrganization();

  // eslint-disable-next-line prefer-destructuring
  const businessId = data?.[0].businessId;
  const businessName = data?.[0].organization.name;
  const businessAddress = data?.[0].organization.address;
  // eslint-disable-next-line prefer-destructuring
  const jurisdiction = data?.[0].organization.jurisdiction;
  // eslint-disable-next-line prefer-destructuring
  const taxNumber = data?.[0].organization.taxNumber;
  // eslint-disable-next-line prefer-destructuring
  const taxNumberType = data?.[0].organization.taxNumberType;
  const website = data?.[0].organization.website;
  const companyType = data?.[0].organization.companyType;
  const created = data?.[0].organization.created;
  const updated = data?.[0].organization.updated;
  const did = data?.[0].organization.did;
  const verKey = data?.[0].organization.verKey;

  const createdDate = formatDate(created);

  const updatedDate = formatDate(updated);
  return (
    <Layout.Root>
      <Container maxWidth="sm">
        <Box textAlign="center" pr={1} py={2}>
          <Typography level="h3">{businessName}</Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 6,
              py: 2,
              px: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: '12px',
              }}
            >
              Created On: {createdDate}
            </Typography>
            <Divider orientation="vertical" />
            <Typography
              sx={{
                fontSize: '12px',
              }}
            >
              Last Updated: {updatedDate}
            </Typography>
          </Box>
        </Box>
        <Card>
          <CardOverflow>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              pr={1}
              py={2}
            >
              <Typography level="title-lg">Organziation Details</Typography>
              <AccountModal organization={data?.[0].organization} />
            </Box>
          </CardOverflow>
          <Divider />

          <Divider />
          <CardOverflow>
            <ValueDisplay label="Business ID" value={businessId} />
            <ValueDisplay label="Organization" value={businessName} />
            <ValueDisplay
              label="Organization Address"
              value={businessAddress}
            />
            <ValueDisplay label="Website" value={website} />
            <ValueDisplay label="Jurisdiction" value={jurisdiction} />
            <ValueDisplay label="Company Type" value={companyType} />
            <ValueDisplay label="Tax Number Type" value={taxNumberType} />
            <ValueDisplay label="Tax Number" value={taxNumber} />
          </CardOverflow>

          <Divider />
          <CardOverflow>
            <Box display="flex" justifyContent="space-between" pr={1} py={2}>
              <Box>
                <ValueDisplay label="DID" value={did} />
                <ValueDisplay label="VerKey" value={verKey} />
              </Box>
              <Box>
                <DidModal organization={data?.[0].organization} />
              </Box>
            </Box>
          </CardOverflow>
        </Card>
      </Container>
    </Layout.Root>
  );
}
