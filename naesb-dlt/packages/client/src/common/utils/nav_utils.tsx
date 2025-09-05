import { IDrawerHeaders, IDrawerNavItem } from '@naesb/dlt-model';

export const navbarItems: IDrawerNavItem[] = [
  { label: 'CHANNELS', route: '/channels', active: false },
  { label: 'TRADES', route: '/trades', active: false },
  { label: 'DELIVERIES', route: '/deliveries', active: false },
  { label: 'LEDGER', route: '/ledger', active: false },
  { label: 'ORGANIZATION', route: '/organization', active: false },
];

export const sidebarItems: IDrawerHeaders[] = [
  {
    label: 'CHANNELS',
    active: false,
    subMenu: [
      {
        label: 'All Channels',
        route: '/channels',
        active: false,
      },
    ],
  },
  {
    label: 'TRADES',
    active: false,
    subMenu: [
      {
        label: 'All Trades',
        route: '/trades',
        active: false,
      },
    ],
  },
  {
    label: 'DELIVERIES',
    active: false,
    subMenu: [
      {
        label: 'All Deliveries',
        route: '/deliveries',
        active: false,
      },
    ],
  },
  {
    label: 'LEDGER',
    active: false,
    subMenu: [
      {
        label: 'Blocks',
        route: '/ledger/blocks',
        active: false,
      },
      {
        label: 'Transactions',
        route: '/ledger/transactions',
        active: false,
      },
    ],
  },
  {
    label: 'ORGANIZATION',
    active: false,
    subMenu: [
      {
        label: 'Details',
        route: '/organization/details',
        active: false,
      },
      {
        label: 'Branding',
        route: '/organization/branding',
        active: false,
      },
      {
        label: 'Users',
        route: '/organization/users',
        active: false,
      },
    ],
  },
];
