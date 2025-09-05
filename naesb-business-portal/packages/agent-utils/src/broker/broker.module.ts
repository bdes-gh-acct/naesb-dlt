import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

const {
  KAFKA_CLIENT_ID,
  BOOTSTRAP_BROKERS,
  KAFKA_GROUP_ID,
  KAFKA_CLIENT_NAME,
} = process.env;

@Module({
  imports: [
    ClientsModule.register([
      {
        name: KAFKA_CLIENT_NAME as string,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: KAFKA_CLIENT_ID as string,
            brokers: BOOTSTRAP_BROKERS?.split(',') || [],
          },
          consumer: {
            groupId: KAFKA_GROUP_ID as string,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class BrokerModule {}
