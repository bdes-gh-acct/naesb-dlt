/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/naming-convention */
import { BadRequestException, Injectable } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import { AxiosError } from 'axios';
import {
  connect,
  Gateway,
  GrpcClient,
  Identity,
  Signer,
  signers,
} from '@hyperledger/fabric-gateway';
import { common } from '@hyperledger/fabric-protos';
import * as crypto from 'crypto';
import { TextDecoder } from 'util';
import { ConfigService } from '@nestjs/config';
import { logger } from '@shared/server-utils';
import { ITransactionResponse } from '@naesb/dlt-model';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CaService } from '../ca/ca.service';
import {
  INTERNAL_EVENT_PREFIX,
  LEDGER_SERVICE_EVENT_NAMESPACE,
} from '../util/constant';
import { env } from '../env';

const decoder = new TextDecoder();

export interface IBaseTransactionParams {
  userId: string;
  role?: string;
  channel: string;
}

export interface IQueryChainInfoParams
  extends Omit<IBaseTransactionParams, 'userId'> {
  userId?: string;
}
export interface IQueryBlockParams
  extends Omit<IBaseTransactionParams, 'userId'> {
  userId?: string;
  block: number;
}

export interface IQueryBlockByTransactionIdParams
  extends IBaseTransactionParams {
  transactionId: string;
}

export interface SubmitTransactionParams extends IBaseTransactionParams {
  args?: Array<any>;
  namespace?: string;
  contract?: string;
  transactionName: string;
}

export interface EvaluateTransactionParams extends IBaseTransactionParams {
  args?: Array<any>;
  namespace?: string;
  contract?: string;
  transactionName: string;
}

const {
  ORG_MSP_ID,
  ORG_NAME,
  CORE_PEER_ADDRESS,
  AUTO_ENROLL_USERS,
  NAESB_CONTRACT_LABEL,
} = env;

