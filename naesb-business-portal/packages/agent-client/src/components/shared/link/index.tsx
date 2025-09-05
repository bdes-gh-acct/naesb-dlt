import {
  LinkOptions,
  Link as RouterLink,
  RegisteredRoutesInfo,
  AnyRoutesInfo,
} from '@tanstack/router';
import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';

const buildURLQuery = (
  obj: Record<string, string | number | boolean>,
): string =>
  Object.entries(obj)
    .map((pair) => pair.map(encodeURIComponent).join('='))
    .join('&');

export interface LinkProps<
  TRouteInfo extends AnyRoutesInfo = RegisteredRoutesInfo,
  TFrom extends RegisteredRoutesInfo['routePaths'] = '/',
  TTo extends string = '',
> extends Omit<MuiLinkProps, 'ref'>,
    Pick<
      LinkOptions<TRouteInfo, TFrom, TTo>,
      'to' | 'search' | 'params' | 'replace'
    > {}

const Link = <
  TRouteInfo extends AnyRoutesInfo = RegisteredRoutesInfo,
  TFrom extends RegisteredRoutesInfo['routePaths'] = '/',
  TTo extends string = '',
>({
  children,
  to,
  search,
  ...props
}: LinkProps<TRouteInfo, TFrom, TTo>) => {
  const isExternal = Boolean(to && to?.toString().startsWith('http'));
  if (!isExternal) {
    return (
      // @ts-ignore
      <MuiLink
        {...props}
        component={RouterLink}
        to={to}
        search={search as string | number | boolean}
      >
        {children}
      </MuiLink>
    );
  }
  const externalLink = search
    ? `${to}?${buildURLQuery(
        search as Record<string, string | number | boolean>,
      )}`
    : to;
  return (
    <MuiLink {...props} href={externalLink}>
      {children}
    </MuiLink>
  );
};

export default Link;
