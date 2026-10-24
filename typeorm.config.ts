import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { Wallet } from './src/wallets/entities/wallet.entity.js';
import { Bet } from './src/bets/entities/bet.entity.js';
import { WalletLedgerEntry } from './src/wallets/entities/wallet-ledger-entry.entity.js';
import { OutboxEvent } from './src/outbox/entities/outbox-event.entity.js';

export default new DataSource({
  type: 'postgres',
  host: '127.0.0.1',
  port: 5433,
  username: 'wagering',
  password: 'wagering_dev',
  database: 'wagering',
  entities: [Wallet, Bet, WalletLedgerEntry, OutboxEvent],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});