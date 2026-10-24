import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProtectWalletLedger1793100000000
  implements MigrationInterface
{
  name = 'ProtectWalletLedger1793100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION prevent_wallet_ledger_mutation()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'Lançamentos do ledger são imutáveis';
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER "TR_wallet_ledger_immutable"
      BEFORE UPDATE OR DELETE ON "wallet_ledger_entries"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_wallet_ledger_mutation();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS "TR_wallet_ledger_immutable"
      ON "wallet_ledger_entries";
    `);

    await queryRunner.query(`
      DROP FUNCTION IF EXISTS prevent_wallet_ledger_mutation();
    `);
  }
}
