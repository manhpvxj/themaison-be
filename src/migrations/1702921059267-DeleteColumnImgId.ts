import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteColumnImgId1702921059267 implements MigrationInterface {
  name = "DeleteColumnImgId1702921059267";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "banner" DROP COLUMN "img_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "banner" ADD COLUMN "img_id" not null`
    );
  }
}

