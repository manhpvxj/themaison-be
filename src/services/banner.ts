import { TransactionBaseService } from "@medusajs/medusa";
import { BannerRepository } from "../repositories/banner";
import { Banner } from "../models/banner";
import ImageRepository from "@medusajs/medusa/dist/repositories/image";
import { CreateBannerDto } from "../dtos/banner";
import { MedusaError } from "medusa-core-utils";
import { BannerStatus } from "../enums/enum.banner";

type InjectedDependencies = {
  bannerRepository: typeof BannerRepository;
  imageRepository: typeof ImageRepository;
};
class BannerService extends TransactionBaseService {
  protected readonly bannerRepo_: typeof BannerRepository;
  protected readonly imageRepo_: typeof ImageRepository;
  constructor({ bannerRepository, imageRepository }: InjectedDependencies) {
    super(arguments[0]);
    this.bannerRepo_ = bannerRepository;
    this.imageRepo_ = imageRepository;
  }
  async getList(
    config = {
      skip: 0,
      take: 20,
    }
  ): Promise<{ banners: Banner[]; count: number }> {
    const bannerRepo = this.activeManager_.withRepository(this.bannerRepo_);
    const [banners, count] = await bannerRepo.findAndCount(config);
    return { banners, count };
  }

  async create(body: CreateBannerDto): Promise<Banner> {
    return this.atomicPhase_(async (manager) => {
      const bannerRepo = manager.withRepository(this.bannerRepo_);
      const imageRepo = manager.withRepository(this.imageRepo_);

      const { title, description, images, status } = body;

      if (!images.length) {
        throw new MedusaError(
          "IMAGE_REQUIRED",
          "Must be at least one image",
          "400"
        );
      }
      let banner = bannerRepo.create({
        title,
        description,
        status,
      });

      banner.images = await imageRepo.upsertImages(images);
      banner = await bannerRepo.save(banner);

      return banner;
    });
  }

  async getActiveBanner(): Promise<Banner> {
    const bannerRepo = this.activeManager_.withRepository(this.bannerRepo_);
    const banner = await bannerRepo.findOne({
      where: {
        status: BannerStatus.ACTIVE,
      },
      order: {
        updated_at: "DESC",
      },
      relations: {
        images: true,
      },
    });
    return banner;
  }

  async delete(id: string) {
    return this.atomicPhase_(async (manager) => {
      const bannerRepo = manager.withRepository(this.bannerRepo_);
      const banner = await bannerRepo.findOne({
        where: {
          id,
        },
      });
      if (!banner)
        throw new MedusaError("NOT_FOUND", "Banner not found", "404");
      return await bannerRepo.softDelete({ id });
    });
  }

  async getOne(id: string) {
    const bannerRepo = this.activeManager_.withRepository(this.bannerRepo_);

    const banner = await bannerRepo.findOne({
      where: {
        id,
      },
    });
    if (!banner) throw new MedusaError("NOT_FOUND", "Banner not found", "404");
    return banner;
  }

  async edit(id: string, body: CreateBannerDto) {
    return this.atomicPhase_(async (manager) => {
      const { title, description, images, status } = body;
      const bannerRepo = manager.withRepository(this.bannerRepo_);
      const imageRepo = manager.withRepository(this.imageRepo_);
      let banner = await bannerRepo.findOne({
        where: {
          id,
        },
      });
      if (!banner)
        throw new MedusaError("NOT_FOUND", "Banner not found", "404");
      banner.images = await imageRepo.upsertImages(images);

      banner = await bannerRepo.save({
        ...banner,
        title,
        description,
        status,
      });

      return banner;
    });
  }
}

export default BannerService;
