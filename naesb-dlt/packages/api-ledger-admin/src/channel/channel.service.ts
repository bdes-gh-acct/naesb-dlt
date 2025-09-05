import { Injectable } from '@nestjs/common';
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OrganizationYAML, createConfigTx } from '../orderer/configTx';
import axios from 'axios';
import { execCommand } from '../utils/command';
import { ConsulService } from 'src/consul/consul.service';
import { execSync } from 'child_process';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

const NAESB_ORG_ID = 'D000000000';

export interface InitContractParams {
  org: OrganizationYAML;
  label: string;
  organizations: Array<OrganizationYAML>;
  id: string;
  sequence: number;
  version: string;
}

const { NAESB_CONTRACT_LABEL, NAESB_CONTRACT_VERSION, PROFILE_ENDPOINT } =
  process.env;

const ordererDir = `/tmp/msp/${NAESB_ORG_ID}/msp/orderer`;

const OrdererEndpoints = [
  {
    Host: 'orderer.orderer-naesb.service.consul',
    Port: 7050,
    ClientTLSCert: `${ordererDir}/cert.pem`,
    ServerTLSCert: `${ordererDir}/cert.pem`,
  },
];

@Injectable()
export class ChannelService {
  private ready = false;

  constructor(private consulService: ConsulService) {
    this.init();
  }

  private async init() {
    const { tls_cert } = await this.consulService.getServiceCerts(
      'orderer-naesb',
    );
    await this.createOrgMSP(
      NAESB_ORG_ID,
      PROFILE_ENDPOINT,
      'http://ca-naesb.service.consul:8080',
    );

    fs.mkdirSync(ordererDir, { recursive: true });
    fs.writeFileSync(`${ordererDir}/cert.pem`, tls_cert);
    this.ready = true;
  }
  isReady() {
    return this.ready;
  }

