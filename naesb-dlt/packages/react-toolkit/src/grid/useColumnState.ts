import { useCallback } from 'react';
import {
  ColumnApi,
  ColumnMovedEvent,
  ColumnPinnedEvent,
  ColumnPivotChangedEvent,
  ColumnResizedEvent,
  ColumnRowGroupChangedEvent,
  ColumnValueChangedEvent,
  ColumnVisibleEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { GridProps } from './types';
import { storeState } from './util/state';

export type UseColumnStateParams = Pick<
  GridProps,
  | 'onColumnResized'
  | 'onSortChanged'
  | 'onColumnMoved'
  | 'onColumnPinned'
  | 'onColumnPivotChanged'
  | 'onColumnValueChanged'
  | 'onColumnVisible'
  | 'onColumnRowGroupChanged'
  | 'gridId'
  | 'persistState'
>;

export const useColumnState = ({
  onColumnMoved,
  onColumnPinned,
  onColumnPivotChanged,
  onColumnResized,
  onColumnValueChanged,
  onColumnRowGroupChanged,
  onColumnVisible,
  onSortChanged,
  gridId,
  persistState,
}: UseColumnStateParams) => {
  const handleColumnEvent = useCallback(
    ({ columnApi }: { columnApi: ColumnApi }) => {
      if (gridId && persistState) {
        storeState(
          gridId,
          columnApi.getColumnState().map((state) => ({
            ...state,
            aggFunc:
              state.aggFunc === null ||
              (state.aggFunc && typeof state.aggFunc !== 'string')
                ? undefined
                : state.aggFunc,
          })),
        );
      }
    },
    [gridId, persistState],
  );
  const handleColumnMoved = (event: ColumnMovedEvent) => {
    handleColumnEvent(event);
    if (onColumnMoved) {
      onColumnMoved(event);
    }
  };

  const handleColumnResized = (event: ColumnResizedEvent) => {
    handleColumnEvent(event);
    if (onColumnResized) {
      onColumnResized(event);
    }
  };

  const handleColumnVisible = (event: ColumnVisibleEvent) => {
    handleColumnEvent(event);
    if (onColumnVisible) {
      onColumnVisible(event);
    }
  };

  const handleSortChanged = (event: SortChangedEvent) => {
    handleColumnEvent(event);
    if (onSortChanged) {
      onSortChanged(event);
    }
  };

  const handleColumnPinned = (event: ColumnPinnedEvent) => {
    handleColumnEvent(event);
    if (onColumnPinned) {
      onColumnPinned(event);
    }
  };

  const handleColumnPivotChanged = (event: ColumnPivotChangedEvent) => {
    handleColumnEvent(event);
    if (onColumnPivotChanged) {
      onColumnPivotChanged(event);
    }
  };

  const handleColumnRowGroupChanged = (event: ColumnRowGroupChangedEvent) => {
    handleColumnEvent(event);
    if (onColumnRowGroupChanged) {
      onColumnRowGroupChanged(event);
    }
  };

  const handleColumnValueChanged = (event: ColumnValueChangedEvent) => {
    handleColumnEvent(event);
    if (onColumnValueChanged) {
      onColumnValueChanged(event);
    }
  };
  return {
    onColumnValueChanged: handleColumnValueChanged,
    onColumnRowGroupChanged: handleColumnRowGroupChanged,
    onColumnPivotChanged: handleColumnPivotChanged,
    onColumnPinned: handleColumnPinned,
    onSortChanged: handleSortChanged,
    onColumnVisible: handleColumnVisible,
    onColumnMoved: handleColumnMoved,
    onColumnResized: handleColumnResized,
  };
};
