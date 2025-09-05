/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { CaService } from '../ca/ca.service';

@Injectable()
export class MspService {
  constructor(private caService: CaService) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
  }

  tlsExtension = '/tls';

  tlsPath = `tls.cert.pem`;

  private createMspRootDir(orgId: string) {
    return `/tmp/msp/${orgId}`;
  }

  getSignCertPath(orgId: string) {
    return `${this.createMspRootDir(orgId)}/msp/signcerts/cert.pem`;
  }

  getSignKeyPath(orgId: string) {
    return `${this.createMspRootDir(orgId)}/msp/keystore/priv_key`;
  }

  addRootTls(orgId: string, cert: string) {
    const tlsDir = `${this.createMspRootDir(orgId)}${this.tlsExtension}`;
    if (!fs.existsSync(`${tlsDir}/${this.tlsPath}`)) {
      if (!fs.existsSync(tlsDir)) {
        fs.mkdirSync(tlsDir, { recursive: true });
      }
      fs.writeFileSync(`${tlsDir}/${this.tlsPath}`, cert);
    }
  }

  getRootTls(orgId: string) {
    const path = `${this.createMspRootDir(orgId)}${this.tlsExtension}/${
      this.tlsPath
    }`;
    if (!fs.existsSync(path)) {
      throw new Error('TLS cert not found for this org');
    }
    return path;
  }

  async createOrgMSP(ORG_ID: string) {
    console.log(`Creating MSP for ${ORG_ID}`);
    const dir = this.createMspRootDir(ORG_ID);
    const MSP_CA_DIR = `${dir}/ca`;
    const MSP_CERT_DIR = `${dir}/msp`;
    const TLS_CERT_DIR = `${dir}${this.tlsExtension}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      fs.mkdirSync(MSP_CA_DIR, { recursive: true });
      fs.mkdirSync(MSP_CERT_DIR, { recursive: true });
      fs.mkdirSync(`${MSP_CERT_DIR}/cacerts`, { recursive: true });
      fs.mkdirSync(`${MSP_CERT_DIR}/signcerts`, { recursive: true });
      fs.mkdirSync(`${MSP_CERT_DIR}/tlscacerts`, { recursive: true });
      fs.mkdirSync(`${MSP_CERT_DIR}/keystore`, { recursive: true });
      fs.mkdirSync(TLS_CERT_DIR, { recursive: true });
    }
    const CA_PATH = `ca.cert.pem`;
    const CA_CERT_PATH = `cacerts/${CA_PATH}`;
    const TLS_PATH = this.tlsPath;
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
    const mspCertificateResponse = await this.caService.createUser(
      'admin',
      'admin',
    );
    const tlsCertificateResponse = await this.caService.createTlsCert(
      'admin',
      'admin',
    );
    const { issuing_ca } = mspCertificateResponse;
    const tls_issuing_ca = tlsCertificateResponse.issuing_ca;

    // put issuing CAs for MSP and TLS
    fs.writeFileSync(`${MSP_CA_DIR}/${CA_PATH}`, issuing_ca);
    fs.writeFileSync(`${MSP_CERT_DIR}/${CA_CERT_PATH}`, issuing_ca);
    fs.writeFileSync(`${TLS_CERT_DIR}/${TLS_PATH}`, tls_issuing_ca);
    fs.writeFileSync(`${MSP_CERT_DIR}/${TLS_CERT_PATH}`, tls_issuing_ca);

    // put actual cert into msp
    const { certificate } = mspCertificateResponse;
    const key = mspCertificateResponse.private_key;
    fs.writeFileSync(`${MSP_CERT_DIR}/signcerts/cert.pem`, certificate);
    fs.writeFileSync(`${MSP_CERT_DIR}/keystore/priv_key`, key);

    const tlsCertificate = tlsCertificateResponse.certificate;
    const tls_key = tlsCertificateResponse.private_key;
    const TLS_PUBLIC_CERT_PATH = 'server.crt';
    const TLS_KEY_PATH = 'server.key';
    fs.writeFileSync(
      `${TLS_CERT_DIR}/${TLS_PUBLIC_CERT_PATH}`,
      `${tlsCertificate}\n`,
    );
    fs.writeFileSync(`${TLS_CERT_DIR}/${TLS_KEY_PATH}`, tls_key);
    console.log(`MSP created for ${ORG_ID}`);
  }
}
