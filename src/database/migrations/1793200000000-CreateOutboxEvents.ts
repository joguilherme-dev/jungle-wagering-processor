import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOutboxEvents1793200000000
implements MigrationInterface
{
name = 'CreateOutboxEvents1793200000000';

public async up(queryRunner: QueryRunner): Promise<void> {
await queryRunner.query(`       CREATE TABLE "outbox_events" (
        "id" SERIAL NOT NULL,
        "event_type" VARCHAR(100) NOT NULL,
        "payload" JSONB NOT NULL,
        "published" BOOLEAN NOT NULL DEFAULT FALSE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_outbox_events" PRIMARY KEY ("id")
      )
    `);

await queryRunner.query(`
  CREATE INDEX "IDX_outbox_events_pending"
  ON "outbox_events" ("id")
  WHERE "published" = FALSE
`);

}

public async down(queryRunner: QueryRunner): Promise<void> {
await queryRunner.query(`       DROP TABLE "outbox_events"
    `);
}
}
