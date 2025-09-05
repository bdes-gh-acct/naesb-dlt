import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef } from 'react';
import Link from 'components/shared/link';
import { useCellRendererRef } from 'components/shared/table/hooks';
import { IDirectory } from '@naesb/dlt-model';

export const DirectoryLinkCellRenderer = forwardRef(
  // @ts-ignore
  (params: ICellRendererParams<IDirectory>, ref) => {
    const { value, data } = useCellRendererRef<ICellRendererParams<IDirectory>>(
      ref,
      params,
    );
    return (
      (
        // @ts-ignore
        <Link
          sx={{ lineHeight: 1 }}
          to="/Businesses/$businessId/Relationship"
          // @ts-ignore
          params={{ businessId: data?.businessId }}
        >
          {value}
        </Link>
      ) || <></>
    );
  },
);
