/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutocompleteProps as MuiAutocompleteProps } from '@mui/joy';

export interface AutocompleteProps<
  TValue extends Record<string, any>,
  Multiple extends boolean,
  DisableClearable extends boolean = false,
  FreeSolo extends boolean = false,
> extends Omit<
    MuiAutocompleteProps<TValue, Multiple, DisableClearable, FreeSolo>,
    'value' | 'renderInput' | 'options' | 'loading'
  > {
  label: string;
  /**
   * key to be used to select label value.  By default the component will set label = value[labelKey]
   */

  labelKey: string;
  /**
   * label for the input
   */
  helperText?: string;
  /**
   * key to be used to select value.  By default the component will set value = value[valueKey]
   */
  valueKey: string;
  /**
   * When options are loaded asynchronously, setting isLoading will display loading indicator
   */
  isLoading?: boolean;
  limitTags?: number;
  options?: Array<TValue>;
  name: string;
  multiple?: Multiple;
}
