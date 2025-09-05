import { FC } from 'react';
import { TabList, Tabs, TabsProps } from '@mui/joy';
import { useMatch } from '@tanstack/router';
import TabLink, { RouterTabProps } from './Tab';
import { useRouterTabs } from './hook/useRouterTabs';

export interface RouteTabProps
  extends Omit<RouterTabProps, 'to' | 'component'> {
  path: RouterTabProps['to'];
}

export interface RouterTabsProps extends TabsProps {
  tabs: Array<RouteTabProps>;
}

export const RouterTabs: FC<RouterTabsProps> = ({ tabs, ...props }) => {
  const {
    route: { fullPath },
    router,
  } = useMatch();
  const value = useRouterTabs(tabs.map((tab) => tab.path));
  return (
    <Tabs value={value} {...props}>
      <TabList variant="plain">
        {tabs.map((tab) => (
          <TabLink
            disabled={tab.disabled}
            value={tab.path}
            to={router.resolvePath(fullPath, tab.path as string)}
            label={tab.label}
            key={tab.path}
          />
        ))}
      </TabList>
    </Tabs>
  );
};
