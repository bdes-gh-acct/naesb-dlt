import { PageContainer } from '@common/page';
import { BlockList } from './list/BlockList';

export const Blocks = () => {
  return (
    <PageContainer title="Blocks" size="xl">
      <BlockList />
    </PageContainer>
  );
};
