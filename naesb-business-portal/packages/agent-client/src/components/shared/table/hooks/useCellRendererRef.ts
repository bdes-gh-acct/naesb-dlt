import { ICellRendererParams } from 'ag-grid-community';
import {
  useEffect,
  useImperativeHandle,
  useState,
  MutableRefObject,
} from 'react';

export const useCellRendererRef = <
  T extends Partial<ICellRendererParams> = ICellRendererParams,
>(
  ref: ((instance: any) => void) | MutableRefObject<any> | null,
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
        console.log('refresh called', newParams);
        setParams(newParams);
        return refresh;
      },
      destroy,
    };
  });
  return params;
};
