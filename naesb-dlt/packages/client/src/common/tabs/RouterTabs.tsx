/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/ban-types */
import { useEffect, useState, FC, ChangeEvent } from 'react';
import { Tabs, TabsProps } from '@mui/material';
import { useRouteMatch, useHistory } from 'react-router-dom';
import TabLink, { TabLinkProps } from './Tablink';
import { useRouterTabs } from './useRouterTabs';

export interface RouterTabsProps extends TabsProps {
  tabs: Array<
    Omit<TabLinkProps, 'to' | 'component'> & {
      route: string;
      component?: React.ReactNode;
    }
  >;
}

const createRoute = (url: string, route: string) =>
  url === '/' ? route : `${url}${route}`;

export const RouterTabs: FC<RouterTabsProps> = ({ tabs, ...props }) => {
  const history = useHistory();
  const routeMatch = useRouteMatch();
  const [routes, setroutes] = useState(
    tabs.map(({ route }) => {
      return routeMatch.url === route
        ? route
        : createRoute(routeMatch.url, route);
    }),
  );
  const value = useRouterTabs(routes);
  useEffect(() => {
    setroutes(tabs.map(({ route }) => createRoute(routeMatch.url, route)));
  }, [tabs, routeMatch]);

  const handleChange = (event: ChangeEvent<{}>, newValue: any) => {
    event.preventDefault();
    history.push(newValue);
  };

  return (
    <>
      <Tabs value={value} onChange={handleChange} {...props}>
        {tabs.map((tab: any) => (
          <TabLink
            icon={tab.icon ? tab.icon : null}
            value={createRoute(routeMatch.url, tab.route)}
            label={tab.label}
            key={tab.value || tab.label}
          />
        ))}
      </Tabs>
    </>
  );
};
