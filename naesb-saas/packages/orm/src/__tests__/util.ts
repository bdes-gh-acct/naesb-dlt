import { cleanse } from '../util';

describe('cleanse', () => {
  it('should remove undefined properties', () => {
    const result = cleanse({ where: undefined, test: 1 });
    expect(result).toEqual({ test: 1 });
  });

  it('should remove null properties', () => {
    const result = cleanse({ where: null, test: 1 });
    expect(result).toEqual({ test: 1 });
  });

  it('should remove empty array properties', () => {
    const result = cleanse({ where: [], test: 1 });
    expect(result).toEqual({ test: 1 });
  });

  it('should remove empty object properties', () => {
    const result = cleanse({ where: {}, test: 1 });
    expect(result).toEqual({ test: 1 });
  });

  it('should not remove falsy properties', () => {
    const result = cleanse({ where: false, test: 1 });
    expect(result).toEqual({ where: false, test: 1 });
  });
});
