import { RouteConfig, RouteProps } from "@medusajs/admin";
import { PhotoSolid } from "@medusajs/icons";
import { BannerTable } from "../../templates/banners/banner-table";

const ListBannerPage = ({ notify }: RouteProps) => {
  return (
    <div className="flex h-full flex-col">
      <BannerTable notify={notify} />
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
