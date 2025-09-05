import { Body, Controller, Post } from '@nestjs/common';
import { Param } from '@nestjs/common/decorators/http/route-params.decorator';
import { AriesWebhookTopic } from '@naesb/aries-types';
import { EventPattern } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { WebhookService } from './webhook.service';
import { AriesWebhook } from './AriesWebhook.dto';
import { SaveCredentialService } from './credential.service';

dotenv.config();

const { KAFKA_CLIENT_NAME } = process.env;

@Controller('Webhooks')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly credentialService: SaveCredentialService,
  ) {}

  @Post('/topic/:topic')
  public handleTopic(
    @Param('topic') topic: AriesWebhookTopic,
    @Body() body: any,
  ) {
    return this.webhookService.handle(topic, body);
  }

  @EventPattern(
    `${KAFKA_CLIENT_NAME}.Webhook.${AriesWebhookTopic.ISSUED_CREDENTIAL_2}`,
  )
  async handleBrokerEvent(input: AriesWebhook) {
    console.log(`Consuming event for ${input.topic}`);
    switch (input.topic) {
      case AriesWebhookTopic.ISSUED_CREDENTIAL_2:
        await this.credentialService.create(input.payload);
        break;
      default:
        break;
    }
  }
}
