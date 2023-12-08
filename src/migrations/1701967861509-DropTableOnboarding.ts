import { generateEntityId } from "@medusajs/medusa";
import { MigrationInterface, QueryRunner } from "typeorm";

export class DropTableOnboarding1701967861509 implements MigrationInterface {
  name = "DropTableOnboarding1701967861509";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "onboarding_state" ALTER COLUMN "is_complete" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_state" DROP CONSTRAINT "PK_891b72628471aada55d7b8c9410"`
    );
    await queryRunner.query(`DROP TABLE "onboarding_state"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "onboarding_state" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "current_step" character varying NULL, "is_complete" boolean)`
    );

    await queryRunner.query(
      `INSERT INTO "onboarding_state" ("id", "current_step", "is_complete") VALUES ('${generateEntityId(
        "",
        "onboarding"
      )}' , NULL, false)`
    );

    await queryRunner.query(
      `ALTER TABLE "onboarding_state" ADD COLUMN "product_id" character varying NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "onboarding_state" ADD CONSTRAINT "PK_891b72628471aada55d7b8c9410" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_state" ALTER COLUMN "is_complete" SET NOT NULL`
    );
  }
}

