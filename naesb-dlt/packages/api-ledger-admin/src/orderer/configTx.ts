import { Alias, Document, Scalar } from 'yaml';

export interface OrganizationYAML {
  Name: string;
  ID: string;
  OrdererEndpoints?: Array<{
    Host: string;
    Port: number;
    ClientTLSCert: string;
    ServerTLSCert: string;
  }>;
  Endpoint: string;
  AnchorPeers: Array<{ Host: string; Port: number }>;
}

const createOrganization = (
  doc: Document,
  organization: OrganizationYAML,
  index: number,
) => {
  const alias = doc.createAlias(
    doc.getIn(['Organizations', index], true) as Scalar<unknown>,
    organization.ID,
  );

  const obs = doc.getIn(
    ['Organizations', index, 'Policies', 'Readers', 'Rule'],
    true,
  ) as any;
  obs.type = 'QUOTE_DOUBLE';
  const writers = doc.getIn(
    ['Organizations', index, 'Policies', 'Writers', 'Rule'],
    true,
  ) as any;
  writers.type = 'QUOTE_DOUBLE';
  const Admins = doc.getIn(
    ['Organizations', index, 'Policies', 'Admins', 'Rule'],
    true,
  ) as any;
  Admins.type = 'QUOTE_DOUBLE';
  const Endorsement = doc.getIn(
    ['Organizations', index, 'Policies', 'Endorsement', 'Rule'],
    true,
  ) as any;
  Endorsement.type = 'QUOTE_DOUBLE';
  return alias;
};

const createChannelDefaults = (doc: Document, alias: Alias) => {
  const channel = doc.createNode({
    Policies: {
      Readers: {
        Type: 'ImplicitMeta',
        Rule: 'ANY Readers',
      },
      Writers: {
        Type: 'ImplicitMeta',
        Rule: 'ANY Writers',
      },
      Admins: {
        Type: 'ImplicitMeta',
        Rule: 'MAJORITY Admins',
      },
    },
    Capabilities: undefined,
  });
  doc.set('Channel', channel);
  ['Admins', 'Writers', 'Readers'].forEach((key) => {
    const obj = doc.getIn(['Channel', 'Policies', key, 'Rule'], true) as any;
    obj.type = 'QUOTE_SINGLE';
  });
  const channelDefaultsAlias = doc.createAlias(
    doc.get('Channel', false) as Scalar<unknown>,
    'ChannelDefaults',
  );
  doc.setIn(['Channel', 'Capabilities', '<<'], alias) as any;
  return channelDefaultsAlias;
};

