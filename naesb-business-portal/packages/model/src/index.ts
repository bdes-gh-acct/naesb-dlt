export enum IndyRoleCode {
  TRUSTEE = '0',
  STEWARD = '2',
  TGB = '100',
  ENDORSER = '101',
}

export enum IndyRole {
  ENDORSER = 'ENDORSER',
  STEWARD = 'STEWARD',
  TRUSTEE = 'TRUSTEE',
}

export enum AriesWebhookTopic {
  ISSUED_CREDENTIAL_2 = 'issue_credential_v2_0',
  PRESENT_PROOF_2 = 'present_proof_v2_0',
}

export interface LedgerDid {
  id: string;
  from: string;
  sequence: number;
  role: IndyRoleCode;
  alias?: string;
  verkey?: string;
  roleName: IndyRole;
  attributes: {
    endpoint: {
      endpoint: string;
      routingKeys: [];
      profile: string;
    };
  };
}

export interface ICredentialDefinition {
  id: string;
  seqNo: number;
  createdBy: string;
  schemaSeqNo: number;
  tag?: string;
  signatureType?: string;
  did?: IDid;
  schema?: ISchema;
  created?: Date;
}

export interface CreateCredentialDefinitionRequest {
  revocation_registry_size: number;
  schema_id: string;
  support_revocation: boolean;
  tag: string;
}

export interface IConnection {
  accept: string;
  alias: string;
  connection_id: string;
  connection_protocol: string;
  created_at: string;
  error_msg?: string;
  inbound_connection_id: string;
  invitation_key: string;
  invitation_mode: string;
  invitation_msg_id: string;
  my_did: string;
  request_id: string;
  rfc23_state: string;
  routing_state: string;
  state: string;
  their_did: string;
  their_label: string;
  their_public_did: string;
  their_role: string;
  updated_at: string;
}

export enum LedgerType {
  POOL = 0,
  DOMAIN = 1,
  CONFIG = 2,
}

export interface ITransaction {
  created?: Date;
  seqNo: number;
  transactionType?: TransactionType;
  role?: IndyRoleType;
  transactionId?: string;
  value?: IndyTransaction;
  createdBy?: string;
  destination?: string;
}

export interface NymTransaction {
  data: { dest: string; role: IndyRoleType; verkey: string; alias?: string };
  type: TransactionType.NYM;
  metadata: { from?: string };
}

export interface SchemaTransaction {
  data: { data: { attr_names: Array<string>; name: string; version: string } };
  type: TransactionType.SCHEMA;
  metadata: any;
}

export interface CredentialDefinitionTransaction {
  data: { data: any; ref: number; signature_type: string; tag: string };
  type: TransactionType.CRED_DEF;
  metadata: { from: string };
}

export interface IWell {
  id: string;
  name: string;
  createdBy: string;
  created?: Date;
  fieldId?: string;
  updated?: Date;
  updatedBy: string;
}

export interface IField {
  id: string;
  name: string;
  createdBy: string;
  created?: Date;
  updated?: Date;
  updatedBy: string;
}

export interface AttributeTransaction {
  data: { dest: string; raw: string };
  type: TransactionType.ATTRIB;
  metadata: { from: string };
}

export interface NodeTransaction {
  data: {
    data: {
      alias: string;
      blskey_pop: string;
      blskey: string;
      client_ip: string;
      client_port: number;
      node_ip: string;
      node_port: number;
      services: Array<string>;
    };
    dest: string;
  };
  type: TransactionType.NODE;
  metadata: { from: string };
}

export enum TransactionType {
  NODE = '0',
  NYM = '1',
  ATTRIB = '100',
  SCHEMA = '101',
  CRED_DEF = '102',
  DISCLO = '103',
  GET_ATTR = '104',
  GET_NYM = '105',
  GET_SCHEMA = '107',
  GET_CLAIM_DEF = '108',
  POOL_UPGRADE = '109',
  NODE_UPGRADE = '110',
  POOL_CONFIG = '111',
  CHANGE_KEY = '112',
  REVOC_REG_DEF = '113',
  RECOV_REG_ENTRY = '114',
  POOL_RESTART = '118',
  AUTH_RULE = '120',
}

export enum IndyRoleType {
  TRUSTEE = '0',
  STEWARD = '2',
  TGB = '100',
  ENDORSER = '101',
}

export interface IndyTransaction {
  auditPath: Array<string>;
  ledgerSize: number;
  reqSignature?: {
    type: 'ED25519';
    values: Array<{ from: string; value: string }>;
  };
  rootHash: string;
  txn:
    | NymTransaction
    | SchemaTransaction
    | AttributeTransaction
    | CredentialDefinitionTransaction
    | NodeTransaction;
  txnMetadata: {
    seqNo: number;
    txnId?: string;
    txnTime?: number;
  };
  ver: number;
}

export interface IDid {
  id: string;
  seqNo: number;
  role?: IndyRoleType;
  verkey?: string;
  attributes?: any;
  createdBy: string;
  alias?: string;
}