const waitTillReady = (client: grpc.Client) =>
  new Promise<void>((resolve, reject) => {
    client.waitForReady(new Date().valueOf() + 60000, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

@Injectable()
export class LedgerService {
  private grpcClient?: grpc.Client;

  private adminGateway?: Gateway;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private caService: CaService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.init();
  }

  async createGrpcClient(): Promise<grpc.Client> {
    console.log(`Creating GRPC Client: ${CORE_PEER_ADDRESS}`);
    const tlsRootCert = await this.caService.getTlsCa();
    const tlsCredentials = grpc.credentials.createSsl(Buffer.from(tlsRootCert));
    const client = new grpc.Client(CORE_PEER_ADDRESS, tlsCredentials, {
      'grpc.ssl_target_name_override': `peer0.peer-${ORG_NAME}.service.consul`,
    });
    await waitTillReady(client);
    return client;
  }

  getAdminGateway() {
    return this.adminGateway;
  }

  async init() {
    this.grpcClient = await this.createGrpcClient();
    const { signer, identity } = await this.enrollAdmin();
    const gateway = this.getGateway({ signer, identity });
    this.adminGateway = gateway;
    logger.info(
      this.eventEmitter.listenerCount(
        `${INTERNAL_EVENT_PREFIX}.${LEDGER_SERVICE_EVENT_NAMESPACE}.ready`,
      ),
    );
    await this.eventEmitter.emitAsync(
      `${INTERNAL_EVENT_PREFIX}.${LEDGER_SERVICE_EVENT_NAMESPACE}.ready`,
    );
    logger.info('Gateway Ready');
  }

  async getVaultUser(
    userId: string,
    role?: string,
  ): Promise<{ identity: Identity; signer: Signer }> {
    try {
      const { private_key, certificate } = await this.caService.getUser(
        userId,
        role,
      );
      return this.getWallet(certificate, private_key);
    } catch (e) {
      const err = e as AxiosError;
      if (err.response?.status === 404 && AUTO_ENROLL_USERS) {
        console.log(`existing user not found ${role}:${userId}`);
        const { private_key, certificate } = await this.caService.createUser(
          userId,
          role || 'client',
        );
        return this.getWallet(certificate, private_key);
      }
      throw new BadRequestException('User not found');
    }
  }

  getWallet(certificate: string, private_key: string) {
    const privateKey = crypto.createPrivateKey(private_key);
    const identity: Identity = {
      mspId: ORG_MSP_ID,
      credentials: Buffer.from(certificate, 'utf-8'),
    };
    const signer = signers.newPrivateKeySigner(privateKey);
    return { signer, identity };
  }

  async getGatewayForUser({ name, role }: { name: string; role: string }) {
    const { identity, signer } = await this.getVaultUser(name, role);
    return this.getGateway({ identity, signer });
  }

  getGateway({ signer, identity }: { signer: Signer; identity: Identity }) {
    // const { identity, signer } = await this.getVaultUser(userId, role);
    console.log('connecting to gateway...');
    const gateway = connect({
      client: this.grpcClient as GrpcClient,
      identity,
      signer,
      // Default timeouts for different gRPC calls
      evaluateOptions: () => ({ deadline: Date.now() + 5000 }), // 5 seconds
      endorseOptions: () => ({ deadline: Date.now() + 15000 }), // 15 seconds
      submitOptions: () => ({ deadline: Date.now() + 5000 }), // 5 seconds
      commitStatusOptions: () => ({ deadline: Date.now() + 60000 }), // 1 minute
    });
    console.log('connected to gateway');
    return gateway;
  }

  async queryBlockByTransactionId({
    channel,
    userId = 'admin',
    role = 'admin',
    transactionId,
  }: IQueryBlockByTransactionIdParams) {
    try {
      const gateway = await this.getGatewayForUser({ name: userId, role });
      const chaincode = gateway.getNetwork(channel).getContract('qscc');
      const resultBytes = await chaincode.evaluateTransaction(
        'GetBlockByTxID',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        channel,
        transactionId,
      );
      const resultJson = common.Block.deserializeBinary(resultBytes);
      return resultJson;
    } catch (error) {
      console.error(
        `Failed to get block ${transactionId} from channel ${channel} : `,
        error,
      );
      return null;
    }
  }

  async queryBlock({
    channel,
    userId = 'admin',
    role = 'admin',
    block,
  }: IQueryBlockParams) {
    try {
      const gateway = await this.getGatewayForUser({ name: userId, role });
      const chaincode = gateway.getNetwork(channel).getContract('qscc');
      const resultBytes = await chaincode.evaluateTransaction(
        'GetBlockByNumber',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        channel,
        String(block),
      );
      const resultJson = common.Block.deserializeBinary(resultBytes);
      return resultJson;
    } catch (error) {
      logger.error(
        `Failed to get block ${block} from channel ${channel} : `,
        error,
      );
      return null;
    }
  }

  async queryChainInfo({
    channel,
    userId = 'admin',
    role = 'admin',
  }: IQueryChainInfoParams) {
    try {
      const gateway = await this.getGatewayForUser({ name: userId, role });
      const chaincode = gateway.getNetwork(channel).getContract('qscc');
      const resultBytes = await chaincode.evaluateTransaction(
        'GetChainInfo',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        channel,
      );
      const resultProto = common.BlockchainInfo.deserializeBinary(resultBytes);
      const height = resultProto.getHeight();
      const previousHash = resultProto.getCurrentblockhash_asU8().toString();
      const previousHashB64 = resultProto
        .getCurrentblockhash_asB64()
        .toString();
      const previousHash2 = resultProto.getCurrentblockhash();
      console.log(previousHash, previousHashB64, previousHash2);
      const bootstrappingSnapshotInfo =
        resultProto.getBootstrappingsnapshotinfo();
      return {
        height,
        previousBlockHash: resultProto.getPreviousblockhash_asB64(),
        currentBlockHash: resultProto.getCurrentblockhash_asB64(),
        bootstrappingSnapshotInfo: {
          lastBlockInSnapshot:
            bootstrappingSnapshotInfo?.getLastblockinsnapshot(),
        },
      };
    } catch (error) {
      console.error(
        `Failed to get chain info from channel ${channel} : `,
        error,
      );
      return null;
    }
  }

  async submitTransaction({
    args,
    channel,
    contract = 'TradeContract',
    namespace = NAESB_CONTRACT_LABEL,
    transactionName,
    userId,
    role = 'admin',
  }: SubmitTransactionParams): Promise<ITransactionResponse<string>> {
    const gateway = await this.getGatewayForUser({ name: userId, role });
    const chaincode = gateway
      .getNetwork(channel)
      .getContract(namespace, contract);
    const commit = await chaincode.submitAsync(transactionName, {
      arguments: args,
    });
    const txId = commit.getTransactionId();
    const rawData = commit.getResult();
    const data = rawData ? decoder.decode(rawData) : undefined;
    const { code, successful } = await commit.getStatus();
    if (successful) {
      return {
        txId,
        success: true,
        data,
      };
    }
    logger.error(
      `Error calling ${namespace}:${contract}:${transactionName} on channel ${channel}. Code: ${code}. ${data}`,
    );
    return {
      txId,
      success: false,
      errors: data,
    };
  }

  async evaluateTransaction<TData>({
    args = [],
    channel,
    contract = 'TradeContract',
    namespace = NAESB_CONTRACT_LABEL,
    transactionName,
    userId,
    role,
  }: EvaluateTransactionParams): Promise<TData> {
    console.log(`Executing ${transactionName} on ${namespace}.${contract}...`);
    if (!role) {
      throw new BadRequestException('Role is not defined');
    }
    const gateway = await this.getGatewayForUser({ name: userId, role });
    const chaincode = gateway
      .getNetwork(channel)
      .getContract(namespace, contract);
    const resultBytes = await chaincode.evaluateTransaction(
      transactionName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...args,
    );
    console.log(
      `Successfully executed ${transactionName} on ${namespace}.${contract}`,
    );
    const resultJson = decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    return result as TData;
  }

  private async enrollAdmin() {
    try {
      const { private_key, certificate } = await this.caService.getUser(
        this.configService.get<string>('ADMIN_USER_ID') || 'admin',
        'admin',
      );
      if (private_key) {
        console.log(
          'An identity for the admin user already exists in the wallet',
        );
        return this.getWallet(certificate, private_key);
      }
      throw new Error('not found');
    } catch {
      console.warn(`admin user not found`);
      const { certificate, private_key } = await this.caService.createUser(
        this.configService.get<string>('ADMIN_USER_ID') as string,
        'admin',
      );
      return this.getWallet(certificate, private_key);
    }
  }
}
