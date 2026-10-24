import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWalletLedger1793000000000
  implements MigrationInterface
{
  name = 'CreateWalletLedger1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "wallet_ledger_entries" (
        "id" BIGSERIAL NOT NULL,
        "wallet_id" INTEGER NOT NULL,
        "bet_id" INTEGER NOT NULL,
        "entry_type" VARCHAR(20) NOT NULL,
        "amount" NUMERIC(12,2) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        CONSTRAINT "PK_wallet_ledger_entries"
          PRIMARY KEY ("id"),

        CONSTRAINT "FK_ledger_wallet"
          FOREIGN KEY ("wallet_id")
          REFERENCES "wallet"("id"),

        CONSTRAINT "FK_ledger_bet"
          FOREIGN KEY ("bet_id")
          REFERENCES "bet"("id"),

        CONSTRAINT "CHK_ledger_amount_positive"
          CHECK ("amount" > 0),

        CONSTRAINT "CHK_ledger_entry_type"
          CHECK ("entry_type" IN ('BET', 'WIN', 'LOSS','REFUND', 'ROLLBACK')),

        CONSTRAINT "UQ_ledger_bet_type"
          UNIQUE ("bet_id", "entry_type")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "wallet_ledger_entries"
    `);
  }
}