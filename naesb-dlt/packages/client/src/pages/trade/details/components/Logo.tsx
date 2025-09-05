import { Avatar, Skeleton, useTheme } from '@mui/material';
import { useOrganization, useOrganizations } from '@query/organization';
import { ITradeViewModel } from '@naesb/dlt-model';
import { FC, useMemo } from 'react';

export interface LogoProps {
  trade?: ITradeViewModel;
}

export const Logo: FC<LogoProps> = ({ trade }) => {
  const { data: organizations } = useOrganizations();
  const { data: organization } = useOrganization();
  const theme = useTheme();
  const logo = useMemo(() => {
    if (!trade || !organizations) return undefined;
    const org =
      organization?.metadata?.msp_id === trade.BuyerParty
        ? trade.SellerParty
        : trade.BuyerParty;
    return organizations.find((orgItem) => orgItem.metadata.msp_id === org)
      ?.branding?.logo_url;
  }, [organizations, organization, trade]);
  return logo ? (
    <Avatar
      sx={{ width: theme.spacing(12), height: theme.spacing(12) }}
      src={logo}
    />
  ) : (
    <Skeleton variant="circular">
      <Avatar sx={{ width: theme.spacing(12), height: theme.spacing(12) }} />
    </Skeleton>
  );
};
