import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWallets1792766606022 implements MigrationInterface {
    name = 'CreateWallets1792766606022'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wallet" ("id" SERIAL NOT NULL, "balance" numeric(12,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "wallet"`);
    }

}
