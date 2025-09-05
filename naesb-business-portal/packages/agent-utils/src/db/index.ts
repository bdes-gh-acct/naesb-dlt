import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import CredentialDefinition from './credentialDefinition.entity';
import Did from './did.entity';
import Pointer from './pointer.entity';
import Schema from './schema.entity';
import Transaction from './transaction.entity';
import Certificate from './certificate.entity';
import CertificateProof from './certificateProof.entity';
// import { SchemaService } from 'src/ledger/schema.service';
// import { CredentialDefinitionService } from 'src/ledger/credentialDefinition.service';
// import { DidService } from 'src/ledger/did.service';
// import { SaveCredentialService } from 'src/webhook/credential.service';
// import { CredentialProofService } from 'src/webhook/credentialProof.service';
import AgentConnection from './connection.entity';
// import { LedgerService } from 'src/ledger/ledger.service';
// import { BrokerModule } from 'src/broker/broker.module';
export {
  Did,
  Pointer,
  Schema,
  Transaction,
  CredentialDefinition,
  Certificate,
  AgentConnection,
  CertificateProof,
};

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: Number(process.env.DB_PORT),
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      maxQueryExecutionTime: 1000 * 20,
      schema: process.env.DB_SCHEMA || 'public',
      autoLoadEntities: true,
      logging: ['error'],
      synchronize: Boolean(process.env.SYNCHRONIZE_SCHEMA),
    }),
    TypeOrmModule.forFeature([
      Transaction,
      Schema,
      Did,
      Pointer,
      CredentialDefinition,
      AgentConnection,
      Certificate,
      CertificateProof,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DbModule {}
