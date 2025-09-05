import { HttpService } from '@shared/server-utils';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { UserService } from 'src/user/user.service';
import { throwError } from 'src/utils/error-utils';
import { saveFile } from 'src/utils/file-utils';
import { readFile } from '../utils/file-utils';
import {
  vaultGenerateRootResDto,
  vaultLoginReqDto,
  vaultLoginResDto,
  vaultNewCertResDto,
} from '../user/dtos/vault.dto';
import { tlsCertPackageDto } from './dtos/server.dto';

@Injectable()
export class ServerService {
  constructor(
    private httpService: HttpService,
    private userService: UserService,
  ) {}
  private vaultUrl = `${process.env.VAULT_ADDR}`;
  private vaultPkiUrlBase = `${process.env.VAULT_ADDR}/${process.env.ORG_NAME}/${process.env.ORG_ID}/server`;
  private certFilepathBase = `${process.env.CERT_FILE_PATH}`;

  async generateServerCreds(loginDto: vaultLoginReqDto): Promise<string> {
    return this.checkVaultHealth().then(async (result: number) => {
      if (result === 200) {
        return this.handleRootCert(loginDto);
      } else {
        throw new Error('Vault is not healthy');
      }
    });
  }

  async checkVaultHealth() {
    const url = `${this.vaultUrl}/v1/sys/health`;
    try {
      return (await this.httpService.get<number>(url)).status;
    } catch (e) {
      throwError(e, url);
    }
  }

  async handleRootCert(loginDto: vaultLoginReqDto) {
    if (this.isUserAdmin(loginDto)) {
      return this.userService
        .loginToVault(loginDto)
        .then(async (result: vaultLoginResDto) => {
          if (result.auth.client_token) {
            const vault_token = result.auth.client_token;
            return this.generateRootCert(loginDto, vault_token).then(
              async (result: vaultGenerateRootResDto) => {
                if (result.warnings) {
                  throw new Error('A valid root certificate already exists');
                }
                // save the root cert
                saveFile(
                  `${this.certFilepathBase}/ca.crt`,
                  result.data.certificate,
                );

                return this.generateTlsCert(vault_token).then(
                  async (result: vaultNewCertResDto) => {
                    // save the public cert
                    saveFile(
                      `${this.certFilepathBase}/server.crt`,
                      result.data.certificate,
                    );
                    // save the private key
                    saveFile(
                      `${this.certFilepathBase}/server.key`,
                      result.data.private_key,
                    );
                    return 'Server certificates created successfully.';
                  },
                );
              },
            );
          } else {
            throw new Error('User is not authorized to login to Vault');
          }
        });
    } else {
      throw new Error('User does not have sufficient privelages.');
    }
  }

  async generateRootCert(loginDto: vaultLoginReqDto, vault_token: string) {
    const url = `${this.vaultPkiUrlBase}/root/generate/internal`;
    const payload = {
      common_name: `${process.env.CA_COMMON_NAME}`,
      ttl: '87600h',
      country: `${process.env.COUNTRY}`,
      province: `${process.env.STATE}`,
      locality: `${process.env.CITY}`,
      organization: `${process.env.COMMON_NAME}`,
    };
    const headers = { 'X-Vault-Token': vault_token };
    try {
      return (
        await this.httpService.post<any>(url, payload, { headers: headers })
      ).data;
    } catch (e) {
      throwError(e, url);
    }
  }

  async generateTlsCert(vault_token: string) {
    const url = `${this.vaultPkiUrlBase}/issue/admin`;
    const payload = {
      common_name: `${process.env.CA_COMMON_NAME}`,
      ttl: '87590h',
      country: `${process.env.COUNTRY}`,
      province: `${process.env.STATE}`,
      locality: `${process.env.CITY}`,
      organization: `${process.env.COMMON_NAME}`,
    };
    const headers = { 'X-Vault-Token': vault_token };

    try {
      return await (
        await this.httpService.post<any>(url, payload, {
          headers: headers,
        })
      ).data;
    } catch (e) {
      throwError(e, url);
    }
  }

  async getTlsCert() {
    const payload: tlsCertPackageDto = {
      ca: readFile(`${this.certFilepathBase}/ca.crt`),
      serverCert: readFile(`${this.certFilepathBase}/server.crt`),
      serverPk: readFile(`${this.certFilepathBase}/server.key`),
    };
    return payload;
  }

  isUserAdmin(loginDto: vaultLoginReqDto): boolean {
    return loginDto.role.includes(`${process.env.ADMIN_ROLE_STRING}`);
  }
}
