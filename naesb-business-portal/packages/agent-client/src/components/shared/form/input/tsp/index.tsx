import { useTsps } from 'query/tsp';
import { Autocomplete } from '../autocomplete/Autocomplete';

export interface TspLookupProps {
  name: string;
  label: string;
  disabled?: boolean;
}

export const TspLookup: React.FC<TspLookupProps> = ({
  name,
  label,
  disabled,
}) => {
  const { data, isLoading } = useTsps();
  return (
    <Autocomplete
      isLoading={isLoading}
      options={data?.data}
      name={name}
      label={label}
      labelKey="name"
      valueKey="businessId"
      getOptionLabel={(item) => {
        return typeof item === 'string' ? item : item.name;
      }}
      disabled={disabled}
    />
  );
};
