import { TransactionBaseService, CartService } from "@medusajs/medusa";
import { ICheckPaymentStatusResponse } from "src/types/webhook-momo.interface";

class MomoWebhookService extends TransactionBaseService {
  protected readonly cartService_: CartService;
  constructor(container) {
    super(container);
    this.cartService_ = container.cartService;
  }
  async getTransaction(body: ICheckPaymentStatusResponse) {
    const { orderId } = body;

    const order = await this.cartService_.authorizePayment(orderId);

    // if(order.)
  }
}

export default MomoWebhookService;

