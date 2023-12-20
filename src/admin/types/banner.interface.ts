import { FormImage } from "./shared";

export interface IBanner {
  id?: string;
  title: string;
  description?: string;
  status: BannerStatus;
  created_at?: Date;
}

export enum BannerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export type ImageType = {
  selected: boolean;
  url: string;
  name?: string;
  size?: number;
  nativeFile?: File;
};

export type NewBannerForm = {
  title: string;
  description?: string;
  images?: ImageType[];
  status?: string;
};

export type UploadRes = {
  uploads: FormImage[];
};
