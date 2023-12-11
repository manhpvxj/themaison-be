import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  res.sendStatus(200);
}
