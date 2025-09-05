import { common, ledger, msp, peer } from '@hyperledger/fabric-protos';
import { X509Certificate } from 'crypto';

export const assertDefined = <T>(
  value: T | null | undefined,
  message: string,
): T => {
  if (value === undefined) {
    throw new Error(message);
  }
  return value as T;
};

export const getPayloads = (block: common.Block): common.Payload[] =>
  (block.getData()?.getDataList_asU8() ?? [])
    .map((bytes) => common.Envelope.deserializeBinary(bytes))
    .map((envelope) => envelope.getPayload_asU8())
    .map((bytes) => common.Payload.deserializeBinary(bytes));

export interface IChannelHeader {
  txnId: string;
  epoch: number;
  timestamp?: Date;
  type: number;
}

const toDate = (channelHeader: common.ChannelHeader) => {
  const timestamp = channelHeader.getTimestamp();
  if (!timestamp) return undefined;
  const seconds = timestamp.getSeconds();
  const nanos = timestamp.getNanos();
  const milliseconds = (seconds + nanos / 1000000 / 1000) * 1000;
  return new Date(milliseconds);
};

const getChannelHeader = (payload: common.Payload): IChannelHeader => {
  const headerBytes = assertDefined(
    payload.getHeader(),
    'Missing payload header',
  );
  const header = common.ChannelHeader.deserializeBinary(
    headerBytes.getChannelHeader_asU8(),
  );
  return {
    txnId: header.getTxId(),
    epoch: header.getEpoch(),
    timestamp: toDate(header),
    type: header.getType(),
  };
};

export interface ISignatureHeader {
  mspId: string;
  certificate: string;
  identity?: {
    issuer?: string;
    subject?: string;
    commonName?: string;
    organizationUnit?: string;
    subjectAlternativeName?: string;
    serialNumber?: string;
  };
}

const getSignatureHeader = (payload: common.Payload): ISignatureHeader => {
  const headerBytes = assertDefined(
    payload.getHeader(),
    'Missing payload header',
  );
  const header = common.SignatureHeader.deserializeBinary(
    headerBytes.getSignatureHeader_asU8(),
  );
  const creatorBytes = header.getCreator_asU8();
  const creator = msp.SerializedIdentity.deserializeBinary(creatorBytes);
  const signatureCert = new TextDecoder().decode(creator.getIdBytes_asU8());
  let identity;
  try {
    if (signatureCert.length) {
      const cert = new X509Certificate(signatureCert);
      const subject = cert.subject.split(/\r?\n/);
      const subjectMap = subject.reduce((set: Map<string, string>, entry) => {
        const [key, value] = entry.split('=');
        set.set(key, value);
        return set;
      }, new Map<string, string>());
      identity = {
        issuer: cert.issuer,
        subject: cert.subject,
        commonName: subjectMap.get('CN'),
        organizationUnit: subjectMap.get('OU'),
        subjectAlternativeName: cert.subjectAltName,
        serialNumber: cert.serialNumber,
      };
    }
  } catch (e) {
    console.log(e);
  }
  return {
    mspId: creator.getMspid(),
    certificate: new TextDecoder().decode(creator.getIdBytes_asU8()),
    identity,
  };
};

export interface IChaincodeEvent {
  Name: string;
  ChaincodeId: string;
  Payload: string;
}

const getEvent = (
  chaincodeAction: peer.ChaincodeAction,
): IChaincodeEvent | undefined => {
  if (chaincodeAction.getEvents_asU8()?.length) {
    const event = peer.ChaincodeEvent.deserializeBinary(
      chaincodeAction.getEvents_asU8(),
    );
    const name = event.getEventName();
    if (!name?.length) {
      return undefined;
    }
    return {
      Name: event.getEventName(),
      ChaincodeId: event.getChaincodeId(),
      Payload: new TextDecoder().decode(event.getPayload_asU8()),
    };
  }
  return undefined;
};

export interface ITransactionAction {
  chaincodeId?: {
    Name?: string;
    Version?: string;
    Path?: string;
  };
  event?: IChaincodeEvent;
  results?: Array<{ writes: Array<IWriteSet> }>;
}

export interface IWriteSet {
  isDelete: boolean;
  key: string;
  value: string;
}

const getWrites = (rwSet: ledger.rwset.kvrwset.KVRWSet): Array<IWriteSet> =>
  rwSet.getWritesList().map((item) => ({
    isDelete: item.getIsDelete(),
    key: item.getKey(),
    value: new TextDecoder().decode(item.getValue_asU8()),
  }));

const getChaincodeActionResults = (
  action: peer.ChaincodeAction,
): Array<{ writes: Array<IWriteSet> }> => {
  const results = action.getResults_asU8();
  const rwSet = ledger.rwset.TxReadWriteSet.deserializeBinary(results);
  const mapped = rwSet
    .getNsRwsetList()
    .map((innerSet) =>
      ledger.rwset.kvrwset.KVRWSet.deserializeBinary(innerSet.getRwset_asU8()),
    );
  return mapped.map((item) => ({
    writes: getWrites(item),
  }));
};

const getInput = (payload: peer.ChaincodeActionPayload) => {
  try {
    const proposal = peer.ChaincodeProposalPayload.deserializeBinary(
      payload.getChaincodeProposalPayload_asU8(),
    );
    const inputs = peer.ChaincodeInput.deserializeBinary(
      proposal.getInput_asU8(),
    );

    return inputs
      .getArgsList_asU8()
      .map((arg) => new TextDecoder().decode(arg));
  } catch (e) {
    console.log(e);
    return [];
  }
};

