import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInboxMessages1793100000001
implements MigrationInterface
{
name = 'CreateInboxMessages1793100000001';

public async up(queryRunner: QueryRunner): Promise<void> {
await queryRunner.query(`       CREATE TABLE "inbox_messages" (
        "id" SERIAL NOT NULL,
        "message_id" varchar(255) NOT NULL,
        "event_type" varchar(100) NOT NULL,
        "processed_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inbox_messages" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_inbox_messages_message_id" UNIQUE ("message_id")
      )
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
await queryRunner.query(`       DROP TABLE IF EXISTS "inbox_messages"
    `);
}
}
