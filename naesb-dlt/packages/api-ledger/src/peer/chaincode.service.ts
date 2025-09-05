/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as fabprotos from 'fabric-protos';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Chaincode } from '../db/chaincode.entity';
import { MspService } from './msp.service';
import { PeerService } from './peer.service';
import { env } from '../env';

const client = new S3Client({ region: 'us-east-1' });

const {
  NAESB_CONTRACT_VERSION,
  NAESB_CONTRACT_LABEL,
  ORG_MSP_ID,
  ORDERER_ADDRESS,
} = env;

const execAsync = promisify(exec);

export interface ApproveContractParams {
  channelId: string;
  caCert: string;
  label: string;
  version: string;
  sequence: number;
  endorsementPolicy?: string;
}

export interface CheckCommitReadinessParams {
  channelId: string;
  label: string;
  version: string;
  sequence: number;
  endorsementPolicy?: string;
}

export interface CommitChaincodeParams {
  channelId: string;
  label: string;
  version: string;
  sequence: number;
  endorsementPolicy?: string;
  peerInfo: {
    peers: Array<string>;
    tlsCerts: Array<{ cert: string; id: string }>;
  };
}

export interface InitChaincodeParams {
  channelId: string;
  label: string;
  version?: string;
  sequence?: number;
  peerInfo: {
    peers: Array<string>;
    tlsCerts: Array<{ cert: string; id: string }>;
  };
}

export const execCommand = async (command: string) => {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.log('Bad exec error 01:');
      console.log(command);
      console.error(stderr);
    }
    console.log('Good exec command:');
    console.log(command);
    return stdout;
  } catch (e) {
    console.log('Bad exec error 02:');
    console.log(command);
    console.log(e);
    throw e;
  }
};

@Injectable()
export class ChaincodeService {
  private ready = false;

  constructor(
    private mspService: MspService,
    private peerService: PeerService,
    @InjectRepository(Chaincode)
    private chaincodeRepository: Repository<Chaincode>,
    private eventEmitter: EventEmitter2,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.init();
  }

  isReady() {
    return this.ready;
  }

  private async init() {
    await this.mspService.createOrgMSP(ORG_MSP_ID);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    await this.installContract(NAESB_CONTRACT_LABEL, NAESB_CONTRACT_VERSION);
    this.ready = true;
  }

  async queryInstalledChaincodes() {
    console.debug('Querying installed chaincodes...');
    const result = await execCommand(
      `peer lifecycle chaincode queryinstalled -O json`,
    );
    return (
      typeof result === 'string' ? JSON.parse(result) : result
    ) as fabprotos.lifecycle.IQueryInstalledChaincodesResult;
  }

  async queryCommittedChaincodes(channelId: string) {
    console.debug(`Querying committed chaincodes for ${channelId}...`);
    const result = await execCommand(
      `peer lifecycle chaincode querycommitted --channelID ${channelId} -O json`,
    );
    return (
      typeof result === 'string' ? JSON.parse(result) : result
    ) as fabprotos.lifecycle.IQueryChaincodeDefinitionsResult;
  }

  async queryApprovedChaincodes(channelId: string, name: string) {
    console.debug(`Querying approved ${name} chaincode for ${channelId}...`);
    const result = await execCommand(
      `peer lifecycle chaincode queryapproved --channelID ${channelId} -n ${name} -O json`,
    );
    return (
      typeof result === 'string' ? JSON.parse(result) : result
    ) as fabprotos.lifecycle.IQueryChaincodeDefinitionsResult;
  }

  createKey(label: string, version: string) {
    return `${label}_${version}.tar.gz`;
  }

  async installContract(label: string, version: string) {
    console.log(`Installing contract ${label}_${version}...`);
    const fullLabel = this.createKey(label, version);
    await this.downloadContract(fullLabel);
    await execCommand(
      `peer lifecycle chaincode install --connTimeout 500s /tmp/contracts/${fullLabel}`,
    );
    await this.queryInstalledChaincodes();
  }

  private async getEndorsementPolicy(channelId: string, input?: string) {
    if (input) return input;
    const msps = await this.peerService.getChannelDetails(channelId);
    return `"AND(${msps.map((id) => `'${id.MSPID}.member'`).join(',')})"`;
  }

  async approveContract({
    channelId,
    label,
    version,
    endorsementPolicy,
    caCert,
    sequence,
  }: ApproveContractParams) {
    console.log(`Approving chaincode ${label}_${version}...`);
    const fullLabel = this.createKey(label, version);
    const packageId = await execCommand(
      `peer lifecycle chaincode calculatepackageid /tmp/contracts/${fullLabel}`,
    );
    const innerEndorsementPolicy = await this.getEndorsementPolicy(
      channelId,
      endorsementPolicy,
    );
    if (!fs.existsSync('/tmp/msp/naesb/tls/tls.cert.pem')) {
      if (!fs.existsSync('/tmp/msp/naesb/tls')) {
        fs.mkdirSync('/tmp/msp/naesb/tls', { recursive: true });
      }
      fs.writeFileSync('/tmp/msp/naesb/tls/tls.cert.pem', caCert);
    }
    if (!caCert) {
      throw new Error('CA Cert is not found');
    }

    await execCommand(
      `peer lifecycle chaincode approveformyorg --connTimeout 300s --orderer ${ORDERER_ADDRESS} --init-required --tls --cafile /tmp/msp/naesb/tls/tls.cert.pem --channelID ${channelId} --name ${label} --version ${version} --sequence ${sequence} --package-id ${packageId}`,
    );
    await this.chaincodeRepository.save({
      Label: label,
      Version: version,
      Sequence: sequence,
      ChannelId: channelId,
      Approved_Timestamp: new Date(),
    });
    console.log(
      `Chaincode ${label}_${version} approved for ${channelId} with sequence ${sequence}! `,
    );
    await this.queryApprovedChaincodes(channelId, label);
    await this.checkCommitReadiness({
      channelId,
      label,
      version,
      sequence,
      endorsementPolicy: innerEndorsementPolicy,
    });
  }

