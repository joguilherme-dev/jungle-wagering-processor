import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxMessage } from './entities/inbox-message.entity.js';

@Module({
imports: [TypeOrmModule.forFeature([InboxMessage])],
exports: [TypeOrmModule],
})
export class InboxModule {}
