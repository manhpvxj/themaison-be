import { BannerStatus } from "../enums/enum.banner";

export interface CreateBannerDto {
  title: string;
  description?: string;
  status?: BannerStatus;
  images?: string[];
}
