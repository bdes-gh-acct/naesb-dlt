/* eslint-disable no-underscore-dangle */
import { IConnection } from '@naesb/aries-types';
import { useConnections } from 'query/connections';
import { Autocomplete } from '../autocomplete/Autocomplete';
import { AutocompleteProps } from '../autocomplete/types';

export type ConnectionAutocompleteProps<Multiple extends boolean> = Omit<
  AutocompleteProps<IConnection, Multiple>,
  'options' | 'valueKey' | 'labelKey' | 'isLoading'
> & { name: string };

export const ConnectionAutocomplete = <Multiple extends boolean>(
  props: ConnectionAutocompleteProps<Multiple>,
) => {
  const { data, isLoading } = useConnections();
  return (
    <Autocomplete
      {...props}
      options={data?.data}
      isLoading={isLoading}
      labelKey="their_label"
      getOptionLabel={(option) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        typeof option === 'string'
          ? option
          : // eslint-disable-next-line no-underscore-dangle
            // @ts-ignore
            option._did?.alias || option.their_label
      }
      valueKey="connection_id"
    />
  );
};
