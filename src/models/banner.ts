import { Image, SoftDeletableEntity } from "@medusajs/medusa";
import { generateEntityId } from "@medusajs/utils";
import { BannerStatus } from "../enums/enum.banner";
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
} from "typeorm";

@Entity()
export class Banner extends SoftDeletableEntity {
  @Index({ unique: true, where: "deleted_at IS NULL" })
  @Column({ type: "varchar" })
  title: string | null;

  @Column({ type: "varchar" })
  description: string | null;

  @ManyToMany(() => Image, { cascade: ["insert"] })
  @JoinTable({
    name: "banner_images",
    joinColumn: {
      name: "banner_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "image_id",
      referencedColumnName: "id",
    },
  })
  images: Image[];

  @Column({ type: "enum", enum: BannerStatus, default: BannerStatus.INACTIVE })
  status: BannerStatus;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "banner");
  }
}
