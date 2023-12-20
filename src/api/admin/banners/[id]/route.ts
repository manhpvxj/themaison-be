import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import BannerService from "../../../../services/banner";

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const bannerService = req.scope.resolve<BannerService>("bannerService");
  const { affected, raw } = await bannerService.delete(id);
  res.json({ affected, raw });
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const bannerService = req.scope.resolve<BannerService>("bannerService");
  const banner = bannerService.getOne(id);

  res.json({ banner });
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params;
  const bannerService = req.scope.resolve<BannerService>("bannerService");
  const banner = bannerService.edit(id, req.body);

  res.json({ banner });
}
