import { PageContainer } from '@common/page';
import { TransactionList } from './list/TransactionList';

export const Transactions = () => {
  return (
    <PageContainer title="Transactions" size="xl">
      <TransactionList />
    </PageContainer>
  );
};
