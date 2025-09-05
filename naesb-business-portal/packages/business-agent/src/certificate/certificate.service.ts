import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Certificate } from '@shared/agent-utils';
import { Repository } from 'typeorm';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) {}

  async getCertificates() {
    const [data, totalRecords] = await this.certificateRepository.findAndCount({
      where: { role: 'holder' },
      relations: {
        schema: true,
        credentialDefinition: true,
        connection: { connected_did: true },
      },
    });
    return { data, totalRecords };
  }

  async getIssuedCertificates() {
    const [data, totalRecords] = await this.certificateRepository.findAndCount({
      where: { role: 'issuer' },
      relations: {
        schema: true,
        credentialDefinition: true,
        connection: { connected_did: true },
      },
    });
    return { data, totalRecords };
  }
}
