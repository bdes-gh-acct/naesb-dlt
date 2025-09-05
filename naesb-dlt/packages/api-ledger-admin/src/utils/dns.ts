import { promises } from 'dns';
const resolver = new promises.Resolver({});
const { DNS_HOST, DNS_PORT } = process.env;
if (DNS_HOST) {
  resolver.setServers([`${DNS_HOST}:${Number(DNS_PORT || 53)}`]);
}

export const resolve = async (
  name: string,
  port?: number,
  dataCenter = process.env.CONSUL_DATACENTER,
  prefix = 'http',
  authPrefix?: string,
) => {
  const result = await resolver.resolveSrv(
    `${name}.service${dataCenter ? `.${dataCenter}` : ''}.consul`,
  );
  if (result.length) {
    const { port: registeredPort, name: addr } = result[0];
    return `${prefix}://${authPrefix || ''}${addr}:${port || registeredPort}`;
  }
  return undefined;
};