  async checkCommitReadiness({
    channelId,
    label,
    version,
    sequence,
    endorsementPolicy,
  }: CheckCommitReadinessParams) {
    console.log(
      `Checking commit readiness for ${label}_${version} sequence ${sequence}... (${endorsementPolicy})`,
    );
    const commitReadiness = await execCommand(
      `peer lifecycle chaincode checkcommitreadiness --connTimeout 300s --orderer ${ORDERER_ADDRESS} --init-required --tls true --cafile /tmp/msp/naesb/tls/tls.cert.pem --channelID ${channelId} --name ${label} --version ${version} --sequence ${sequence} --output json`,
    );
    await this.chaincodeRepository.save({
      Label: label,
      ChannelId: channelId,
      Committed_Timestamp: new Date(),
    });

    const result = (
      typeof commitReadiness === 'string'
        ? JSON.parse(commitReadiness)
        : commitReadiness
    ) as fabprotos.lifecycle.CheckCommitReadinessResult;
    return result;
  }

  async downloadContract(key: string) {
    const dir = `/tmp/contracts`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync('/tmp/contracts');
    }
    if (!fs.existsSync(`/tmp/contracts/${key}`)) {
      const fileContent = await (
        await client.send(
          new GetObjectCommand({
            Bucket: 'naesb-smart-contracts',
            Key: key,
          }),
        )
      ).Body?.transformToByteArray();
      if (fileContent) {
        fs.writeFileSync(`/tmp/contracts/${key}`, fileContent);
      }
    }
  }

  async initChaincode({ peerInfo, label, channelId }: InitChaincodeParams) {
    peerInfo.tlsCerts.forEach((info) => {
      this.mspService.addRootTls(info.id, info.cert);
    });
    const addressInfo = [
      ...peerInfo.peers.map((peer) => `--peerAddresses ${peer}`),
      ...peerInfo.tlsCerts.map(
        (org) => `--tlsRootCertFiles ${this.mspService.getRootTls(org.id)}`,
      ),
    ].join(' ');
    console.log(`Initiating chaincode ${label} on channel ${channelId}...`);
    await execCommand(
      `peer chaincode invoke --connTimeout 300s -o ${ORDERER_ADDRESS} -C ${channelId} -n ${label} --isInit --tls --waitForEvent --cafile /tmp/msp/naesb/tls/tls.cert.pem ${addressInfo} -c '{"function":"'init'","Args":['""']}'`,
    );
    console.log('initiated chaincode');
    await this.chaincodeRepository.save({
      Label: label,
      ChannelId: channelId,
      Initiated_Timestamp: new Date(),
    });
  }

  async commitChaincode({
    channelId,
    label,
    version,
    sequence,
    endorsementPolicy,
    peerInfo,
  }: CommitChaincodeParams) {
    console.log(
      `Committing Chaincode ${label}_${version} sequence ${sequence}...`,
    );
    peerInfo.tlsCerts.forEach((info) => {
      this.mspService.addRootTls(info.id, info.cert);
    });
    const addressInfo = [
      ...peerInfo.peers.map((peer) => `--peerAddresses ${peer}`),
      ...peerInfo.tlsCerts.map(
        (org) => `--tlsRootCertFiles ${this.mspService.getRootTls(org.id)}`,
      ),
    ].join(' ');
    const innerEndorsementPolicy = await this.getEndorsementPolicy(
      channelId,
      endorsementPolicy,
    );
    const commitReadiness = await this.checkCommitReadiness({
      channelId,
      label,
      version,
      sequence,
      endorsementPolicy: innerEndorsementPolicy,
    });
    const approvals = Object.values(commitReadiness.approvals).filter(
      (val) => val,
    ).length;
    if (approvals < Object.entries(commitReadiness.approvals).length)
      throw new Error('Chaincode not ready to be committed');
    const output = await execCommand(
      `peer lifecycle chaincode commit --connTimeout 300s --orderer ${ORDERER_ADDRESS} ${addressInfo} --init-required --channelID ${channelId} --name ${label} --version ${version} --sequence ${sequence} --tls true --cafile /tmp/msp/naesb/tls/tls.cert.pem`,
    );
    await this.queryCommittedChaincodes(channelId);
    this.eventEmitter.emit(`ledger.event.chaincode.${channelId}`, {
      channel_id: channelId,
      name: label,
    });
    return output;
  }
}
