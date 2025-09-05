import { ICellRendererParams } from 'ag-grid-community';
import React, { useEffect, useImperativeHandle, useState } from 'react';

export const useCellRendererRef = <T extends Partial<ICellRendererParams>>(
  ref: ((instance: any) => void) | React.MutableRefObject<any> | null,
  inputParams: T,
  destroy?: () => void,
  refresh = true,
) => {
  const [params, setParams] = useState<T>(inputParams);
  useEffect(() => {
    setParams(inputParams);
  }, [inputParams]);

  useImperativeHandle(ref, () => {
    return {
      refresh(newParams: T) {
        setParams(newParams);
        return refresh;
      },
      destroy,
    };
  });
  return params;
};

export default useCellRendererRef;