  private async createOrgMSP(
    ORG_ID: string,
    endpoint?: string,
    caEndpoint?: string,
  ) {
    console.log(
      `Creating MSP for organization: ${ORG_ID}.  Endpoint: ${endpoint}. CA: ${caEndpoint}`,
    );
    const dir = `/tmp/msp/${ORG_ID}`;
    const MSP_CA_DIR = `${dir}/ca`;
    const MSP_CERT_DIR = `${dir}/msp`;
    const TLS_CERT_DIR = `${dir}/tls`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      fs.mkdirSync(MSP_CA_DIR, { recursive: true });
      fs.mkdirSync(MSP_CERT_DIR, { recursive: true });
      fs.mkdirSync(`${MSP_CERT_DIR}/cacerts`, { recursive: true });
      fs.mkdirSync(`${MSP_CERT_DIR}/signcerts`, { recursive: true });
      fs.mkdirSync(`${MSP_CERT_DIR}/tlscacerts`, { recursive: true });
      fs.mkdirSync(`${MSP_CERT_DIR}/keystore`, { recursive: true });
      fs.mkdirSync(TLS_CERT_DIR, { recursive: true });

      const CA_PATH = `ca.cert.pem`;
      const CA_CERT_PATH = `cacerts/${CA_PATH}`;
      const TLS_PATH = `tls.cert.pem`;
      const TLS_CERT_PATH = `tlscacerts/${TLS_PATH}`;
      const config = yaml.stringify({
        NodeOUs: {
          Enable: true,
          ClientOUIdentifier: {
            Certificate: CA_CERT_PATH,
            OrganizationalUnitIdentifier: 'client',
          },
          PeerOUIdentifier: {
            Certificate: CA_CERT_PATH,
            OrganizationalUnitIdentifier: 'peer',
          },
          AdminOUIdentifier: {
            Certificate: CA_CERT_PATH,
            OrganizationalUnitIdentifier: 'admin',
          },
          OrdererOUIdentifier: {
            Certificate: CA_CERT_PATH,
            OrganizationalUnitIdentifier: 'orderer',
          },
        },
      });
      fs.writeFileSync(`${MSP_CERT_DIR}/config.yaml`, config);
      if (caEndpoint) {
        const mspCertificateResponse = (
          await axios.post(`${caEndpoint}/api/ca/v1/msp/certs`, {
            role: 'admin',
            name: 'admin',
          })
        ).data;
        const tlsCertificateResponse = (
          await axios.post(`${caEndpoint}/api/ca/v1/tls/certs`, {
            role: 'admin',
            name: 'admin',
          })
        ).data;
        const issuing_ca = mspCertificateResponse.data.issuing_ca;
        const tls_issuing_ca = tlsCertificateResponse.data.issuing_ca;

        // put issuing CAs for MSP and TLS
        fs.writeFileSync(`${MSP_CA_DIR}/${CA_PATH}`, issuing_ca);
        fs.writeFileSync(`${MSP_CERT_DIR}/${CA_CERT_PATH}`, issuing_ca);
        fs.writeFileSync(`${TLS_CERT_DIR}/${TLS_PATH}`, tls_issuing_ca);
        fs.writeFileSync(`${MSP_CERT_DIR}/${TLS_CERT_PATH}`, tls_issuing_ca);

        // put actual cert into msp
        const certificate = mspCertificateResponse.data.certificate;
        const key = mspCertificateResponse.data.private_key;
        fs.writeFileSync(`${MSP_CERT_DIR}/signcerts/cert.pem`, certificate);
        fs.writeFileSync(`${MSP_CERT_DIR}/keystore/priv_key`, key);

        const tlsCertificate = tlsCertificateResponse.data.certificate;
        const tls_key = tlsCertificateResponse.data.private_key;
        const TLS_PUBLIC_CERT_PATH = 'server.crt';
        const TLS_KEY_PATH = 'server.key';
        fs.writeFileSync(
          `${TLS_CERT_DIR}/${TLS_PUBLIC_CERT_PATH}`,
          tlsCertificate + '\n',
        );
        fs.writeFileSync(`${TLS_CERT_DIR}/${TLS_KEY_PATH}`, tls_key);
      } else {
        const { tlsCa, mspCa } = (
          await axios.get(`${endpoint}/api/core/v1/.well-known/nodeinfo`)
        ).data;
        // put issuing CAs for MSP and TLS
        fs.writeFileSync(`${MSP_CA_DIR}/${CA_PATH}`, mspCa);
        fs.writeFileSync(`${MSP_CERT_DIR}/${CA_CERT_PATH}`, mspCa);
        fs.writeFileSync(`${TLS_CERT_DIR}/${TLS_PATH}`, tlsCa);
        fs.writeFileSync(`${MSP_CERT_DIR}/${TLS_CERT_PATH}`, tlsCa);
      }
    }
    console.log(
      `All done.`,
    );
  }

  async createMsp(id: string, endpoint: string, root?: boolean) {
    const CONFIG_PATH = `/tmp/msp/${id}`;
    if (!fs.existsSync(CONFIG_PATH)) {
      await this.createMsp(id, endpoint, root);
    }
  }

  private async joinChannel(
    org: OrganizationYAML,
    id: string,
    additionalInfo?: { parties: Array<{ name: string; msp: string }> },
  ) {
    console.log(`Joining ${org.Name} to channel ${id}...`);
    await axios.post(`${org.Endpoint}/api/ledger/v1/channels/join`, {
      channelId: id,
      configTx: fs
        .readFileSync(`/tmp/channels/${id}/genesis_block.pb`)
        .toString('base64'),
      additionalInfo,
    });
    console.log(`Joined ${org.Name} to channel ${id}!`);
  }

  private async approveContract(
    org: OrganizationYAML,
    id: string,
    label: string,
    version: string,
    sequence: number,
    endorsementPolicy: string,
  ) {
    console.log(
      `Approving ${label}_${version}  for ${org.Name} on channel ${id}...`,
    );
    await axios.post(
      `${org.Endpoint}/api/ledger/v1/channels/${id}/contracts/approve`,
      {
        label,
        version,
        sequence,
        endorsementPolicy,
        caCert: fs
          .readFileSync(`/tmp/msp/${NAESB_ORG_ID}/tls/tls.cert.pem`)
          .toString('utf8'),
      },
    );
    console.log(
      `Approved contract ${label}_${version} for ${org.Name} on channel ${id}!`,
    );
  }

  private async commitContract(
    org: OrganizationYAML,
    organizations: Array<OrganizationYAML>,
    id: string,
    label: string,
    version: string,
    sequence: number,
    endorsementPolicy: string,
  ) {
    console.log(
      `Committing ${label}_${version}  for ${org.Name} on channel ${id}...`,
    );
    await axios.post(
      `${org.Endpoint}/api/ledger/v1/channels/${id}/contracts/commit`,
      {
        label,
        version,
        sequence,
        peerInfo: this.getPeerInfo(organizations),
        endorsementPolicy,
      },
    );
    console.log(
      `Committed contract ${label}_${version} for ${org.Name} on channel ${id}!`,
    );
  }

  private async initContract({
    org,
    label,
    organizations,
    id,
    sequence,
    version = process.env.NAESB_CONTRACT_VERSION,
  }: InitContractParams) {
    console.log(
      `Initializing ${label}_${version}  for ${org.Name} on channel ${id}...`,
    );
    await axios.post(
      `${org.Endpoint}/api/ledger/v1/channels/${id}/contracts/init`,
      {
        label,
        version,
        sequence,
        peerInfo: this.getPeerInfo(organizations),
      },
    );
    console.log(
      `Initialized contract ${label}_${version} for ${org.Name} on channel ${id}!`,
    );
  }

  private getPeerInfo(orgs: Array<OrganizationYAML>) {
    const peers = orgs
      .map((org) => org.AnchorPeers.map((peer) => `${peer.Host}:${peer.Port}`))
      .flat();
    const tlsCerts = orgs
      .map((org) => ({
        cert: fs
          .readFileSync(`/tmp/msp/${org.ID}/tls/tls.cert.pem`)
          .toString('utf8'),
        id: org.ID,
      }))
      .flat();
    return { peers, tlsCerts };
  }

  async createChannel(id: string, members: Array<OrganizationYAML>) {
    console.log(
      `Starting channel creation.`,
    );
    await Promise.all(
      members.map(async (org) => {
        return this.createOrgMSP(org.ID, org.Endpoint);
      }),
    );
    console.log(
      `Finished msp creation.`,
    );
    const organizations = [
      {
        Name: NAESB_ORG_ID,
        ID: NAESB_ORG_ID,
        Endpoint: PROFILE_ENDPOINT,
        AnchorPeers: [{ Host: 'peer0.peer-naesb.service.consul', Port: 9051 }],
        OrdererEndpoints,
      },
      ...members,
    ];

    const CONFIG_PATH = `/tmp/channels/${id}`;
    if (!fs.existsSync(CONFIG_PATH)) {
      fs.mkdirSync(CONFIG_PATH, { recursive: true });
      console.log(
      `Creating configtx file`,
      );
      const config = createConfigTx(organizations);
      fs.writeFileSync(
        `/tmp/channels/${id}/configtx.yaml`,
        config.doc.toString(),
      );
    }

    console.log(`Creating configTx for ${id}`);
    console.log(`${CONFIG_PATH}/configtx.yaml`);
    const filePath: string = `${CONFIG_PATH}/configtx.yaml`;
    try {
    // Read the file content
      const originalContent: string = fs.readFileSync(filePath, 'utf8');

      console.log('Orginal file: ');
      console.log(originalContent);
      // Replace all occurrences of '"<<",' with '<<'
      // The double quote needs to be escaped in the regex if it's part of the literal match
      const modifiedContent: string = originalContent.replace(/"<<"/g, '<<');

      // Write the modified content back to the file
      fs.writeFileSync(filePath, modifiedContent, 'utf8');

      console.log('Replacement successful!');
    } catch (error) {
      console.error('Error during file operation:', error);
    }
    fs.readFile(`${CONFIG_PATH}/configtx.yaml`, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
      console.log('New file content:');
      console.log(data);
    });
    const configdata = fs.readFileSync(`${CONFIG_PATH}/configtx.yaml`, { encoding: 'utf8', flag: 'r' });
    const configcommand = new PutObjectCommand({
      Bucket: "naesb-smart-contracts",
      Key: "configtx.yaml",
      Body: configdata
    });
    try {
      const data = await s3Client.send(configcommand);
      console.log("Success!", data);
    } catch (error) {
      console.error("Error uploading object:", error);
    }
    const cmdout = execSync(`configtxgen -profile TradeChannel -configPath="${CONFIG_PATH}" -channelID ${id} -outputBlock="/tmp/channels/${id}/genesis_block.pb"`, {stdio: 'pipe'}).toString();
    console.log(`Configtxgen output: ${cmdout}`);
    // await execCommand(
    //   `configtxgen -profile TradeChannel -configPath="${CONFIG_PATH}" -channelID ${id} -outputBlock="/tmp/channels/${id}/genesis_block.pb"`
    // );
    console.log(`Listing genesis block.`);
    await execCommand(`ls /tmp/channels/${id}`);
    let path = `/tmp/channels/${id}/genesis_block.pb`;

    fs.lstat(path, (err, stats) => {

      if(err)
          return console.log(err); //Handle error

      console.log(`Is file: ${stats.isFile()}`);
    });

    const data = fs.readFileSync(`/tmp/channels/${id}/genesis_block.pb`, { encoding: 'utf8', flag: 'r' });
    const command = new PutObjectCommand({
      Bucket: "naesb-smart-contracts",
      Key: "genesis_block.pb",
      Body: data
    });
    try {
      const data = await s3Client.send(command);
      console.log("Success!", data);
    } catch (error) {
      console.error("Error uploading object:", error);
    }

    console.log(`Inspecting genesis block.`);
    const inspectout = execSync(`configtxgen -inspectBlock /tmp/channels/${id}/genesis_block.pb`);
    console.log(`Genesis block inspect output: ${inspectout.toString()}`);
    console.log(`Joining orderer for ${id}`);
    await execCommand(
      `osnadmin channel join -o orderer.orderer-naesb.service.consul:7080 --channelID=${id} --config-block=/tmp/channels/${id}/genesis_block.pb --ca-file /tmp/msp/${NAESB_ORG_ID}/tls/tls.cert.pem --client-cert /tmp/msp/${NAESB_ORG_ID}/tls/server.crt --client-key /tmp/msp/${NAESB_ORG_ID}/tls/server.key`
    );

    await Promise.all(
      organizations.map((org) =>
        this.joinChannel(org, id, {
          parties: organizations
            .filter((org) => org.ID !== NAESB_ORG_ID)
            .map((org) => ({ msp: org.ID, name: org.Name })),
        }),
      ),
    );
    const endorsementPolicy = `"AND(${organizations
      .map((id) => `'${id.ID}.member'`)
      .join(',')})"`;
    await Promise.all(
      organizations.map((org) =>
        this.approveContract(
          org,
          id,
          NAESB_CONTRACT_LABEL,
          NAESB_CONTRACT_VERSION,
          1,
          endorsementPolicy,
        ),
      ),
    );
    await this.commitContract(
      organizations[0],
      organizations,
      id,
      NAESB_CONTRACT_LABEL,
      NAESB_CONTRACT_VERSION,
      1,
      endorsementPolicy,
    );
    await this.initContract({
      organizations,
      org: organizations[0],
      id,
      sequence: 1,
      label: NAESB_CONTRACT_LABEL,
      version: NAESB_CONTRACT_VERSION,
    });
  }
}
