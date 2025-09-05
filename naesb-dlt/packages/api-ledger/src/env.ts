import z from 'zod';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as dotenv from 'dotenv';

const envSchema = z.object({
  ADMIN_ADDRESS: z.string(),
  AUTO_ENROLL_USERS: z.coerce.boolean().optional(),
  CA_ADDRESS: z.string(),
  CONSOLE_LOG_LEVEL: z.string().optional(),
  CONSUL_CACERT: z.string(),
  CORE_PEER_ADDRESS: z.string(),
  CORE_PEER_LOCALMSPID: z.string(),
  CORE_PEER_MSPCONFIGPATH: z.string(),
  CORE_PEER_TLS_CERT_FILE: z.string(),
  CORE_PEER_TLS_ENABLED: z.coerce.boolean().optional(),
  CORE_PEER_TLS_KEY_FILE: z.string().optional(),
  CORE_PEER_TLS_ROOTCERT_FILE: z.string().optional(),
  DB_DATABASE: z.string(),
  DB_HOST: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_SCHEMA: z.string().optional(),
  DB_USERNAME: z.string(),
  DOMAIN: z.string(),
  HOST_PORT: z.coerce.number().default(8081),
  IDENTITY_CLIENT_ID: z.string(),
  IDENTITY_DOMAIN: z.string(),
  IDENTITY_SECRET_ID: z.string(),
  LOG_LEVEL: z.string().optional(),
  NAESB_CONTRACT_LABEL: z.string(),
  NAESB_CONTRACT_VERSION: z.string(),
  ORDERER_ADDRESS: z.string(),
  ORDERER_GENERAL_TLS_ENABLED: z.coerce.boolean(),
  ORG_ID: z.string(),
  ORG_MSP_ID: z.string(),
  ORG_NAME: z.string(),
  PEER_ADDRESS: z.string(),
  PRICE_API_URL: z.string(),
  PROFILE_ENDPOINT: z.string(),
  SERVICE_NAME: z.string().optional(),
  TOKEN_AUDIENCE: z.string(),
  TOKEN_ISSUER_URL: z.string(),
  VAULT_ADDRESS: z.string(),
  VAULT_CA: z.coerce.boolean(),
  VAULT_CACERT: z.string(),
  KAFKA_CLIENT_NAME: z.string(),
  KAFKA_GROUP_ID: z.string(),
  KAFKA_CLIENT_ID: z.string(),
  BOOTSTRAP_BROKERS: z.string(),
});

dotenv.config();

export const env = envSchema.parse(process.env);
console.log(`Environment endpoint: ${env.PROFILE_ENDPOINT}`);