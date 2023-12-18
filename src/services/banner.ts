import { TransactionBaseService } from "@medusajs/medusa";
import { BannerRepository } from "../repositories/banner";
import { Banner } from "../models/banner";

class BannerService extends TransactionBaseService {
  protected bannerRepo_: BannerRepository;
  constructor(container) {
    super(container);
    this.bannerRepo_ = container.bannerRepository;
  }
  async getList(): Promise<Banner[]> {
    const bannerRepo = this.activeManager_.withRepository(this.bannerRepo_);
    return await bannerRepo.find();
  }
}

export default BannerService;
