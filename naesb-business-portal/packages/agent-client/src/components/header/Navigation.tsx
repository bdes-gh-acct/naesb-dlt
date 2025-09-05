import * as React from 'react';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListSubheader from '@mui/joy/ListSubheader';
import ListItem from '@mui/joy/ListItem';

// Icons import
import BusinessesIcon from '@mui/icons-material/Business';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SchemaIcon from '@mui/icons-material/SchemaOutlined';
import CredentialDefinitionIcon from '@mui/icons-material/BadgeOutlined';
import CredentialIcon from '@mui/icons-material/EmojiEventsOutlined';
import WellIcon from '@mui/icons-material/MyLocationOutlined';
import AreaIcon from '@mui/icons-material/MapOutlined';
import ShippingIcon from '@mui/icons-material/AirlineStopsOutlined';
import TradeIcon from '@mui/icons-material/CompareArrows';

import { SidebarButton } from 'components/shared/header/SidebarButton';
import { useOrgMsp } from 'utils/auth';
import { useBusiness } from 'query/directory';

const Navigation = () => {
  const { mspId } = useOrgMsp();
  const { data: directory } = useBusiness(mspId);
  return (
    <List size="sm" sx={{ '--List-item-radius': '8px' }}>
      <ListItem nested>
        <ListSubheader>
          Directory
          <IconButton
            size="sm"
            variant="plain"
            color="primary"
            sx={{ '--IconButton-size': '24px', ml: 'auto' }}
          >
            <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
          </IconButton>
        </ListSubheader>
        <List
          aria-labelledby="nav-list-browse"
          sx={{
            '& .JoyListItemButton-root': { p: '8px' },
          }}
        >
          <SidebarButton
            icon={<BusinessesIcon fontSize="small" />}
            to="/Businesses"
            label="Companies"
          />
        </List>
      </ListItem>
      {directory &&
      directory?.roles?.find((item) => [1, 2].includes(item.businessRoleId)) ? (
        <ListItem nested sx={{ mt: 2 }}>
          <ListSubheader>
            Trading
            <IconButton
              size="sm"
              variant="plain"
              color="primary"
              sx={{ '--IconButton-size': '24px', ml: 'auto' }}
            >
              <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
            </IconButton>
          </ListSubheader>
          <List
            aria-labelledby="nav-list-browse"
            sx={{
              '& .JoyListItemButton-root': { p: '8px' },
            }}
          >
            <SidebarButton
              icon={<TradeIcon fontSize="small" />}
              to="/Trades"
              label="Trades"
            />
            <SidebarButton
              icon={<ShippingIcon fontSize="small" />}
              to="/Deliveries"
              label="Deliveries"
            />
          </List>
        </ListItem>
      ) : undefined}
      <ListItem nested sx={{ mt: 2 }}>
        <ListSubheader>
          Infrastructure
          <IconButton
            size="sm"
            variant="plain"
            color="primary"
            sx={{ '--IconButton-size': '24px', ml: 'auto' }}
          >
            <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
          </IconButton>
        </ListSubheader>
        <List
          aria-labelledby="nav-list-tags"
          size="sm"
          sx={{
            '--List-decorator-size': '32px',
            '& .JoyListItemButton-root': { p: '8px' },
          }}
        >
          <SidebarButton
            icon={<WellIcon fontSize="small" />}
            to="/infrastructure/wells"
            label="Wells"
          />
          <SidebarButton
            icon={<AreaIcon fontSize="small" />}
            to="/infrastructure/fields"
            label="Fields"
          />
          <SidebarButton
            icon={<CredentialIcon fontSize="small" />}
            to="/infrastructure/certificates"
            label="Certificates"
          />
        </List>
      </ListItem>
      {directory &&
      directory?.roles?.find((item) => [1, 4].includes(item.businessRoleId)) ? (
        <ListItem nested sx={{ mt: 2 }}>
          <ListSubheader>
            Certifier
            <IconButton
              size="sm"
              variant="plain"
              color="primary"
              sx={{ '--IconButton-size': '24px', ml: 'auto' }}
            >
              <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
            </IconButton>
          </ListSubheader>
          <List
            aria-labelledby="nav-list-tags"
            size="sm"
            sx={{
              '--List-decorator-size': '32px',
              '& .JoyListItemButton-root': { p: '8px' },
            }}
          >
            <SidebarButton
              icon={<SchemaIcon fontSize="small" />}
              to="/issuer/schemas"
              label="NAESB Standard"
            />
            <SidebarButton
              icon={<CredentialDefinitionIcon fontSize="small" />}
              to="/issuer/credential-definitions"
              label="Certifier Definitions"
            />
            <SidebarButton
              icon={<CredentialIcon fontSize="small" />}
              to="/issuer/credentials"
              label="Issued Certificates"
            />
          </List>
        </ListItem>
      ) : undefined}
    </List>
  );
};

export default Navigation;