export interface ISchema {
  id: string;
  seqNo: number;
  createdBy: string;
  name?: string;
  version?: string;
  attributes?: Array<string>;
  did?: IDid;
  created?: Date;
}

export interface AriesCredential {
  referent: string;
  attrs: Record<string, string>;
  schema_id: string;
  cred_def_id: string;
  rev_reg_id?: string;
  cred_rev_id?: string;
}

export interface CredentialExchangeRecord<TSchema extends object> {
  auto_remove: true;
  by_format: {
    cred_proposal: {
      indy: {
        schema_version: string;
        schema_id: string;
        schema_issuer_did: string;
        cred_def_id: string;
        issuer_did: string;
        schema_name: string;
      };
    };
    cred_offer: {
      indy: {
        schema_id: string;
        cred_def_id: string;
        key_correctness_proof: any;
        nonce: string;
      };
    };
  };

  role: string;
  created_at: string;
  auto_offer: boolean;
  cred_ex_id: string;
  updated_at: string;
  auto_issue: true;
  cred_preview: {
    '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/2.0/credential-preview';
    attributes: Array<{ name: keyof TSchema; value: string }>;
  };
  trace: true;
  initiator: string;
  cred_proposal: {
    '@type': string;
    '@id': string;
    '~trace'?: {
      target: 'log';
      full_thread: true;
      trace_reports: [];
    };
    formats: [
      {
        attach_id: 'indy';
        format: 'hlindy/cred-filter@v2.0';
      },
    ];
    comment: 'Testing the comment feature again';
    credential_preview: {
      '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/2.0/credential-preview';
      attributes: Array<{ name: keyof TSchema; value: string }>;
    };
  };
  connection_id: string;
  state: string;
  thread_id: string;
  cred_offer: {
    '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/2.0/offer-credential';
    '@id': string;
    formats: [
      {
        attach_id: 'indy';
        format: 'hlindy/cred-abstract@v2.0';
      },
    ];
    comment: 'create automated v2.0 credential exchange record';
    credential_preview: {
      '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/2.0/credential-preview';
      attributes: Array<{ name: keyof TSchema; value: string }>;
    };
  };
}

export interface PresentProofRecord {
  auto_verify: boolean;
  updated_at: string;
  created_at: string;
  state: string;
  connection_id: string;
  trace: boolean;
  pres_proposal: {
    '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/2.0/propose-presentation';
    '@id': string;
    'proposals~attach': [
      {
        '@id': 'indy';
        'mime-type': 'application/json';
        data: {
          base64: string;
        };
      },
    ];
    formats: [
      {
        attach_id: 'indy';
        format: 'hlindy/proof-req@v2.0';
      },
    ];
  };
  by_format: {
    pres_proposal: {
      indy: {
        name: 'Proof request';
        requested_predicates: any;
        requested_attributes: Record<
          string,
          { name?: string; names: Array<string>; restrictions: Array<any> }
        >;
      };
    };
    pres_request: {
      indy: {
        name: string;
        requested_predicates: any;
        requested_attributes: Record<
          string,
          { name?: string; names: Array<string>; restrictions: Array<any> }
        >;
        version: string;
        nonce: string;
      };
    };
    pres: {
      indy: {
        requested_proof: {
          revealed_attrs: any;
          revealed_attr_groups: Record<
            string,
            {
              sub_proof_index: number;
              values: Record<string, { raw: string; encoded: string }>;
            }
          >;
          self_attested_attrs: any;
          unrevealed_attrs: any;
          predicates: any;
        };
        identifiers: [
          {
            schema_id: string;
            cred_def_id: string;
            rev_reg_id: string;
            timestamp: null;
          },
        ];
      };
    };
  };
  auto_present: boolean;
  pres_ex_id: string;
  role: 'verifier';
  pres_request: {
    '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/2.0/request-presentation';
    '@id': string;
    '~thread': {
      thid: string;
    };
    will_confirm: true;
    'request_presentations~attach': [
      {
        '@id': 'indy';
        'mime-type': 'application/json';
        data: {
          base64: string;
        };
      },
    ];
    formats: [
      {
        attach_id: 'indy';
        format: 'hlindy/proof-req@v2.0';
      },
    ];
  };
  thread_id: string;
  pres: {
    '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/2.0/presentation';
    '@id': string;
    '~thread': {
      thid: string;
    };
    comment: string;
    'presentations~attach': [
      {
        '@id': 'indy';
        'mime-type': 'application/json';
        data: {
          base64: string;
        };
      },
    ];
    formats: [
      {
        attach_id: 'indy';
        format: 'hlindy/proof@v2.0';
      },
    ];
  };
  initiator: 'external';
}

export interface AriesCredentialExchangeRecord<TSchema extends object> {
  cred_ex_record: CredentialExchangeRecord<TSchema>;
}

export interface IChannel {
  ChannelId: string;
  Status: string;
  NetworkStatus: string;
}
