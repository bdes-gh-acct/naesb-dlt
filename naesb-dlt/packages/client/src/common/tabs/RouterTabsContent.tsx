/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/ban-types */
import React, { useEffect, useState, FC } from 'react';
import { TabsProps } from '@mui/material';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import { TabLinkProps } from './Tablink';

export interface RouterTabsContentProps extends TabsProps {
  tabs: Array<
    Omit<TabLinkProps, 'to' | 'component'> & {
      route: string;
      component?: React.ReactNode;
    }
  >;
}

const createRoute = (url: string, route: string) =>
  url === '/' ? route : `${url}${route}`;

export const RouterTabsContent: FC<RouterTabsContentProps> = ({ tabs }) => {
  const routeMatch = useRouteMatch();
  const [routes, setroutes] = useState(
    tabs.map(({ route }) => {
      return routeMatch.url === route
        ? route
        : createRoute(routeMatch.url, route);
    }),
  );

  useEffect(() => {
    setroutes(tabs.map(({ route }) => createRoute(routeMatch.url, route)));
  }, [tabs, routeMatch]);

  return (
    <>
      <Switch>
        {tabs.map(({ component, route }) => (
          <Route
            key={route}
            path={
              routeMatch.path === route
                ? route
                : createRoute(routeMatch.path, route)
            }
          >
            {component}
          </Route>
        ))}
        <Redirect to={routes[0]} />
      </Switch>
    </>
  );
};
