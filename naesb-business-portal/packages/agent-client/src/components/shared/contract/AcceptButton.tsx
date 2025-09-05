import { Button } from '@mui/joy';
import { Commodity } from '@naesb/dlt-model';
import { useAcceptContract } from 'query/contract';
import { useCallback } from 'react';
import { useFormState } from 'react-hook-form';

export interface AcceptButtonProps {
  channelId: string;
  commodity?: Commodity;
}

export const AcceptButton = ({
  channelId,
  commodity = Commodity.NATURAL_GAS,
}: AcceptButtonProps) => {
  const { dirtyFields, isValid } = useFormState();
  const { mutateAsync, isLoading } = useAcceptContract(() =>
    console.log('success'),
  );
  const handleClick = useCallback(() => {
    mutateAsync({ channelId, commodity });
  }, [channelId, commodity, mutateAsync]);

  const acceptable =
    Object.keys(dirtyFields).length === 1 &&
    Object.keys(dirtyFields)[0] === 'Accept';
  return (
    <Button
      disabled={isLoading || !isValid || !acceptable}
      onClick={handleClick}
      loading={isLoading}
    >
      Accept
    </Button>
  );
};
