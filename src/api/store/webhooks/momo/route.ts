import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import MomoWebhookService from "src/services/webhook-momo";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const momoService =
    req.scope.resolve<MomoWebhookService>("momoWebhookService");
  const { statusCode } = await momoService.handleTransaction(req.body);
  res.sendStatus(statusCode);
}
