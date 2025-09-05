import { LedgerType } from '@naesb/aries-types';
import {
  isInt,
  asyncForEach,
  mapLedgerTypeToName,
  mapTransactionTypeToName,
  mapRoleTypeToName,
  buildQuery,
  BuildQueryParams,
} from '..';

describe('util/index', () => {
  describe('isInt', () => {
    it.each([
      [9, true],
      ['t', false],
      [{}, false],
      [undefined, false],
    ])('should test int', (val: any, result: boolean) => {
      expect(isInt(val)).toBe(result);
    });
  });

  describe('asyncForEach', () => {
    it('should call fn for each', async () => {
      const callback = jest.fn().mockResolvedValue({ success: true });
      await asyncForEach(['1', '2'], callback);
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, '1', 0, ['1', '2']);
      expect(callback).toHaveBeenNthCalledWith(2, '2', 1, ['1', '2']);
    });
  });

  describe('mapLedgerTypeToName', () => {
    it.each([
      ['POOL', LedgerType.POOL],
      ['DOMAIN', LedgerType.DOMAIN],
      ['CONFIG', LedgerType.CONFIG],
    ])('should map ledger type to name', (val: any, result: LedgerType) => {
      expect(mapLedgerTypeToName(val)).toEqual(result);
    });

    it('should throw error if invalid', () => {
      try {
        mapLedgerTypeToName('fake');
      } catch (e) {
        expect(e).toEqual(new Error('invalid ledger'));
      }
    });
  });

  describe('mapTransactionTypeToName', () => {
    it.each([
      ['0', 'NODE'],
      ['1', 'NYM'],
      ['fake', undefined],
      [undefined, undefined],
    ])('should map transaction type to name', (val?: any, result?: string) => {
      expect(mapTransactionTypeToName(val)).toEqual(result);
    });
  });

  describe('mapRoleTypeToName', () => {
    it.each([
      ['2', 'STEWARD'],
      ['0', 'TRUSTEE'],
      ['101', 'ENDORSER'],
      ['fake', undefined],
      [undefined, undefined],
    ])('should map role type to name', (val?: any, result?: string) => {
      expect(mapRoleTypeToName(val)).toEqual(result);
    });
  });

  describe('buildQuery', () => {
    it.each([
      [
        {
          endRow: '800',
          startRow: '100',
          defaultSortColumn: 'name',
          sortBy: 'id',
          sortMode: 'ASC',
        },
        { start: 100, end: 800, sortBy: 'id', sortMode: 'ASC', query: {} },
      ],
      [
        {
          endRow: '800',
          startRow: '100',
          defaultSortColumn: 'name',
          sortBy: 'id',
        },
        { start: 100, end: 800, sortBy: 'id', sortMode: 'ASC', query: {} },
      ],
      [
        {
          defaultSortColumn: 'name',
          sortMode: 'DESC',
        },
        { start: 0, end: 1000, sortBy: 'name', sortMode: 'DESC', query: {} },
      ],
    ])('should build query', (val: BuildQueryParams, result: any) => {
      expect(buildQuery(val)).toEqual(result);
    });
  });
});
