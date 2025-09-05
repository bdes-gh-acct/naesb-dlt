import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TypeORMError } from 'typeorm';
import { Certificate } from '../db';

@Injectable()
export class SaveCredentialService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) {}

  async create(body: any) {
    if (body.state === 'done') {
      const certificate = {
        id: body.cred_ex_id,
        connectionId: body.connection_id,
        credentialDefinitionId: body.by_format.cred_issue.indy.cred_def_id,
        schemaId: body.by_format.cred_issue.indy.schema_id,
        revoked: false,
        role: body.role,
        target_name: body.by_format.cred_issue.indy.values.target_name.raw,
        target_type: body.by_format.cred_issue.indy.values.target_type.raw,
        certificate_id:
          body.by_format.cred_issue.indy.values.certificate_id.raw,
        target_id: body.by_format.cred_issue.indy.values.target_id.raw,
        issued_to: body.by_format.cred_issue.indy.values.issued_to.raw,
        expiration: new Date(
          Number(body.by_format.cred_issue.indy.values.expiration.raw),
        ),
        effective: new Date(
          Number(body.by_format.cred_issue.indy.values.effective.raw),
        ),
        rating: body.by_format.cred_issue.indy.values.rating.raw,
        score: Number(body.by_format.cred_issue.indy.values.score.raw),
      };
      try {
        await this.certificateRepository.save(certificate);
      } catch (e) {
        Logger.error((e as TypeORMError).message);
      }
    }
  }
}