const getAction = (
  transactionAction: peer.TransactionAction,
): ITransactionAction | undefined => {
  const payload = peer.ChaincodeActionPayload.deserializeBinary(
    transactionAction.getPayload_asU8(),
  );
  try {
    if (payload.hasAction()) {
      const inputs = getInput(payload);
      const action = payload.getAction() as peer.ChaincodeEndorsedAction;
      const responsePayloadU8 = action.getProposalResponsePayload_asU8();
      try {
        if (responsePayloadU8?.length) {
          const proposalResponse =
            peer.ProposalResponsePayload.deserializeBinary(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              responsePayloadU8,
            );
          const chaincodeAction = peer.ChaincodeAction.deserializeBinary(
            proposalResponse.getExtension_asU8(),
          );
          const event = getEvent(chaincodeAction);
          const chaincode = chaincodeAction.getChaincodeId();
          const chaincodeId = {
            Name: chaincode?.getName(),
            Version: chaincode?.getVersion(),
            Path: chaincode?.getPath(),
          };
          const results = getChaincodeActionResults(chaincodeAction);
          return {
            chaincodeId,
            event,
            results,
          };
        }
      } catch (e) {
        console.log(e);
      }
    }
    console.log('No action in transaction');
    return undefined;
  } catch (e) {
    console.error(e);
    return {};
  }
};

export interface ITransaction {
  channelHeader: IChannelHeader;
  signatureHeader: ISignatureHeader;
  isEndorserTransaction: boolean;
  isConfigUpdate?: boolean;
  transactionActions?: Array<ITransactionAction>;
  isValid: boolean;
  validationCode: number;
  payload: string;
}

export interface ITransactionBlock {
  channelHeader: IChannelHeader;
  signatureHeader: ISignatureHeader;
  isEndorserTransaction: boolean;
  isConfigUpdate?: boolean;
  transactionActions?: Array<ITransactionAction>;
  isValid: boolean;
  validationCode: number;
  payload: string;
  hash: string;
  number: number;
  previousHash: string;
}

export const createTransactionBlock = (blockHead: IBlockHeader | undefined, transaction: ITransaction): ITransactionBlock => ({
  ...transaction,
  hash: blockHead?.hash ?? '',
  number: blockHead?.number ?? 0,
  previousHash: blockHead?.previousHash ?? ''
});

const getTransaction = (payload: common.Payload) =>
  peer.Transaction.deserializeBinary(payload.getData_asU8())
    .getActionsList()
    .map(getAction);

const parsePayload = (
  payload: common.Payload,
  validationCode: number,
): ITransaction => {
  const signatureHeader = getSignatureHeader(payload);
  const channelHeader = getChannelHeader(payload);
  const isEndorserTransaction =
    channelHeader.type === common.HeaderType.ENDORSER_TRANSACTION;
  const isConfigUpdate =
    channelHeader.type === common.HeaderType.CONFIG ||
    channelHeader.type === common.HeaderType.CONFIG_UPDATE;
  if (isConfigUpdate) {
    try {
      const txList = peer.Transaction.deserializeBinary(
        payload.getData_asU8(),
      ).getActionsList();
      txList.forEach((tx) => {
        if (channelHeader.type === common.HeaderType.CONFIG) {
          const raw = common.ConfigEnvelope.deserializeBinary(
            tx.getPayload_asU8(),
          );
          console.log(raw.getConfig());
        } else {
          const raw = common.ConfigUpdateEnvelope.deserializeBinary(
            tx.getPayload_asU8(),
          );
          console.log(raw.getConfigUpdate());
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
  return {
    channelHeader,
    signatureHeader,
    isEndorserTransaction,
    isConfigUpdate,
    transactionActions: isEndorserTransaction
      ? (getTransaction(payload).filter(
          (transaction) => transaction,
        ) as Array<ITransactionAction>)
      : undefined,
    isValid: validationCode === peer.TxValidationCode.VALID,
    validationCode,
    payload: payload.getData_asB64(),
  };
};

export const getTransactionValidationCodes = (
  block: common.Block,
): Uint8Array => {
  const metadata = assertDefined(block.getMetadata(), 'Missing block metadata');
  return metadata.getMetadataList_asU8()[
    common.BlockMetadataIndex.TRANSACTIONS_FILTER
  ];
};

export interface IBlockHeader {
  hash: string;
  number: number;
  previousHash: string;
}

const getBlockHeader = (block: common.Block): IBlockHeader | undefined => {
  const header = block.getHeader();
  if (!header) return undefined;
  return {
    hash: header.getDataHash_asB64(),
    number: header.getNumber(),
    previousHash: header?.getPreviousHash_asB64(),
  };
};

const getBlockMetadata = (block: common.Block) => {
  const metdata = block
    .getMetadata()
    ?.getMetadataList_asU8()
    .map((val) => new TextDecoder().decode(val));
  return metdata;
};

export interface IBlockEvent {
  data: { data: Array<ITransaction> };
  header?: IBlockHeader;
  metadata?: Array<string>;
}

export const parseBlock = (block: common.Block) => {
  const transactionCodes = getTransactionValidationCodes(block);
  const header = getBlockHeader(block);
  const data = getPayloads(block).map((payload, index) =>
    parsePayload(payload, transactionCodes[index]),
  );
  return { data: { data }, header, metadata: getBlockMetadata(block) };
};
