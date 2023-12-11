import {
  AbstractCartCompletionStrategy,
  CartService,
  IdempotencyKeyService,
  Logger,
  OrderService,
  TransactionBaseService,
} from "@medusajs/medusa";
import { MedusaError } from "medusa-core-utils";
import { IWebhookMomoRequest } from "src/types/webhook-momo.interface";
import { createHmacString } from "src/utils";
import { EntityManager } from "typeorm";

class MomoWebhookService extends TransactionBaseService {
  protected readonly manager_: EntityManager;
  protected readonly cartService_: CartService;
  protected readonly orderService_: OrderService;
  protected readonly logger_: Logger;
  protected readonly completionStrat_: AbstractCartCompletionStrategy;
  protected readonly idempotencyKeyService_: IdempotencyKeyService;

  constructor(container) {
    super(container);
    this.manager_ = container.resolve("manager");
    this.cartService_ = container.resolve("cartService");
    this.orderService_ = container.resolve("orderService");
    this.logger_ = container.resolve("logger");
    this.completionStrat_ = container.resolve("cartCompletionStrategy");
    this.idempotencyKeyService_ = container.resolve("idempotencyKeyService");
  }
  async handleTransaction(body: IWebhookMomoRequest) {
    await this.manager_.transaction(async (transactionManager) => {
      const { orderId: cartId } = body;
      this.logger_.info(`completing cart ${cartId}`);
      const order = await this.orderService_
        .retrieveByCartId(cartId)
        .catch(() => undefined);

      if (!order) {
        this.logger_.info(`initiating cart completing startegy ${cartId}`);

        const idempotencyKeyServiceTx =
          this.idempotencyKeyService_.withTransaction(transactionManager);
        let idempotencyKey = await idempotencyKeyServiceTx
          .retrieve({
            request_path: "/webhooks/momo",
            idempotency_key: cartId,
          })
          .catch(() => undefined);

        if (!idempotencyKey) {
          idempotencyKey = await this.idempotencyKeyService_
            .withTransaction(transactionManager)
            .create({
              request_path: "/webhooks/momo",
              idempotency_key: cartId,
            });
        }
        this.logger_.info(`obtained idempotence key ${cartId}`);
        const cart = await this.cartService_
          .withTransaction(transactionManager)
          .retrieve(cartId, { select: ["context"] });

        const { response_code, response_body } = await this.completionStrat_
          .withTransaction(transactionManager)
          .complete(cartId, idempotencyKey, { ip: cart.context?.ip as string });

        if (response_code !== 200) {
          throw new MedusaError(
            MedusaError.Types.UNEXPECTED_STATE,
            response_body["message"] as string,
            response_body["code"] as string
          );
        }
      } else {
        this.logger_.info(`cart completed ${cartId}`);
      }
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