const createYAML = (organizations: Array<OrganizationYAML>) => {
  const doc = new Document(
    {
      Organizations: organizations.map(
        ({ Name, ID, OrdererEndpoints, AnchorPeers }) => ({
          Name,
          ID,
          MSPDir: `/tmp/msp/${ID}/msp`,
          Policies: {
            Readers: {
              Type: 'Signature',
              Rule: `OR('${ID}.admin', '${ID}.peer', '${ID}.client')`,
            },
            Writers: {
              Type: 'Signature',
              Rule:
                ID === 'D000000000'
                  ? `OR('${ID}.admin', '${ID}.client','${ID}.member')`
                  : `OR('${ID}.admin', '${ID}.client')`,
            },
            Admins: {
              Type: 'Signature',
              Rule: `OR('${ID}.admin')`,
            },
            Endorsement: {
              Type: 'Signature',
              Rule: `OR('${ID}.peer')`,
            },
          },
          OrdererEndpoints: OrdererEndpoints?.map(
            (endpoint) => `${endpoint.Host}:${endpoint.Port}`,
          ),
          AnchorPeers,
        }),
      ),
      Capabilities: {
        Channel: { V2_0: true },
        Orderer: { V2_0: true },
        Application: { V2_0: true },
      },
    },
    { merge: true },
  );
  const aliases: Array<Alias> = [];
  organizations.forEach((organization, index) => {
    aliases.push(createOrganization(doc, organization, index));
  });
  const channelAlias = doc.createAlias(
    doc.getIn(['Capabilities', 'Channel'], false) as Scalar<unknown>,
    'ChannelCapabilities',
  );
  const applicationCapabilitiesAlias = doc.createAlias(
    doc.getIn(['Capabilities', 'Application'], false) as Scalar<unknown>,
    'ApplicationCapabilities',
  );
  const ordererCapabilitiesAlias = doc.createAlias(
    doc.getIn(['Capabilities', 'Orderer'], false) as Scalar<unknown>,
    'OrdererCapabilities',
  );
  const application = doc.createNode(
    {
      Policies: {
        Readers: {
          Type: 'ImplicitMeta',
          Rule: 'ANY Readers',
        },
        Writers: {
          Type: 'ImplicitMeta',
          Rule: 'ANY Writers',
        },
        Admins: {
          Type: 'ImplicitMeta',
          Rule: 'MAJORITY Admins',
        },
        LifecycleEndorsement: {
          Type: 'ImplicitMeta',
          Rule: 'MAJORITY Endorsement',
        },
        Endorsement: {
          Type: 'ImplicitMeta',
          Rule: 'MAJORITY Endorsement',
        },
      },
      Capabilities: {
        '<<': '*ApplicationCapabilities',
      },
    },
    { keepUndefined: true },
  );
  doc.set('Application', application);
  [
    'Endorsement',
    'LifecycleEndorsement',
    'Admins',
    'Writers',
    'Readers',
  ].forEach((key) => {
    const obj = doc.getIn(
      ['Application', 'Policies', key, 'Rule'],
      true,
    ) as any;
    obj.type = 'QUOTE_SINGLE';
  });

  const applicationDefaultsAlias = doc.createAlias(
    doc.get('Application', false) as Scalar<unknown>,
    'ApplicationDefaults',
  );
  doc.setIn(
    ['Application', 'Capabilities', '<<'],
    applicationCapabilitiesAlias,
  ) as any;
  const orderer = doc.createNode({
    OrdererType: 'etcdraft',
    Addresses: organizations
      .filter((org) => org.OrdererEndpoints?.length)
      .map(
        (org) =>
          org.OrdererEndpoints?.map(
            (endpoint) => `${endpoint.Host}:${endpoint.Port}`,
          ) || [],
      )
      .flat(),
    BatchTimeout: '2s',
    BatchSize: {
      MaxMessageCount: 10,
      AbsoluteMaxBytes: '99 MB',
      PreferredMaxBytes: '512 KB',
    },
    EtcdRaft: {
      Consenters: organizations
        .filter((org) => org.OrdererEndpoints?.length)
        .map((org) => org.OrdererEndpoints)
        .flat(),
    },
    Policies: {
      Readers: {
        Type: 'ImplicitMeta',
        Rule: 'ANY Readers',
      },
      Writers: {
        Type: 'ImplicitMeta',
        Rule: 'ANY Writers',
      },
      Admins: {
        Type: 'ImplicitMeta',
        Rule: 'MAJORITY Admins',
      },
      BlockValidation: {
        Type: 'ImplicitMeta',
        Rule: 'ANY Writers',
      },
    },
  });
  doc.set('Orderer', orderer);
  ['Admins', 'Writers', 'Readers', 'BlockValidation'].forEach((key) => {
    const obj = doc.getIn(['Orderer', 'Policies', key, 'Rule'], true) as any;
    obj.type = 'QUOTE_SINGLE';
  });
  const ordererDefaultsAlias = doc.createAlias(
    doc.get('Orderer', false) as Scalar<unknown>,
    'OrdererDefaults',
  );
  const channelDefaultsAlias = createChannelDefaults(doc, channelAlias);
  const profiles = doc.createNode({
    TradeChannel: {},
  });
  doc.setIn(['Profiles'], profiles);
  doc.setIn(['Profiles', 'TradeChannel', '<<'],
    channelDefaultsAlias,
  );
  doc.setIn(
    ['Profiles', 'TradeChannel', 'Orderer', '<<'],
    ordererDefaultsAlias,
  );
  organizations
    .filter((organization) => organization.OrdererEndpoints?.length)
    .forEach((_, index) => {
      doc.setIn(
        ['Profiles', 'TradeChannel', 'Orderer', 'Organizations', index],
        aliases[index],
      );
    });
  doc.setIn(
    ['Profiles', 'TradeChannel', 'Orderer', 'Capabilities', '<<'],
    ordererCapabilitiesAlias,
  );
  doc.setIn(
    ['Profiles', 'TradeChannel', 'Application', '<<'],
    applicationDefaultsAlias,
  );
  organizations.forEach((_, index) => {
    doc.setIn(
      ['Profiles', 'TradeChannel', 'Application', 'Organizations', index],
      aliases[index],
    );
  });
  doc.setIn(
    ['Profiles', 'TradeChannel', 'Application', 'Capabilities', '<<'],
    applicationCapabilitiesAlias,
  );

  return { doc, aliases };
};

export const createConfigTx = (organizations: Array<OrganizationYAML>) => {
  return createYAML(organizations);
};
