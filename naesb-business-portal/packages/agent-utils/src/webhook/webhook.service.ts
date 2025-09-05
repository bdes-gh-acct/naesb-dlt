import { Inject, Injectable } from '@nestjs/common';
import { AriesWebhookTopic } from '@naesb/aries-types';
import { ClientProxy } from '@nestjs/microservices';

import { AriesWebhook } from './AriesWebhook.dto';

const { KAFKA_CLIENT_NAME } = process.env;

@Injectable()
export class WebhookService {
  constructor(@Inject(KAFKA_CLIENT_NAME) private client: ClientProxy) {}

  handle(topic: AriesWebhookTopic, body: any) {
    console.debug(`Webhook: ${topic}`);
    this.client.emit<number>(
      `${KAFKA_CLIENT_NAME}.Webhook.${topic}`,
      JSON.stringify(new AriesWebhook(topic, body)),
    );
  }
}
