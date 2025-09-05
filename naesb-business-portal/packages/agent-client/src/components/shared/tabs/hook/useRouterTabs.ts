import { LinkOptions, useMatch } from '@tanstack/router';

export const useRouterTabs = (
  routes: Array<LinkOptions['to']>,
  defaultRoute?: string,
): string => {
  const {
    router,
    route: { fullPath },
  } = useMatch();
  const firstMatch = routes.find((route) =>
    // @ts-ignore
    Boolean(router.matchRoute({ to: router.resolvePath(fullPath, route) })),
  );
  return firstMatch || defaultRoute || (routes[0] as string);
};
