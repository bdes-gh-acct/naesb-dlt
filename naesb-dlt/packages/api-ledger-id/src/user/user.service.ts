/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  vaultLoginReqDto,
  vaultLoginResDto,
  vaultGetCertResDto,
  vaultTidyResDto,
  vaultBaseResDto,
  vaultRevokeResDto,
} from './dtos/vault.dto';
import {
  vaultNewCertResDto,
  certificateDataDto,
  vaultTidyReqDto,
} from './dtos/vault.dto';
import { TLSSocket, createSecureContext } from 'tls';
import * as net from 'net';
import { throwError } from 'src/utils/error-utils';
import { authTokenResDto, authUpdateUserDto } from './dtos/auth0.dto';

@Injectable()
export class UserService {
  constructor(private httpService: HttpService) {}
  public vault_token: string;
  public user_cert: certificateDataDto;
  private vaultLoginUrl = `${process.env.VAULT_ADDR}/auth/jwt/login`;
  private vaultPkiUrlBase = `${process.env.VAULT_ADDR}/${process.env.ORG_NAME}/${process.env.ORG_ID}/client`;
  private vaultKvUrlBase = `${process.env.VAULT_ADDR}/kv/${process.env.ORG_NAME}/${process.env.ORG_ID}`;
  private auth0BaseUrl = `${process.env.TOKEN_AUDIENCE}`;
  private auth0TokenUrl = `${process.env.AUTH0_TOKEN_URL}`;

  async loginToVault(loginDto: vaultLoginReqDto): Promise<vaultLoginResDto> {
    const url = this.vaultLoginUrl;
    const payload: vaultLoginReqDto = {
      jwt: loginDto.jwt,
      role: loginDto.role,
    };

    try {
      return (
        await lastValueFrom(
          this.httpService.post<vaultLoginResDto>(url, payload),
        )
      ).data;
    } catch (e) {
      throwError(e, url, 'Unable to login to vault');
    }
  }

  async getCertificate(loginDto: vaultLoginReqDto) {
    return this.loginToVault(loginDto).then(
      async (result: vaultLoginResDto) => {
        if (result.auth.client_token && this.isUserReader(loginDto)) {
          const vault_token = result.auth.client_token;

          if (loginDto.certId) {
            return this.retrieveExistingCert(loginDto).then(
              (res: vaultGetCertResDto) => {
                if (this.checkIfCertIsExpired(res.data.certificate)) {
                  this.revokeExistingCert(vault_token, loginDto.certId);
                  return this.returnNewCert(vault_token, loginDto);
                } else {
                  this.user_cert = {
                    certificate: res.data.certificate,
                  };
                  return this.user_cert;
                }
              },
            );
          } else {
            return this.returnNewCert(vault_token, loginDto);
          }
        } else {
          throw new Error('User is not authorized to login to Vault');
        }
      },
    );
  }

  async tidyVault(loginDto: vaultLoginReqDto): Promise<vaultTidyResDto> {
    return this.loginToVault(loginDto).then(
      async (result: vaultLoginResDto) => {
        if (result.auth.client_token && this.isUserAdmin(loginDto)) {
          return this.removeExpiredAndRevokedCerts(
            result.auth.client_token,
            loginDto,
          );
        } else {
          throw new Error('User is not authorized to login to Vault');
        }
      },
    );
  }

  async retrieveExistingCert(
    loginDto: vaultLoginReqDto,
  ): Promise<vaultGetCertResDto> {
    const url = `${this.vaultPkiUrlBase}/cert/${loginDto.certId}`;
    try {
      return (
        await lastValueFrom(this.httpService.get<vaultGetCertResDto>(url))
      ).data;
    } catch (e) {
      throwError(e, url);
    }
  }

  async generateNewCert(vault_token: string): Promise<vaultNewCertResDto> {
    const url = `${this.vaultPkiUrlBase}/issue/reader`;
    const payload = {
      common_name: `${process.env.TLS_COMMON_NAME}`,
      ttl: `${process.env.TLS_TTL}`,
      country: `${process.env.COUNTRY}`,
      province: `${process.env.STATE}`,
      locality: `${process.env.CITY}`,
      organization: `${process.env.COMMON_NAME}`,
    };
    const headers = { 'X-Vault-Token': vault_token };

    try {
      return (
        await lastValueFrom(
          this.httpService.post<vaultNewCertResDto>(url, payload, {
            headers: headers,
          }),
        )
      ).data;
    } catch (e) {
      throwError(e, url);
    }
  }

  async returnNewCert(vault_token: string, loginDto: vaultLoginReqDto) {
    return this.generateNewCert(vault_token)
      .then((res: vaultNewCertResDto) => {
        this.user_cert = {
          certificate: res.data.certificate,
          private_key: res.data.private_key,
          serial_number: res.data.serial_number,
        };
        this.storePrivateKey(vault_token, loginDto);
        // TODO: figure out how to modify auth0 user metadata to hold the new certid
        return this.handleUpdateAuth0CertId(
          loginDto,
          this.user_cert.serial_number,
        ).then(async (result: any) => {
          return this.user_cert;
        });
      })
      .catch((err) => console.log(err));
  }

