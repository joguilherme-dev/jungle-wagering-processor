import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WalletsModule } from './wallets/wallets.module.js';
import { BetsModule } from './bets/bets.module.js';
import { SqsModule } from './sqs/sqs.module.js';
import { OutboxModule } from './outbox/outbox.module.js';

@Module({
imports: [
TypeOrmModule.forRoot({
type: 'postgres',
host: '127.0.0.1',
port: 5433,
username: 'wagering',
password: 'wagering_dev',
database: 'wagering',
autoLoadEntities: true,
synchronize: false,
}),
WalletsModule,
BetsModule,
SqsModule,
OutboxModule,
],
controllers: [AppController],
providers: [AppService],
})
export class AppModule {}
