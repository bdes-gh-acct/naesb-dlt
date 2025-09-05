import { promises } from 'dns';
const resolver = new promises.Resolver({});
const { DNS_HOST, DNS_PORT } = process.env;
if (DNS_HOST) {
  resolver.setServers([`${DNS_HOST}:${Number(DNS_PORT || 53)}`]);
}

export const resolve = async (
  name: string,
  dataCenter = process.env.CONSUL_DATACENTER,
  prefix = 'http',
  authPrefix?: string,
) => {
  const result = await resolver.resolveSrv(
    `${name}.service${dataCenter ? `.${dataCenter}` : ''}.consul`,
  );
  if (result.length) {
    const { port, name: addr } = result[0];
    // eslint-disable-next-line no-console
    console.log('new return: ', `${prefix}://${authPrefix || ''}${name}.service.consul:${port}`);
    return `${prefix}://${authPrefix || ''}${name}.service.consul:${port}`;
    // eslint-disable-next-line no-console
    // console.log('old return: ', `${prefix}://${authPrefix || ''}${addr}:${port}`);
    // return `${prefix}://${authPrefix || ''}${addr}:${port}`;
  }
  return undefined;
};
