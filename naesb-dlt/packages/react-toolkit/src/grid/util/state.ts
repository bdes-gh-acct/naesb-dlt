import { ColumnState } from 'ag-grid-community';

export const storeState = (id: string, state: Array<ColumnState>) =>
  localStorage.setItem(`GRID_STATE_KEY::${id}`, JSON.stringify(state));
export const loadState = (id: string): Array<ColumnState> => {
  const item = localStorage.getItem(`GRID_STATE_KEY::${id}`);
  return item ? JSON.parse(item) : new Array<ColumnState>;
};
