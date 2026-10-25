
import { Module } from '@nestjs/common';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SqsService } from './sqs.service.js';
import { InboxModule } from '../inbox/inbox.module.js';
@Module({
  providers: [
    {
      provide: SQSClient,
      useFactory: () =>
        new SQSClient({
          region: 'us-east-1',
          endpoint: process.env.SQS_ENDPOINT ?? 'http://localhost:9324',
          credentials: {
            accessKeyId: 'local',
            secretAccessKey: 'local',
          },
        }),
    },
    SqsService,
  ],
  exports: [SQSClient, SqsService],
})
export class SqsModule {}
