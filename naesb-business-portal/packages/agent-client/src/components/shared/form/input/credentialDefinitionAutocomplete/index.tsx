import { ISchema } from '@naesb/aries-types';
import { useCredentialDefinitions } from 'query/credentialDefinitions';
import { Autocomplete } from '../autocomplete/Autocomplete';
import { AutocompleteProps } from '../autocomplete/types';

export type CredentialDefinitionAutocompleteProps<Multiple extends boolean> =
  Omit<
    AutocompleteProps<ISchema, Multiple>,
    'options' | 'valueKey' | 'labelKey' | 'isLoading'
  > & { name: string };

export const CredentialDefinitionAutocomplete = <Multiple extends boolean>(
  props: CredentialDefinitionAutocompleteProps<Multiple>,
) => {
  const { data, isLoading } = useCredentialDefinitions();
  return (
    <Autocomplete
      {...props}
      options={data?.data}
      isLoading={isLoading}
      labelKey="schema.name"
      valueKey="id"
    />
  );
};
