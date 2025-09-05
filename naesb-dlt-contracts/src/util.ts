/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Context } from 'fabric-contract-api';
import { SafeParseError, Schema } from 'zod';
import Long from 'long';
import { KeyHistory } from './History';
import { Iterators } from 'fabric-shim';

const flattenError: any = (
  error: Record<string, string | { _errors: Array<string> }>,
) => {
  if (typeof error === 'object')
    return Object.entries(error).reduce((acc: any, [key, err]) => {
      if (Array.isArray(err)) {
        if (key === '_errors') {
          return err.join(', ');
        }
        return {
          ...acc,
          [key]: err.map((inner) => flattenError(inner)),
        };
      }
      return { ...acc, [key]: flattenError(err) };
    }, {});
  return error;
};

export const validate = async <T extends object, S extends Schema<T>>(
  schema: S,
  values: T,
): Promise<T> => {
  const result = await schema.safeParseAsync(values);
  if (result.success) {
    return result.data;
  } else {
    const error = flattenError((result as SafeParseError<T>).error.format());
    console.error(JSON.stringify(error));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new Error(JSON.stringify(error));
  }
};

export const getKeyHistory = async <TData>(ctx: Context, key: string) => {
  const resultset = await ctx.stub.getHistoryForKey(key);

  const results = [];
  try {
    while (true) {
      const obj = await resultset.next();
      if (obj.value) {
        const history = new KeyHistory<TData>();
        history.TxId = obj.value.txId;
        if (Long.isLong(obj.value.timestamp.seconds)) {
          history.Timestamp = new Date(
            obj.value.timestamp.seconds.toInt() * 1000 +
              Math.round(obj.value.timestamp.nanos / 1000000),
          ).toString();
        } else {
          history.Timestamp = new Date(
            obj.value.timestamp.seconds * 1000 +
              Math.round(obj.value.timestamp.nanos / 1000000),
          ).toString();
        }
        history.IsDelete = obj.value.isDelete.toString();
        const resultStr = Buffer.from(obj.value.value).toString('utf8');
        const json = (await JSON.parse(resultStr)) as TData;
        // @ts-ignore
        history.Data = json;
        results.push(history);
      }

      if (obj.done) {
        return results;
      }
    }
  } finally {
    await resultset.close();
  }
};

export const processResultset = async <TData>(
  resultset: Iterators.StateQueryIterator,
): Promise<TData[]> => {
  try {
    const results = [];
    while (true) {
      const obj = await resultset.next();

      if (obj.value) {
        const resultStr = Buffer.from(obj.value.value).toString('utf8');
        const json = (await JSON.parse(resultStr)) as TData;
        results.push(json);
      }

      if (obj.done) {
        return results;
      }
    }
  } finally {
    await resultset.close();
  }
};
