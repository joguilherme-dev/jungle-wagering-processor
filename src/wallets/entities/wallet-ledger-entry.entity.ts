import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'wallet_ledger_entries' })
export class WalletLedgerEntry {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'wallet_id', type: 'integer' })
  walletId: number;

  @Column({ name: 'bet_id', type: 'integer' })
  betId: number;

  @Column({ name: 'entry_type', type: 'varchar', length: 20 })
  entryType: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}