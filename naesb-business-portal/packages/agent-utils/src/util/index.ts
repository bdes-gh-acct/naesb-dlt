/* eslint-disable no-await-in-loop */
import { LedgerType, TransactionType, IndyRoleType } from '@naesb/aries-types';

export const asyncForEach = async <T>(
  array: T[],
  callback: (item: T, index: number, values: T[]) => Promise<void>,
) => {
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const isInt = (val: string | number) =>
  typeof (val === 'number') && Number.isInteger(val as number);

export const mapLedgerTypeToName = (type: string): LedgerType => {
  const ledger = Object.entries(LedgerType).find(
    (ledgerType) => ledgerType[0] === type,
  );
  if (!ledger) {
    throw new Error('invalid ledger');
  }
  return ledger[1] as LedgerType;
};

export const mapTransactionTypeToName = (type?: string): string | undefined => {
  if (!type) return undefined;
  const transactionType = Object.entries(TransactionType).find(
    (txnType) => txnType[1] === type,
  );
  if (!transactionType) {
    return undefined;
  }
  return transactionType[0];
};

export const mapRoleTypeToName = (type?: string): string | undefined => {
  if (!type) return undefined;
  const role = Object.entries(IndyRoleType).find(
    (roleType) => roleType[1] === type,
  );
  if (!role) {
    return undefined;
  }
  return role[0];
};

export interface BuildQueryParams {
  endRow?: number | string;
  query?: any;
  sortBy?: string;
  sortMode?: string;
  startRow?: number | string;
  defaultSortColumn: string;
}

export const buildQuery = ({
  endRow = 1000,
  query = '{}',
  defaultSortColumn,
  sortBy = defaultSortColumn,
  sortMode = 'ASC',
  startRow = 0,
}: BuildQueryParams) => ({
  end: Number(endRow),
  start: Number(startRow),
  query: JSON.parse(query as string),
  sortBy: sortBy.toString(),
  sortMode,
});
