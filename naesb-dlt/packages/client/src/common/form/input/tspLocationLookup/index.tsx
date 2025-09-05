import { useFormField } from '@common/form';
import { useTspLocations } from '@query/tsp';
import { ITspLocation } from '@naesb/dlt-model';
import { Autocomplete } from '../autocomplete';

export interface TspLocationLookupProps {
  name: string;
  label: string;
  tspNumberKey: string;
  disabled?: boolean;
}

export const TspLocationLookup: React.FC<TspLocationLookupProps> = ({
  name,
  label,
  tspNumberKey,
  disabled,
}) => {
  const {
    input: { value, onChange: tspOnChange },
  } = useFormField(tspNumberKey);
  const { data, isLoading } = useTspLocations<any>(value as string);

  return (
    <Autocomplete
      isLoading={isLoading}
      options={data?.data}
      name={name}
      label={label}
      // @ts-ignore
      onChange={(_, innerValue: ITspLocation) => {
        tspOnChange(innerValue.Tsp);
      }}
      labelKey="locationName"
      valueKey="locationId"
      variant="filled"
      getOptionLabel={(item: any) =>
        `${item.locationName} (${item.locationId})`
      }
      disabled={disabled}
    />
  );
};
