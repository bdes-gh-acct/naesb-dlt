/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { Client } from 'pg';

const dropWallets = async () => {
  console.log('connecting');
  const client = new Client();
  await client.connect();
  console.log(`connected to ${client.database || 'public'}`);
  const { rows } = await client.query(
    `SELECT datname FROM pg_catalog.pg_database`,
  );
  // eslint-disable-next-line @typescript-eslint/no-for-in-array
  for (const row of rows) {
    const { datname } = row as unknown as { datname: string };
    if (datname?.endsWith('wallet')) {
      console.log(`wallet db ${datname} found`);
      // eslint-disable-next-line no-await-in-loop
      await dropDatabase(client, datname);
    }
  }
};

const createDatabase = async (client: Client, dbName: string) => {
  console.log(`Creating database ${dbName}`);
  await client.query(`CREATE DATABASE ${dbName}`);
};

const dropDatabase = async (client: Client, dbName: string) => {
  console.log(`Dropping database ${dbName}`);
  await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
};

const createSchema = async (
  client: Client,
  dbName: string,
  schemaName: string,
) => {
  console.log(`Creating schema ${schemaName} in ${dbName}`);
  await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
  console.log(`Schema ${schemaName} created in ${dbName}!`);
};

const initDb = async (database: string) => {
  const client = new Client();
  await client.connect();
  console.log(`connected to ${client.database || 'public'}`);
  await dropDatabase(client, database);
  await createDatabase(client, database);
  await client.end();
  const dbClient = new Client({ database });
  console.log(`DB Client connected to ${dbClient.database || 'public'}`);
  await dbClient.connect();
  await createSchema(dbClient, database, 'trade');
  await createSchema(dbClient, database, 'aries_agent');
  await createSchema(dbClient, database, 'aries_api');
  await dbClient.end();
};

export const handler = async () => {
  try {
    console.log('running migration....');
    await dropWallets();
    await initDb('naesb');
    await initDb('tva');
    await initDb('spire');
    await initDb('eqt');
    await initDb('miq');
    await initDb('swn');
    await initDb('registry');
    return { data: { success: true } };
  } catch (e) {
    console.log(e);
    return false;
  }
};
