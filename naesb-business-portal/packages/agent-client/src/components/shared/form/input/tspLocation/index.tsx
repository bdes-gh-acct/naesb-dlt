import { useFormContext, useWatch } from 'react-hook-form';
import { useTspLocations } from 'query/tsp';
import { Autocomplete } from '../autocomplete/Autocomplete';

export interface TspLocationLookupProps {
  name: string;
  label: string;
  tspNumberKey: string;
  disabled?: boolean;
}

export const TspLocationLookup: React.FC<TspLocationLookupProps> = ({
  name,
  label,
  disabled,
}) => {
  const { control } = useFormContext();
  const value = useWatch({ control, name: 'TspBusinessId' });
  const { data, isLoading } = useTspLocations<any>(value as string);
  return (
    <Autocomplete
      virtualize
      isLoading={isLoading}
      options={data?.data}
      name={name}
      label={label}
      // @ts-ignore
      labelKey="locationName"
      valueKey="locationId"
      getOptionLabel={(item: any) =>
        `${item.locationName} (${item.locationId.trim()})`
      }
      renderOption={(props, option) =>
        // @ts-ignore
        [
          props,
          `${option.locationName} (${option.locationId.trim()})`,
          option.locationId,
        ] as React.ReactNode
      }
      // TODO: Post React 18 update - validate this conversion, look like a hidden bug
      renderGroup={(params) => params as unknown as React.ReactNode}
      disabled={disabled}
    />
  );
};
