import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';


@Entity()

export class Wallet {

@PrimaryGeneratedColumn()
id: number;

@Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
balance: string;

@CreateDateColumn({ type: 'timestamptz' })
createdAt: Date;

}