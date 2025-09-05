import { IField } from '@naesb/aries-types';
import { useFields } from 'query/field';
import { Autocomplete } from '../autocomplete/Autocomplete';
import { AutocompleteProps } from '../autocomplete/types';

export type FieldAutocompleteProps<Multiple extends boolean> = Omit<
  AutocompleteProps<IField, Multiple>,
  'options' | 'valueKey' | 'labelKey' | 'isLoading'
> & { name: string };

export const FieldAutocomplete = <Multiple extends boolean>(
  props: FieldAutocompleteProps<Multiple>,
) => {
  const { data, isLoading } = useFields();
  return (
    <Autocomplete
      {...props}
      options={data?.data}
      isLoading={isLoading}
      labelKey="name"
      valueKey="id"
    />
  );
};
