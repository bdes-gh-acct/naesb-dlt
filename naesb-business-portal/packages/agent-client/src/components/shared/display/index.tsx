import { Skeleton, Typography } from '@mui/joy';
import { get } from 'lodash';
import { ReactNode, useMemo } from 'react';

export interface ValueFormatterParams<TData> {
  value?: any;
  data: TData;
}

export interface DisplayProps<TData> {
  isLoading?: boolean;
  data?: TData;
  field: string;
  label: string;
  valueFormatter?: (
    params: ValueFormatterParams<TData>,
  ) => ReactNode | undefined;
}

export const DisplayText = <TData,>({
  isLoading,
  valueFormatter,
  data,
  field,
  label,
}: DisplayProps<TData>) => {
  const innerValue = useMemo(() => {
    if (isLoading || !data) return undefined;
    const value = get(data, field);
    return valueFormatter ? valueFormatter({ data, value }) : value;
  }, [data, valueFormatter, field, isLoading]);
  return (
    <>
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        {isLoading ? <Skeleton>{label}</Skeleton> : label}
      </Typography>
      {typeof innerValue !== 'string' &&
      typeof innerValue !== 'boolean' &&
      typeof innerValue !== 'number' ? (
        innerValue || '--'
      ) : (
        <Typography>
          {isLoading ? <Skeleton>Lorem Ipsum</Skeleton> : innerValue || '--'}
        </Typography>
      )}
    </>
  );
};
