import { TransactionBaseService } from "@medusajs/medusa";
import { BannerRepository } from "../repositories/banner";
import { Banner } from "../models/banner";
import ImageRepository from "@medusajs/medusa/dist/repositories/image";
import { CreateBannerDto } from "../dtos/banner";
import { MedusaError } from "medusa-core-utils";

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
}

export default BannerService;
