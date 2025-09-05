import { Injectable } from '@nestjs/common';
import { VaultService } from 'src/vault/vault.service';
import * as yaml from 'yaml';
import * as fs from 'fs';
import { ConsulService } from 'src/consul/consul.service';
import { OrganizationYAML, createConfigTx } from './configTx';
import { execCommand } from 'src/utils/command';

@Injectable()
export class OrdererService {
  private ready = false;
  constructor(
    private readonly vaultService: VaultService,
    private consulService: ConsulService,
  ) {
    // this.init();
  }

  private async createOrgMSP(ORG_NAME: string, ORG_ID: string, type: string) {
    const MSP_MOUNT_PATH = `${ORG_ID}/msp`;
    const TLS_MOUNT_PATH = `${ORG_ID}/tls`;
    const dir = `/tmp/msp/${ORG_NAME}`;
    const MSP_CA_DIR = `${dir}/mspca`;
    const MSP_CERT_DIR = `${dir}/msp`;
    const TLS_CERT_DIR = `${dir}/tls`;
    const MSPDIR_PATH = `${dir}/${type}/msp`;
    if (!fs.existsSync(MSP_CA_DIR)) {
      fs.mkdirSync(MSP_CA_DIR, { recursive: true });
      fs.mkdirSync(MSP_CERT_DIR, { recursive: true });
    }
    if (!fs.existsSync(`${MSP_CERT_DIR}/cacerts`)) {
      fs.mkdirSync(MSP_CERT_DIR, { recursive: true });
      fs.mkdirSync(`${MSP_CERT_DIR}/cacerts`, { recursive: true });
      fs.mkdirSync(`${MSP_CERT_DIR}/tlscacerts`, { recursive: true });
    }
    if (!fs.existsSync(`${MSPDIR_PATH}/cacerts`)) {
      fs.mkdirSync(MSPDIR_PATH, { recursive: true });
      fs.mkdirSync(`${MSPDIR_PATH}/cacerts`, { recursive: true });
      fs.mkdirSync(`${MSPDIR_PATH}/signcerts`, { recursive: true });
      fs.mkdirSync(`${MSPDIR_PATH}/tlscacerts`, { recursive: true });
    }
    if (!fs.existsSync(TLS_CERT_DIR)) {
      fs.mkdirSync(TLS_CERT_DIR, { recursive: true });
    }
    if (!fs.existsSync(`${MSP_CA_DIR}/cacerts`)) {
      fs.mkdirSync(`${MSP_CA_DIR}/cacerts`, { recursive: true });
    }
    if (!fs.existsSync(`${MSP_CA_DIR}/signcerts`)) {
      fs.mkdirSync(`${MSP_CA_DIR}/signcerts`, { recursive: true });
    }
    if (!fs.existsSync(`${MSP_CA_DIR}/keystore`)) {
      fs.mkdirSync(`${MSP_CA_DIR}/keystore`, { recursive: true });
    }
    if (!fs.existsSync(`${MSP_CA_DIR}/tlscacerts`)) {
      fs.mkdirSync(`${MSP_CA_DIR}/tlscacerts`, { recursive: true });
    }
    const CA_CERT_PATH = `cacerts/ca.${ORG_NAME}.naesbdlt.org-cert.pem`;
    const TLS_CERT_PATH = `tlscacerts/tlsca.${ORG_NAME}.naesbdlt.org-cert.pem`;
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
    fs.writeFileSync(`${MSP_CA_DIR}/config.yaml`, config);
    fs.writeFileSync(`${MSPDIR_PATH}/config.yaml`, config);
    const mspCertificateResponse: any = await this.createCert(
      MSP_MOUNT_PATH,
      'admin',
      `admin@${ORG_NAME}.`,
    );
    const tlsCertificateResponse: any = await this.createCert(
      TLS_MOUNT_PATH,
      'admin',
      `admin@${ORG_NAME}.`,
    );
    const issuing_ca = mspCertificateResponse.data.issuing_ca;
    const tls_issuing_ca = tlsCertificateResponse.data.issuing_ca;
    // put issuing CAs for MSP and TLS
    fs.writeFileSync(`${MSP_CA_DIR}/${CA_CERT_PATH}`, issuing_ca);
    fs.writeFileSync(`${MSPDIR_PATH}/${CA_CERT_PATH}`, issuing_ca);
    fs.writeFileSync(`${MSP_CA_DIR}/${TLS_CERT_PATH}`, tls_issuing_ca);
    fs.writeFileSync(`${MSPDIR_PATH}/${TLS_CERT_PATH}`, tls_issuing_ca);

    // put actual cert into msp
    fs.writeFileSync(`${MSP_CERT_DIR}/${CA_CERT_PATH}`, issuing_ca);
    fs.writeFileSync(`${MSP_CERT_DIR}/${TLS_CERT_PATH}`, tls_issuing_ca);
    const certificate = mspCertificateResponse.data.certificate;
    fs.writeFileSync(`${MSP_CA_DIR}/signcerts/cert.pem`, certificate);
    const key = mspCertificateResponse.data.private_key;
    fs.writeFileSync(`${MSP_CA_DIR}/keystore/priv_key`, key);

    const TLS_CA_PATH = 'tls.cert.pem';
    // put actual cert into tls
    fs.writeFileSync(`${TLS_CERT_DIR}/${TLS_CA_PATH}`, tls_issuing_ca);
    const TLS_PUBLIC_CERT_PATH = 'cert.pem';
    const tlsCertificate = tlsCertificateResponse.data.certificate;
    fs.writeFileSync(
      `${TLS_CERT_DIR}/${TLS_PUBLIC_CERT_PATH}`,
      tlsCertificate + '\n',
    );
    const TLS_KEY_PATH = 'key.pem';
    const tls_key = tlsCertificateResponse.data.private_key;
    fs.writeFileSync(`${TLS_CERT_DIR}/${TLS_KEY_PATH}`, tls_key);
    // fs.writeFileSync(`${MSPDIR_PATH}/signcerts/cert.pem`, ca_cert);
  }

