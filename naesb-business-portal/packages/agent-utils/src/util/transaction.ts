import {
  IndyTransaction,
  ITransaction,
  LedgerType,
  TransactionType,
} from '@naesb/aries-types';

export const transformLedgerTransactionToDbModel = (
  ledger: LedgerType,
  transaction: IndyTransaction,
): ITransaction => {
  const {
    txnMetadata: { txnId, seqNo } = { txnId: undefined, seqNo: 0 },
    txn,
  } = transaction;
  const baseProps = {
    transactionType: txn.type,
    seqNo,
    ledger: ledger.valueOf(),
    transactionId: txnId,
    value: transaction,
    createdBy: txn.metadata.from,
  };
  switch (txn.type) {
    case TransactionType.NYM:
      return {
        ...baseProps,
        role: txn.data.role,
        destination: txn.data.dest,
      };
    case TransactionType.ATTRIB:
      return {
        ...baseProps,
        destination: txn.data.dest,
      };
    case TransactionType.NODE:
      return {
        ...baseProps,
        destination: txn.data.dest,
      };
    case TransactionType.CRED_DEF:
      return {
        ...baseProps,
        destination: txnId,
      };
    case TransactionType.SCHEMA:
      return {
        ...baseProps,
        destination: txn.data.data.name,
      };
    default:
      return {
        ...baseProps,
        destination: txnId,
      };
  }
};
