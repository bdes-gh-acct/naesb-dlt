export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }

  from(data?: string): number | undefined {
    return data && !Number.isNaN(Number(data)) ? Number(data) : undefined;
  }
}
