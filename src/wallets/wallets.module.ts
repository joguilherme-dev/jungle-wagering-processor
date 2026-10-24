import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Wallet } from './entities/wallet.entity.js';
import { WalletLedgerEntry } from './entities/wallet-ledger-entry.entity.js';
import { WalletsController } from './wallets.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletLedgerEntry])],
  controllers: [WalletsController],
})
export class WalletsModule {}