  private async init() {
    const dir = `/tmp/msp/naesb`;
    const ORDERER_CERT_DIR = `${dir}/orderer`;
    const CONFIG_PATH = '/tmp/admin/config';
    if (!fs.existsSync(CONFIG_PATH)) {
      fs.mkdirSync(CONFIG_PATH, { recursive: true });
    }
    if (!fs.existsSync(ORDERER_CERT_DIR)) {
      fs.mkdirSync(ORDERER_CERT_DIR, { recursive: true });
    }
    await this.createOrgMSP('naesb', 'org_Zq88NZfnjTsOu2II', 'peer');
    await this.createOrgMSP('spire', 'org_N3LsIPXJkZqD5QD4', 'peer');
    await this.createOrgMSP('tva', 'org_ZVg6j5mzxBltGrJJ', 'peer');
    const { tls_cert } = await this.consulService.getServiceCerts(
      'orderer-naesb',
    );
    fs.writeFileSync(`${ORDERER_CERT_DIR}/cert.pem`, tls_cert);
    // fs.writeFileSync(`${dir}/mspca/signcerts/cert.pem`, ordererCert);
    await execCommand(
      `configtxgen -profile SpireTVAChannel -configPath="/opt/app-root/packages/api-ledger-admin/config" -channelID spire-tva -outputBlock /tmp/msp/genesis_block.pb`,
    );
    await execCommand(
      `osnadmin channel join -o orderer.orderer-naesb.service.consul:7080 --channelID=spire-tva --config-block=/tmp/msp/genesis_block.pb --ca-file /tmp/msp/naesb/tls/tls.cert.pem --client-cert /tmp/msp/naesb/tls/cert.pem --client-key /tmp/msp/naesb/tls/key.pem`,
    );
    await this.joinPeer('naesb', 'D000000000', 'org_Zq88NZfnjTsOu2II', 9051);
    await this.joinPeer('spire', 'D188779862', 'org_N3LsIPXJkZqD5QD4', 9051);
    await this.joinPeer('tva', 'D001883032', 'org_ZVg6j5mzxBltGrJJ', 9051);
    await this.deployChaincode('trade', '/contracts/trade');
    console.log('ready');
    this.ready = true;
  }

  async deployChaincode(label: string, path: string) {
    await execCommand(
      `CHANNEL_NAME=spire-tva CC_PATH=${path} CC_LANGUAGE=node CC_LABEL=${label} CC_VERSION=0.1 /opt/app-root/packages/api-ledger-admin/scripts/chaincode.sh package`,
    );
    await execCommand(
      `UNIX_SOCK=/var/run/docker.sock CHANNEL_NAME=spire-tva PEERORGLIST=\"naesb spire tva\" CC_LABEL=${label} CC_VERSION=0.1 /opt/app-root/packages/api-ledger-admin/scripts/chaincode.sh install`,
    );
    await execCommand(
      `UNIX_SOCK=/var/run/docker.sock CHANNEL_NAME=spire-tva NUM_ORGS_IN_CHANNEL=3 PEERORGLIST=\"naesb spire tva\" CC_LABEL=${label} CC_VERSION=0.1 /opt/app-root/packages/api-ledger-admin/scripts/chaincode.sh approve`,
    );
    await execCommand(
      `CHANNEL_NAME=spire-tva NUM_ORGS_IN_CHANNEL=3 PEERORGLIST=\"naesb spire tva\" CC_LABEL=${label} CC_VERSION=0.1 /opt/app-root/packages/api-ledger-admin/scripts/chaincode.sh commit`,
    );
    await execCommand(
      `CHANNEL_NAME=spire-tva PEERORGLIST=\"naesb spire tva\" CC_LABEL=${label} CC_FUNCTION=init CC_ARGS=\"\" /opt/app-root/packages/api-ledger-admin/scripts/chaincode.sh init`,
    );
  }

  async joinPeer(
    org_name: string,
    org_msp: string,
    org_id: string,
    port: number,
  ) {
    console.log(`Joining ${org_name} to channel...`);
    await execCommand(
      `bash /opt/app-root/packages/api-ledger-admin/scripts/joinChannel.sh ${org_name} ${org_id} /tmp/msp/genesis_block.pb ${org_msp} ${port}`,
    );
  }

  async createChannel(id: string, organizations: Array<OrganizationYAML>) {
    const CONFIG_PATH = `/tmp/channels/${id}`;
    if (!fs.existsSync(CONFIG_PATH)) {
      fs.mkdirSync(CONFIG_PATH, { recursive: true });
      const config = createConfigTx(organizations);
      fs.writeFileSync(
        `/tmp/channels/${id}/configtx.yaml`,
        config.doc.toString(),
      );
    }
  }

  isReady() {
    return this.ready;
  }

  async createCert(path: string, role: string, name: string) {
    return await this.vaultService.generateCert(path, role, name);
  }
}
