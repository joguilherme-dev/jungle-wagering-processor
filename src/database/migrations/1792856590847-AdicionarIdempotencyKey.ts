import { MigrationInterface, QueryRunner } from "typeorm";

export class AdicionarIdempotencyKey1792856590847 implements MigrationInterface {
    name = 'AdicionarIdempotencyKey1792856590847'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bet" ADD "idempotencyKey" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "bet" ADD CONSTRAINT "UQ_efd6d249dee010b264b7b9c3718" UNIQUE ("idempotencyKey")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bet" DROP CONSTRAINT "UQ_efd6d249dee010b264b7b9c3718"`);
        await queryRunner.query(`ALTER TABLE "bet" DROP COLUMN "idempotencyKey"`);
    }

}
