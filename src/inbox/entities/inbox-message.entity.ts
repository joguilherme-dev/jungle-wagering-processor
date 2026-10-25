import {
Entity,
PrimaryGeneratedColumn,
Column,
CreateDateColumn,
Index,
} from 'typeorm';

@Entity({ name: 'inbox_messages' })
@Index(
'UQ_inbox_consumer_message',
['consumerName', 'messageId'],
{ unique: true },
)
export class InboxMessage {
@PrimaryGeneratedColumn()
id: number;

@Column({ name: 'consumer_name', type: 'varchar', length: 100 })
consumerName: string;

@Column({ name: 'message_id', type: 'varchar', length: 255 })
messageId: string;

@Column({ name: 'payload_hash', type: 'varchar', length: 64 })
payloadHash: string;

@Column({ name: 'event_type', type: 'varchar', length: 100 })
eventType: string;

@CreateDateColumn({ name: 'received_at', type: 'timestamptz' })
receivedAt: Date;

@Column({
name: 'completed_at',
type: 'timestamptz',
nullable: true,
})
completedAt: Date | null;
}
