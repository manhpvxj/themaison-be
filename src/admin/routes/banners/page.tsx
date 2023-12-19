import { RouteConfig, RouteProps } from "@medusajs/admin";
import { PhotoSolid, PlusMini } from "@medusajs/icons";
import { Banner } from "../../../models/banner";
import { BannerTable } from "../../templates/banners/banner-table";

const ListBannerPage = ({ notify }: RouteProps) => {
  const onSuccess = (banner: Banner) => {
    notify.success("Success", `Banner ${banner.title} created successfully`);
  };
  return (
    <div className="flex h-full flex-col">
      <BannerTable />
    </div>
  );
};

export const config: RouteConfig = {
  link: {
    label: "Banners",
    icon: PhotoSolid,
  },
};

export default ListBannerPage;
