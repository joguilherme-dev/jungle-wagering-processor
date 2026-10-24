import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBets1792788732335 implements MigrationInterface {
    name = 'CreateBets1792788732335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bet" ("id" SERIAL NOT NULL, "walletId" integer NOT NULL, "amount" numeric(12,2) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4ceea2cdef435807614b8e17aed" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bet"`);
    }

}
