import { GridApi, IGetRowsParams } from 'ag-grid-community';
import { useCallback } from 'react';
import axios from 'axios';
import { set } from 'lodash';

export interface GetRowsServiceParams {
  url: string;
  gridApi?: GridApi;
}

export const useGetRowsService = ({ url, gridApi }: GetRowsServiceParams) => {
  const getRows = useCallback(
    async ({
      startRow,
      endRow,
      successCallback,
      failCallback,
      sortModel,
      filterModel,
    }: IGetRowsParams) => {
      const variables = {
        query: filterModel
          ? Object.entries(filterModel).reduce(
              (acc: any, [key, value]: [string, any]) => {
                set(acc, key, {
                  filter: value.filter,
                  type: value.type,
                });
                return acc;
              },
              {},
            )
          : undefined,
        start: startRow,
        end: endRow,
        order:
          gridApi && sortModel
            ? sortModel.reduce((acc: any, entry: any) => {
                const field = gridApi?.getColumnDef(
                  entry.colId as string,
                )?.field;
                if (field) {
                  set(acc, field, entry.sort.toUpperCase());
                }
                return acc;
              }, {})
            : undefined,
      };
      try {
        const blockResponse = await axios.post(url, variables);
        if (blockResponse && Object.values(blockResponse).length) {
          const rowData = Object.values(blockResponse)[0];
          successCallback(rowData.data, rowData.totalRecords);
        } else {
          failCallback();
        }
      } catch (e) {
        failCallback();
      }
    },
    [gridApi, url],
  );
  return getRows;
};
