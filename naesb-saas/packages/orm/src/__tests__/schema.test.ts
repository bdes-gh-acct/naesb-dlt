import { QueryOperator } from '@shared/orm-model';
import { queryParamsSchema } from '../schema';

describe('querySchema', () => {
  it('should validate sort', async () => {
    const result = await queryParamsSchema.safeParseAsync({
      sortBy: JSON.stringify({ TEST: 'ASC' }),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        sortBy: { TEST: 'ASC' },
      });
    }
  });

  it('should validate sort with nesting', async () => {
    const result = await queryParamsSchema.safeParseAsync({
      sortBy: JSON.stringify({ TEST: 'ASC', NESTED: { TESTING: 'desc' } }),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        sortBy: { TEST: 'ASC', NESTED: { TESTING: 'desc' } },
      });
    }
  });

  it('should validate sort with invalid syntax', async () => {
    const result = await queryParamsSchema.safeParseAsync({
      sortBy: JSON.stringify({ TEST: 'INVALID' }),
    });
    expect(result.success).toBe(false);
  });

  it('should be invalid when sort is invalid json', async () => {
    const result = await queryParamsSchema.safeParseAsync({
      sortBy: '{[]]]',
    });
    expect(result.success).toBe(false);
  });

  it('should be valid when query is valid json', async () => {
    const timestamp = new Date();
    const result = await queryParamsSchema.safeParseAsync({
      query: JSON.stringify({
        TEST: {
          type: QueryOperator.EQUALS,
          filter: timestamp.toISOString(),
        },
      }),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        query: {
          TEST: {
            type: QueryOperator.EQUALS,
            filter: timestamp,
          },
        },
      });
    }
  });

  it('should be valid when query is valid json with nesting', async () => {
    const timestamp = new Date();
    const result = await queryParamsSchema.safeParseAsync({
      query: JSON.stringify({
        TEST: {
          type: QueryOperator.EQUALS,
          filter: timestamp.toISOString(),
        },
        NESTED: {
          TEST: {
            type: QueryOperator.EQUALS,
            filter: 'true',
          },
        },
      }),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        query: {
          TEST: {
            type: QueryOperator.EQUALS,
            filter: timestamp,
          },
          NESTED: {
            TEST: {
              type: QueryOperator.EQUALS,
              filter: true,
            },
          },
        },
      });
    }
  });
});
