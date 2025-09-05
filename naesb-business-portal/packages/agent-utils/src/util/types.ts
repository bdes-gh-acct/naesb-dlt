export interface BaseQueryParams {
  sortBy: string;
  sortMode: 'ASC' | 'DESC';
}

export interface InfiniteQueryParams extends BaseQueryParams {
  startRow: string;
  endRow: string;
}
