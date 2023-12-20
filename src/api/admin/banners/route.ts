import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import BannerService from "../../../services/banner";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const bannerService = req.scope.resolve<BannerService>("bannerService");
  const { limit, page } = req.query;
  console.log("limit", limit);
  console.log("page", page);
  const { banners, count } = await bannerService.getList({
    skip: req.listConfig?.skip,
    take: req.listConfig?.take,
  });

  res.json({ banners, count });
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const bannerService = req.scope.resolve<BannerService>("bannerService");
  const banner = await bannerService.create(req.body);
  res.json(banner);
}
