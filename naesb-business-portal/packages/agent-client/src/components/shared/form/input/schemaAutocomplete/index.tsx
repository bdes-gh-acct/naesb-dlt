import { ISchema } from '@naesb/aries-types';
import { useSchemas } from 'query/schemas';
import { Autocomplete } from '../autocomplete/Autocomplete';
import { AutocompleteProps } from '../autocomplete/types';

export type SchemaAutocompleteProps<Multiple extends boolean> = Omit<
  AutocompleteProps<ISchema, Multiple>,
  'options' | 'valueKey' | 'labelKey' | 'isLoading'
> & { name: string };

export const SchemaAutocomplete = <Multiple extends boolean>(
  props: SchemaAutocompleteProps<Multiple>,
) => {
  const { data, isLoading } = useSchemas();
  return (
    <Autocomplete
      {...props}
      getOptionLabel={(option) =>
        typeof option === 'string'
          ? option
          : `${option.name} v${option.version}`
      }
      options={data?.data}
      isLoading={isLoading}
      labelKey="name"
      valueKey="id"
    />
  );
};
