
import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreateQueueCommand,
  GetQueueUrlCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { OutboxEvent } from '../outbox/entities/outbox-event.entity.js';
@Injectable()
export class SqsService implements OnModuleInit {
  private readonly queueName = 'bet-events';
  private queueUrl!: string;

  constructor(private readonly sqsClient: SQSClient) {}

  async onModuleInit(): Promise<void> {
    await this.sqsClient.send(
      new CreateQueueCommand({
        QueueName: this.queueName,
      }),
    );

    const response = await this.sqsClient.send(
      new GetQueueUrlCommand({
        QueueName: this.queueName,
      }),
    );

    if (!response.QueueUrl) {
      throw new Error(`Não foi possível obter a URL da fila ${this.queueName}`);
    }

    this.queueUrl = response.QueueUrl;

    console.log(`Fila SQS pronta: ${this.queueName}`);
  }

  async publicarEvento(evento: Record<string, unknown>): Promise<void> {
    if (!this.queueUrl) {
      throw new Error('A fila SQS ainda não foi inicializada.');
    }

    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(evento),
      }),
    );
  }
}