  async storePrivateKey(vault_token: string, loginDto: vaultLoginReqDto) {
    const headers = { 'X-Vault-Token': vault_token };
    const payload = {};
    payload[this.user_cert.serial_number] = this.user_cert.private_key;
    const url = `${this.vaultKvUrlBase}/${loginDto.authSub}`;
    try {
      return (
        await lastValueFrom(
          this.httpService.post<any>(url, payload, {
            headers: headers,
          }),
        )
      ).status;
    } catch (e) {
      throwError(e, this.vaultKvUrlBase, 'Unable to retrieve the users ID');
    }
  }

  async getPkForCert(loginDto: vaultLoginReqDto): Promise<vaultBaseResDto> {
    try {
      return this.loginToVault(loginDto).then(
        async (result: vaultLoginResDto) => {
          if (result.auth.client_token) {
            const vault_token = result.auth.client_token;
            try {
              return this.retrievePrivateKeys(vault_token, loginDto).then(
                (res) => res.data[loginDto.certId],
              );
            } catch (e) {
              throwError(e, this.vaultKvUrlBase);
            }
          }
        },
      );
    } catch (e) {
      throwError(e, this.vaultKvUrlBase);
    }
  }

  async retrievePrivateKeys(
    vault_token: string,
    loginDto: vaultLoginReqDto,
  ): Promise<vaultBaseResDto> {
    const headers = { 'X-Vault-Token': vault_token };
    const url = `${this.vaultKvUrlBase}/${loginDto.authSub}`;
    try {
      return (
        await lastValueFrom(
          this.httpService.get<vaultBaseResDto>(url, {
            headers: headers,
          }),
        )
      ).data;
    } catch (e) {
      throwError(e, this.vaultKvUrlBase, 'Unable to retrieve the users ID');
    }
  }

  async revokeExistingCert(
    vault_token: string,
    certId: string,
  ): Promise<vaultRevokeResDto> {
    const url = `${this.vaultPkiUrlBase}/revoke`;
    const headers = { 'X-Vault-Token': vault_token };
    const payload = {
      serial_number: certId,
    };

    try {
      return (
        await lastValueFrom(
          this.httpService.post<vaultRevokeResDto>(url, payload, {
            headers: headers,
          }),
        )
      ).data;
    } catch (e) {
      throwError(e, url);
    }
  }

  async removeExpiredAndRevokedCerts(
    vault_token: string,
    loginDto: vaultLoginReqDto,
  ): Promise<vaultTidyResDto> {
    const url = `${this.vaultPkiUrlBase}/tidy`;
    const headers = { 'X-Vault-Token': vault_token };
    const tidyPayload: vaultTidyReqDto = {
      tidy_cert_store: true,
      tidy_revoked_certs: true,
      safety_buffer: '1m',
    };
    try {
      if (this.isUserAdmin(loginDto)) {
        return (
          await lastValueFrom(
            this.httpService.post<vaultTidyResDto>(url, tidyPayload, {
              headers: headers,
            }),
          )
        ).data;
      } else {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
    } catch (e) {
      throwError(e, url);
    }
  }

  async handleUpdateAuth0CertId(loginDto: vaultLoginReqDto, certId: string) {
    try {
      return this.getAuth0ManagementToken().then(
        async (result: authTokenResDto) => {
          return this.updateAuth0CertId(loginDto, result.access_token, certId);
        },
      );
    } catch (e) {
      throwError(e, this.auth0BaseUrl);
    }
  }

  async getAuth0ManagementToken() {
    const url = `${this.auth0TokenUrl}`;
    const headers = {
      content: 'content-type: application/json',
    };
    const payload = {
      client_id: `${process.env.AUTH0_MANAGEMENT_CLIENT_ID}`,
      client_secret: `${process.env.AUTH0_MANAGEMENT_SECRET}`,
      audience: `${this.auth0BaseUrl}`,
      grant_type: 'client_credentials',
    };

    try {
      return (
        await lastValueFrom(
          this.httpService.post<any>(url, payload, { headers: headers }),
        )
      ).data;
    } catch (e) {
      throwError(e, url);
    }
  }

  async updateAuth0CertId(
    loginDto: vaultLoginReqDto,
    accessToken: string,
    certId: string,
  ): Promise<authUpdateUserDto> {
    const url = `${process.env.TOKEN_AUDIENCE}users/${loginDto.authSub}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    };
    const payload = {
      user_metadata: {
        certId: certId,
      },
    };
    try {
      return (
        await lastValueFrom(
          this.httpService.patch(url, payload, { headers: headers }),
        )
      ).data;
    } catch (e) {
      throwError(e, url);
    }
  }

  isUserAdmin(loginDto: vaultLoginReqDto): boolean {
    return loginDto.role?.includes(`${process.env.ADMIN_ROLE_STRING}`);
  }

  isUserReader(loginDto: vaultLoginReqDto): boolean {
    return loginDto.role?.includes(`${process.env.STANDARD_ROLE_STRING}`);
  }

  checkIfCertIsExpired(certificate) {
    const secureContext = createSecureContext({
      cert: certificate,
    });
    const secureSocket = new TLSSocket(new net.Socket(), { secureContext });
    const cert: any = secureSocket.getCertificate();
    const todaysDate = new Date().toUTCString();
    return new Date(cert.valid_to).toUTCString() < todaysDate;
  }
}
