import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BetsController } from './bets.controller.js';
import { BetsService } from './bets.service.js';
import { SqsModule } from '../sqs/sqs.module.js';

import { Bet } from './entities/bet.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { WalletLedgerEntry } from '../wallets/entities/wallet-ledger-entry.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bet, Wallet, WalletLedgerEntry]),
    SqsModule,
  ],
  controllers: [BetsController],
  providers: [BetsService],
})
export class BetsModule {}