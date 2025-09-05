import { Suspense } from 'react';
import Loading from './loading';
import Page from '.';

export default () => (
  <Suspense fallback={<Loading />}>
    <Page />
  </Suspense>
);
