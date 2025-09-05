import {
  Box,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { IDrawerHeaders, IDrawerNavItem } from '@naesb/dlt-model';
import { useState } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link, useRouteMatch } from 'react-router-dom';

interface IMultiLevel {
  navItem?: IDrawerHeaders;
  selectItem?: (navItem: IDrawerNavItem) => void;
  startOpen: boolean;
}

export interface ChildLevelProps {
  route: string;
  label: string;
}

const ChildLevel = ({ route, label }: ChildLevelProps) => {
  const match = useRouteMatch(route);
  return (
    <ListItem
      component={Link}
      to={route}
      sx={{
        paddingY: 0,
        paddingLeft: '36px',
        minHeight: 50,
      }}
    >
      <Box
        sx={{
          borderRadius: 2,
          paddingY: 1.5,
          paddingX: 2,
          width: '100%',
          ...(match
            ? {
                backgroundColor: 'rgba(144, 202, 249, 0.08)',
                fontSize: '16px',
                color: 'text.primary',
              }
            : {
                fontSize: '16px',
                color: 'text.secondary',
              }),
        }}
      >
        {label}
      </Box>
    </ListItem>
  );
};

// use when menu items have children
export const MultiLevel: React.FC<IMultiLevel> = ({ navItem, startOpen }) => {
  const [open, setOpen] = useState(startOpen);
  const handleClick = () => setOpen(!open);

  return (
    <List sx={{ padding: 0 }}>
      <ListItem
        button
        onClick={() => handleClick()}
        sx={{
          width: '100%',
          fontFamily: 'Goldman, Roboto, sans-serif',
          fontSize: '16px',
          lineHeight: 1.3,
          letterSpacing: '0.05em',
          paddingTop: 0,
          // @ts-ignore
          height: '50px',
          paddingBottom: 0,
          paddingRight: 0,
        }}
      >
        <ListItemText>{navItem?.label}</ListItemText>
        <ListItemIcon>
          {open ? (
            <KeyboardArrowUpIcon
              sx={{
                color: '#fff',
                height: '24px',
                width: '32px',
                marginLeft: '10px',
              }}
            />
          ) : (
            <KeyboardArrowDownIcon
              sx={{
                color: '#fff',
                height: '24px',
                width: '32px',
                marginLeft: '10px',
              }}
            />
          )}
        </ListItemIcon>
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          {navItem?.subMenu?.map((child) => (
            <ChildLevel
              route={child.route}
              label={child.label}
              key={`${child.route}${child.label})`}
            />
          ))}
        </List>
      </Collapse>
    </List>
  );
};
