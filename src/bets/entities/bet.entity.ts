import {
Entity,
PrimaryGeneratedColumn,
Column,
CreateDateColumn,
} from 'typeorm';

@Entity()
export class Bet {
@PrimaryGeneratedColumn()
id: number;

@Column({ type: 'integer' })
walletId: number;

@Column({ type: 'numeric', precision: 12, scale: 2 })
amount: string;

@Column({type: 'varchar',length: 255,unique: true,  nullable: true,})
idempotencyKey: string | null;

@Column({ type: 'varchar', length: 20, default: 'PENDING' })
status: string;

@CreateDateColumn({ type: 'timestamptz' })
createdAt: Date;
}
