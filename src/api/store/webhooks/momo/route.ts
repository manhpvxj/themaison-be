import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import MomoWebhookService from "../../../../services/momo-webhook";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const momoService: MomoWebhookService =
    req.scope.resolve("momoWebhookService");
  const { statusCode } = await momoService.handleTransaction(req.body);
  res.sendStatus(statusCode);
}
