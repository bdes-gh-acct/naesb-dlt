import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TypeORMError } from 'typeorm';
import { PresentProofRecord } from '@naesb/aries-types';
import { ClientProxy } from '@nestjs/microservices';
import CertificateProof from '../db/certificateProof.entity';
import { AgentService } from '../agent';

const { KAFKA_CLIENT_NAME, ORG_ID } = process.env;

@Injectable()
export class CredentialProofService {
  constructor(
    @InjectRepository(CertificateProof)
    private readonly certificateRepository: Repository<CertificateProof>,
    @Inject(KAFKA_CLIENT_NAME) private client: ClientProxy,
    private readonly agentService: AgentService,
  ) {}

  async create(body: PresentProofRecord) {
    if (body.role === 'verifier') {
      if (
        body.state === 'presentation-sent' &&
        Boolean(process.env.ACAPY_AUTO_VERIFY_PRESENTATION) &&
        !body.auto_verify
      ) {
        await this.agentService.verifyPresentation({
          presentationExchangeId: body.pres_ex_id,
        });
        return;
      }
      if (body.state === 'done') {
        const certificate: CertificateProof = {
          presentationExchangeId: body.pres_ex_id,
          connectionId: body.connection_id,
          credentialDefinitionId:
            body.by_format.pres.indy.identifiers[0].cred_def_id,
          schemaId: body.by_format.pres.indy.identifiers[0].schema_id,
          id: body.by_format.pres.indy.requested_proof.revealed_attr_groups
            .target_id.values.certificate_id.raw,
          issued_to:
            body.by_format.pres.indy.requested_proof.revealed_attr_groups
              .target_id.values.issued_to.raw,
          target_name:
            body.by_format.pres.indy.requested_proof.revealed_attr_groups
              .target_id.values.target_name.raw,
          target_type:
            body.by_format.pres.indy.requested_proof.revealed_attr_groups
              .target_id.values.target_type.raw,
          score: Number(
            body.by_format.pres.indy.requested_proof.revealed_attr_groups
              .target_id.values.score.raw,
          ),
          rating:
            body.by_format.pres.indy.requested_proof.revealed_attr_groups
              .target_id.values.rating.raw,
          target_id:
            body.by_format.pres.indy.requested_proof.revealed_attr_groups
              .target_id.values.target_id.raw,
          expiration: new Date(
            Number(
              body.by_format.pres.indy.requested_proof.revealed_attr_groups
                .target_id.values.expiration.raw,
            ),
          ),
          effective: new Date(
            Number(
              body.by_format.pres.indy.requested_proof.revealed_attr_groups
                .target_id.values.effective.raw,
            ),
          ),
        };
        try {
          await this.certificateRepository.save(certificate);
          this.client.emit<number>(
            `${ORG_ID}.Aries.Proof.Complete`,
            JSON.stringify(certificate),
          );
        } catch (e) {
          Logger.error((e as TypeORMError).message);
        }
      }
    }
  }
}
