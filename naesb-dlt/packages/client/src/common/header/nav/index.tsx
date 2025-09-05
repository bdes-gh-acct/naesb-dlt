import { RouterTabs, RouterTabsProps } from '@common/tabs';

const tabs: RouterTabsProps['tabs'] = [
  {
    value: 1,
    route: '/channels',
    label: 'Trade Channels',
  },
];

export const Nav = () => {
  return <RouterTabs tabs={tabs} />;
};
