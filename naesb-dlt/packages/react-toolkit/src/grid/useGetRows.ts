import { GridApi, IGetRowsParams } from 'ag-grid-community';
import { useCallback } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { set } from 'lodash';
import { QueryOperator } from '@naesb/dlt-model';

export interface GetRowsServiceParams {
  url: string;
  gridApi?: GridApi;
}

export const useGetRowsService = ({ url, gridApi }: GetRowsServiceParams) => {
  const { getAccessTokenSilently, user } = useAuth0();
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
                  ...value,
                  type:
                    value.filterType === 'number' && value.type === 'equals'
                      ? QueryOperator.NUMERIC_CONTAINS
                      : value.type,
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
        const blockResponse = await axios.post(url, variables, {
          headers: {
            authorization: `Bearer ${await getAccessTokenSilently()}`,
            'x-org-id': user?.org_id,
          },
        });
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
    [gridApi, url, getAccessTokenSilently, user?.org_id],
  );
  return getRows;
};
