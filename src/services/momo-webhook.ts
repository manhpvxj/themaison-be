import {
  AbstractCartCompletionStrategy,
  CartService,
  IdempotencyKeyService,
  Logger,
  OrderService,
  PaymentProviderService,
  TransactionBaseService,
} from "@medusajs/medusa";
import { MedusaError } from "medusa-core-utils";
import { IWebhookMomoRequest } from "../types/webhook-momo.interface";
import { createHmacString } from "../utils";
import { EntityManager } from "typeorm";

class MomoWebhookService extends TransactionBaseService {
  protected readonly manager_: EntityManager;
  protected readonly cartService_: CartService;
  protected readonly orderService_: OrderService;
  protected readonly logger_: Logger;
  protected readonly completionStrat_: AbstractCartCompletionStrategy;
  protected readonly idempotencyKeyService_: IdempotencyKeyService;
  protected readonly paymentSession_: PaymentProviderService;

  constructor(container) {
    super(container);
    this.manager_ = container.manager;
    this.cartService_ = container.cartService;
    this.orderService_ = container.orderService;
    this.logger_ = container.logger;
    this.completionStrat_ = container.cartCompletionStrategy;
    this.idempotencyKeyService_ = container.idempotencyKeyService;
  }
  async handleTransaction(body: IWebhookMomoRequest) {
    const isMomo = this.verifyIpnSignature(body);
    if (!isMomo) {
      this.logger_.error("Invalid signature");
      return {
        statusCode: 204,
      };
    }
    await this.manager_.transaction(async (transactionManager) => {
      const { orderId: cartId } = body;
      this.logger_.info(`completing cart ${cartId}`);

      const order = await this.orderService_
        .withTransaction(transactionManager)
        .retrieveByCartId(cartId)
        .catch((_) => undefined);

      if (!order) {
        await this.cartService_
          .withTransaction(transactionManager)
          .setPaymentSession(cartId, "momo");

        await this.cartService_
          .withTransaction(transactionManager)
          .authorizePayment(cartId);
        await this.orderService_
          .withTransaction(transactionManager)
          .createFromCart(cartId);
        return { statusCode: 204 };
      }

      // if (!order) {
      //   this.logger_.info(`initiating cart completing startegy ${cartId}`);
      //   const idempotencyKeyServiceTx =
      //     this.idempotencyKeyService_.withTransaction(transactionManager);
      //   let idempotencyKey = await idempotencyKeyServiceTx
      //     .retrieve({
      //       request_path: "/webhooks/momo",
      //       idempotency_key: cartId,
      //     })
      //     .catch(() => undefined);

      //   if (!idempotencyKey) {
      //     idempotencyKey = await this.idempotencyKeyService_
      //       .withTransaction(transactionManager)
      //       .create({
      //         request_path: "/webhooks/momo",
      //         idempotency_key: cartId,
      //       });
      //   }
      //   this.logger_.info(`obtained idempotence key ${cartId}`);
      //   const cart = await this.cartService_
      //     .withTransaction(transactionManager)
      //     .retrieve(cartId, { select: ["context"] });

      //   const { response_code, response_body } = await this.completionStrat_
      //     .withTransaction(transactionManager)
      //     .complete(cartId, idempotencyKey, { ip: cart.context?.ip as string });

      //   if (response_code !== 200) {
      //     this.logger_.error(MedusaError.Types.UNEXPECTED_STATE, {
      //       message: response_body["message"],
      //       code: response_body["code"],
      //     });
      //   }
      //   return { statusCode: 204 };
      // } else {
      //   this.logger_.info(`cart completed ${cartId}`);
      // }
    });
  }
  verifyIpnSignature = (body: IWebhookMomoRequest) => {
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body;
    const rawSignature = [
      `accessKey=${accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ].join("&");
    const correctSignature = createHmacString(rawSignature, secretKey);
    console.log(rawSignature, correctSignature);
    return correctSignature === signature;
  };
}

export default MomoWebhookService;
