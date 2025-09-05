import { usePriceIndices } from '@query/price';
import { Autocomplete } from '../autocomplete';

export interface PriceIndexLookupProps {
  name: string;
  label: string;
}

export const PriceIndexLookup: React.FC<PriceIndexLookupProps> = ({
  name,
  label,
}) => {
  const { data, isLoading } = usePriceIndices();

  return (
    <Autocomplete
      isLoading={isLoading}
      options={data?.data}
      name={name}
      label={label}
      labelKey="name"
      valueKey="id"
      variant="filled"
      getOptionLabel={(item: any) =>
        `${item.provider?.abbreviation || ''} - ${item.name}`
      }
    />
  );
};
