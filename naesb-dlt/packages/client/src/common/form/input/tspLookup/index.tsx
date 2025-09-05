import { MenuItem } from '@mui/material';
import { useTsps } from '@query/tsp';
import { Autocomplete } from '../autocomplete';

export interface TspLookupProps {
  name: string;
  label: string;
}

export const TspLookup: React.FC<TspLookupProps> = ({ name, label }) => {
  const { data, isLoading } = useTsps<any>();
  return (
    <Autocomplete
      isLoading={isLoading}
      options={data}
      name={name}
      label={label}
      labelKey="Name"
      valueKey="Id"
      variant="filled"
      renderOption={(props: any, option: any) => (
        <MenuItem {...props} key={option.Id}>
          {option.Name}
        </MenuItem>
      )}
    />
  );
};
