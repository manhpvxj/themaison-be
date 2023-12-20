import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import BannerService from "../../../services/banner";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bannerService = req.scope.resolve<BannerService>("bannerService");
  const banner = await bannerService.getActiveBanner();
  res.json({ banner });
}
