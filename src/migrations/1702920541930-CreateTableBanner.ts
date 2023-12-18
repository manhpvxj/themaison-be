import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableBanner1702920541930 implements MigrationInterface {
  name = "CreateTableBanner1702920541930";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."banner_status_enum" AS ENUM('active', 'inactive')`
    );
    await queryRunner.query(
      `CREATE TABLE "banner" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "title" character varying NOT NULL, "description" character varying NOT NULL, "img_id" character varying NOT NULL, "status" "public"."banner_status_enum" NOT NULL DEFAULT 'inactive', CONSTRAINT "PK_6d9e2570b3d85ba37b681cd4256" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_840d464569bcb891b4b16a8bac" ON "banner" ("title") WHERE deleted_at IS NULL`
    );
    await queryRunner.query(
      `CREATE TABLE "banner_images" ("banner_id" character varying NOT NULL, "image_id" character varying NOT NULL, CONSTRAINT "PK_da98fb30516a10184960bdc86af" PRIMARY KEY ("banner_id", "image_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_29c68f26bdfb0ec2ec1a24e898" ON "banner_images" ("banner_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a12e84f5458c58965ef24343ce" ON "banner_images" ("image_id") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "banner_images" DROP CONSTRAINT "FK_a12e84f5458c58965ef24343cee"`
    );
    await queryRunner.query(
      `ALTER TABLE "banner_images" DROP CONSTRAINT "FK_29c68f26bdfb0ec2ec1a24e898e"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a12e84f5458c58965ef24343ce"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_29c68f26bdfb0ec2ec1a24e898"`
    );
    await queryRunner.query(`DROP TABLE "banner_images"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_840d464569bcb891b4b16a8bac"`
    );
    await queryRunner.query(`DROP TABLE "banner"`);
    await queryRunner.query(`DROP TYPE "public"."banner_status_enum"`);
  }
}

