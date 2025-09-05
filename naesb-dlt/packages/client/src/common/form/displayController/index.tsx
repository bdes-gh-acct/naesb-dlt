/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';
import { useFormState } from 'react-final-form';

export interface DisplayControllerProps {
  show?: ({ values }: any) => boolean;
  hide?: ({ values }: any) => boolean;
}

export const DisplayController: FC<DisplayControllerProps> = ({
  show,
  hide,
  children,
}) => {
  const { values } = useFormState({ subscription: { values: true } });
  if (show && show({ values })) {
    return <>{children}</>;
  }
  if (hide && !hide({ values })) {
    return <>{children}</>;
  }
  return <></>;
};
