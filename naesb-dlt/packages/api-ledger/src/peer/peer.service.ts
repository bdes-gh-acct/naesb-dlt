/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as yaml from 'yaml';
import * as fs from 'fs';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { MspService } from './msp.service';
import { env } from '../env';

const client = new S3Client({ region: 'us-east-1' });

const execAsync = promisify(exec);

export interface ApproveContractParams {
  channelId: string;
  caCert?: string;
  label: string;
  version?: string;
  sequence?: number;
  endorsementPolicy?: string;
}

export interface CheckCommitReadinessParams {
  channelId: string;
  label: string;
  version?: string;
  sequence?: number;
  endorsementPolicy?: string;
}

const { CORE_PEER_ADDRESS, ORG_MSP_ID } = env;

export const execCommand = async (command: string) => {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.error(stderr);
    }
    return stdout;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

@Injectable()
export class PeerService {
  constructor(private mspService: MspService) {}

  async joinPeer(id: string, path: string) {
    console.log(`Joining channel ${id}...`);
    await execCommand(
      `bash /opt/app-root/packages/api-ledger/scripts/joinChannel.sh ${path}`,
    );
    console.log(`Successfully joined channel ${id}!`);
  }

  async queryChannels() {
    console.log('Querying channels...');
    await execCommand(`peer channel list`);
  }

  async getChannelInfo(id: string) {
    console.log(`Getting info for channel ${id}...`);
    const result = await execCommand(`peer channel getinfo --channelID ${id}`);
    return result;
  }

  async getChannelDetails(id: string) {
    console.log(`Getting details for channel ${id}...`);
    const dir = `/tmp/discovery`;
    const key = `conf.yaml`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    if (!fs.existsSync(`${dir}/${key}`)) {
      const config = yaml.stringify({
        version: 0,
        tlsconfig: {
          certpath: '',
          keypath: '',
          peercacertpath: this.mspService.getRootTls(ORG_MSP_ID),
          timeout: '30s',
        },
        signerconfig: {
          mspid: ORG_MSP_ID,
          identitypath: this.mspService.getSignCertPath(ORG_MSP_ID),
          keypath: this.mspService.getSignKeyPath(ORG_MSP_ID),
        },
      });
      fs.writeFileSync(`${dir}/${key}`, config);
    }
    const result = JSON.parse(
      await execCommand(
        `discover --configFile ${dir}/${key} peers --channel ${id}  --server ${CORE_PEER_ADDRESS}`,
      ),
    );
    console.log(`${result.length} MSPs found on channel ${id}`);
    console.log(`MSPs:`, result.map((r: any) => r.MSPID));
    return result as Array<{
      MSPID: string;
      LedgerHeight: number;
      Endpoint: string;
      Identity: string;
      Chaincodes: Array<string>;
    }>;
  }

  createKey(label: string, version: string) {
    return `${label}_${version}.tar.gz`;
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
}
