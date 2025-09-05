export class AriesWebhook {
  constructor(topic: string, payload: any) {
    this.topic = topic;
    this.payload = payload;
  }

  topic!: string;

  payload!: any;
}
