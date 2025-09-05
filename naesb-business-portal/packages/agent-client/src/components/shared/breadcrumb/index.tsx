import { Breadcrumbs } from '@mui/joy';
import { useMatches, useParams } from '@tanstack/router';
import { useMemo } from 'react';

export const RouteBreadcrumb = () => {
  const matches = useMatches();
  const crumbs = useMemo(
    () =>
      matches
        // @ts-ignore
        .filter((match) => match.route.options.meta?.Breadcrumb)
        .map((match) => ({
          // @ts-ignore
          Breadcrumb: match.route.options.meta?.Breadcrumb,
          id: match.id,
        })),
    [matches],
  );
  const params = useParams();
  if (!crumbs || !crumbs.length) {
    return <></>;
  }
  return (
    <Breadcrumbs aria-label="breadcrumbs" sx={{ paddingX: 0 }}>
      {crumbs.map(({ id, Breadcrumb }) => (
        // @ts-ignore
        <Breadcrumb key={id} params={params} />
      ))}
    </Breadcrumbs>
  );
};
