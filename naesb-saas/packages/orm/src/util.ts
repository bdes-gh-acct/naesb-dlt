import { isEmpty, isNil, pickBy } from 'lodash';

export const dateRegex =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/;

export const cleanse = <T extends object>(obj: T): Partial<T> =>
  pickBy(
    obj,
    (val) =>
      !isNil(val) &&
      (!(typeof val === 'object' || Array.isArray(val)) || !isEmpty(val)) &&
      val !== '{}',
  );
