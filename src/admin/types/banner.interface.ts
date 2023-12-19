export interface IBanner {
  id?: string;
  title: string;
  description?: string;
  status: BannerStatus;
  create_at?: Date;
}

export enum BannerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}
