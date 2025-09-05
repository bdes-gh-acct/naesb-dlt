/* eslint-disable class-methods-use-this */
export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }

  from(data?: string): number {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return data ? parseFloat(data) : undefined;
  }
}
