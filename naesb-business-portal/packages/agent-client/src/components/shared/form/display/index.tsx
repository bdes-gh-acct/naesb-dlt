import { FC, PropsWithChildren, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

export interface DisplayControllerProps {
  show?: ({ values }: any) => boolean;
  hide?: ({ values }: any) => boolean;
}

export const DisplayController: FC<
  PropsWithChildren<DisplayControllerProps>
> = ({ show, hide, children }) => {
  const values = useWatch();
  const display = useMemo(() => !show || show({ values }), [show, values]);
  if (display) {
    return <>{children}</>;
  }
  if (hide && !hide({ values })) {
    return <>{children}</>;
  }
  return <></>;
};
