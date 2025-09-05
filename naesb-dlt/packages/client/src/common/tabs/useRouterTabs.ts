import { useRouteMatch } from 'react-router-dom';

export const useRouterTabs = (
  routes: string[],
  defaultRoute?: string,
): string => {
  const match = useRouteMatch(routes);
  return match?.url || defaultRoute || routes[0];
};
