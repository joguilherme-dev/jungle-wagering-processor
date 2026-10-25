import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteInboxMessages1793100000002
implements MigrationInterface
{
name = 'CompleteInboxMessages1793100000002';

public async up(queryRunner: QueryRunner): Promise<void> {
await queryRunner.query(`       ALTER TABLE "inbox_messages"
      ADD COLUMN "consumer_name" varchar(100),
      ADD COLUMN "payload_hash" varchar(64),
      ADD COLUMN "received_at" timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN "completed_at" timestamptz
    `);


await queryRunner.query(`
  UPDATE "inbox_messages"
  SET
    "consumer_name" = 'legacy',
    "payload_hash" = repeat('0', 64)
`);

await queryRunner.query(`
  ALTER TABLE "inbox_messages"
  ALTER COLUMN "consumer_name" SET NOT NULL,
  ALTER COLUMN "payload_hash" SET NOT NULL
`);

await queryRunner.query(`
  ALTER TABLE "inbox_messages"
  DROP CONSTRAINT "UQ_inbox_messages_message_id"
`);

await queryRunner.query(`
  ALTER TABLE "inbox_messages"
  ADD CONSTRAINT "UQ_inbox_consumer_message"
  UNIQUE ("consumer_name", "message_id")
`);


}

public async down(queryRunner: QueryRunner): Promise<void> {
await queryRunner.query(`       ALTER TABLE "inbox_messages"
      DROP CONSTRAINT "UQ_inbox_consumer_message"
    `);


await queryRunner.query(`
  ALTER TABLE "inbox_messages"
  ADD CONSTRAINT "UQ_inbox_messages_message_id"
  UNIQUE ("message_id")
`);

await queryRunner.query(`
  ALTER TABLE "inbox_messages"
  DROP COLUMN "completed_at",
  DROP COLUMN "received_at",
  DROP COLUMN "payload_hash",
  DROP COLUMN "consumer_name"
`);


}
}
