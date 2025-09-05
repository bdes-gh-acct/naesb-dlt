import { AutocompleteChangeReason } from '@mui/joy';
// eslint-disable-next-line import/no-extraneous-dependencies
import { get } from 'lodash';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

export const filterValue = <T>(
  value: any,
  valueKey: string,
  options?: Array<T>,
  multiple?: boolean,
) =>
  multiple
    ? options?.filter(
        (item: any) => value && value.includes(get(item, valueKey)),
      )
    : options?.find((item: any) => value && value === get(item, valueKey));

export const useAutocomplete = (
  { value, onChange }: ControllerRenderProps<FieldValues>,
  valueKey: string,
  multiple?: boolean,
  options?: Array<any>,
  outerOnChange?: any,
) => {
  const [internalValue, setInternalValue] = useState(
    filterValue(value, valueKey, options, multiple),
  );
  useEffect(() => {
    setInternalValue(filterValue(value, valueKey, options, multiple));
  }, [value, options, valueKey, multiple]);

  const handleChange = useCallback(
    (
      _: ChangeEvent<any>,
      val: any,
      reason: AutocompleteChangeReason,
      details: any,
    ) => {
      let changeVal;
      if (multiple) {
        changeVal = val ? val.map((item: any) => item[valueKey]) : [];
      } else {
        changeVal = val ? get(val, valueKey) : undefined;
      }
      onChange({ target: { value: changeVal } });
      if (outerOnChange) {
        outerOnChange(_, val, reason, details);
      }
    },
    [multiple, outerOnChange, onChange, valueKey],
  );
  return {
    onChange: handleChange,
    value: internalValue,
  };
};
