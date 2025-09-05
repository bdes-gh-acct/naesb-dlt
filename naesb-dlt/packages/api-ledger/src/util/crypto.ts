/* eslint-disable @typescript-eslint/naming-convention */
import * as asn from 'asn1.js';
import { createHash } from 'crypto';

const padLeft = (orig, len) => {
  if (orig.length > len) return orig;
  return Array(len - orig.length + 1).join('0') + orig;
};

function arrBytesToHex(bytes) {
  return bytes.map((x) => padLeft(x.toString(16), 2)).join('');
}

export const bytesToHex = (bytes) => `0x${arrBytesToHex(bytes)}`;

export const hexToBytes = (hex: string) => {
  if (hex.length % 2 === 1)
    throw new Error(
      "hexToBytes can't have a string with an odd number of characters.",
    );
  // eslint-disable-next-line no-param-reassign
  if (hex.indexOf('0x') === 0) hex = hex.slice(2);
  // @ts-ignore
  return hex.match(/../g).map((x) => parseInt(x, 16));
};

export const convertBufferEntriesToValue = (
  obj: any,
  prop = 'value',
  encoding: BufferEncoding = 'utf8',
) => {
  if (Array.isArray(obj)) {
    return obj.map((val) => convertBufferEntriesToValue(val, prop, encoding));
  }
  if (!Buffer.isBuffer(obj) && typeof obj === 'object') {
    // Each element of array of Buffer is excluded by the 1st condition
    return Object.entries(obj).reduce(
      (acc: Record<string, any>, [key, value]) => {
        if (Buffer.isBuffer(value)) {
          if (
            [
              'nonce',
              'signature',
              'proposal_hash',
              'key_hash',
              'value_hash',
            ].includes(key)
          ) {
            return {
              ...acc,
              [key]: bytesToHex(value),
            };
          }
          const stringValue = value.toString(encoding);
          try {
            return {
              ...acc,
              [key]: convertBufferEntriesToValue(
                JSON.parse(stringValue),
                prop,
                encoding,
              ),
            };
          } catch {
            return { ...acc, [key]: stringValue };
          }
        } else if (typeof value === 'object' && value) {
          return {
            ...acc,
            [key]: convertBufferEntriesToValue(value, prop, encoding),
          };
        }
        return { ...acc, [key]: value };
      },
      {},
    );
  }
};

export const generateBlockHash = (header: any) => {
  const headerAsn = asn.define('headerAsn', function () {
    this.seq().obj(
      this.key('Number').int(),
      this.key('PreviousHash').octstr(),
      this.key('DataHash').octstr(),
    );
  });
  // ToDo: Need to handle Long data correctly. header.number {"low":3,"high":0,"unsigned":true}
  const output = headerAsn.encode(
    {
      Number: parseInt(header.number.low as string, 10),
      PreviousHash: header.previous_hash,
      DataHash: header.data_hash,
    },
    'der',
  );
  return createHash('sha256').update(output).digest('hex');
};
