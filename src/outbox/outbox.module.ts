import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OutboxEvent } from './entities/outbox-event.entity.js';
import { OutboxProcessor } from './outbox.processor.js';
import { SqsModule } from '../sqs/sqs.module.js';

@Module({
imports: [
TypeOrmModule.forFeature([OutboxEvent]),
SqsModule,
],
providers: [OutboxProcessor],
})
export class OutboxModule {}
