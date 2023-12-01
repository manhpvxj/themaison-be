import { Logger } from "@medusajs/medusa";
import {
  ICheckPaymentStatusRequest,
  ICheckPaymentStatusResponse,
  ICreatePaymentRequest,
  ICreatePaymentResponse,
} from "src/types/momo.interface";
import {
  CheckPaymentStatusDto,
  CreatePaymentDto,
  IPNDto,
} from "../dtos/momo.dto";
import { v4 as uuid } from "uuid";
import axios, { AxiosRequestConfig, AxiosInstance } from "axios";
import crypto from "crypto";

export const MomoPath = {
  CREATE_PAYMENT: "/v2/gateway/api/create",
  CHECK_PAYMENT_STATUS: "/v2/gateway/api/query",
};

export class MomoService {
  constructor(logger: Logger) {
    this.logger_ = logger;
    const axiosInstance = axios.create({
      baseURL: process.env.MOMO_ENDPOINT_URL,
    });

    this.httpClient = axiosInstance;
  }
  private readonly logger_?: Logger;
  private readonly httpClient: AxiosInstance;

  public async createPayment(
    data: CreatePaymentDto
  ): Promise<ICreatePaymentResponse> {
    const body: ICreatePaymentRequest = {
      ...data,
      partnerCode: process.env.MOMO_PARTNER_CODE,
      // subPartnerCode: process.env.MOMO_SUB_PARTNER_CODE,
      // partnerName: process.env.MOMO_PARTNER_NAME,
      // storeId: process.env.MOMO_STORE_ID,
      requestId: uuid(),
      redirectUrl: process.env.MOMO_REDIRECT_URL,
      ipnUrl: "",
      signature: "",
    };
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${body.amount}&extraData=${body.extraData}&ipnUrl=${body.ipnUrl}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&partnerCode=${body.partnerCode}&redirectUrl=${body.redirectUrl}&requestId=${body.requestId}&requestType=${body.requestType}`;
    body.signature = crypto
      .createHmac("sha256", process.env.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");
    const config: AxiosRequestConfig<ICreatePaymentRequest> = {
      method: "POST",
      url: MomoPath.CREATE_PAYMENT,
      data: body,
    };
    return await this.fetcher<ICreatePaymentResponse>(config);
  }

  public async checkPaymentStatus(
    data: CheckPaymentStatusDto
  ): Promise<ICheckPaymentStatusResponse> {
    const body: ICheckPaymentStatusRequest = {
      ...data,
      partnerCode: process.env.MOMO_PARTNER_CODE,
      requestId: uuid(),
      signature: "",
    };
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&orderId=${body.orderId}&partnerCode=${body.partnerCode}&requestId=${body.requestId}`;
    body.signature = crypto
      .createHmac("sha256", process.env.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");
    const config: AxiosRequestConfig<ICheckPaymentStatusRequest> = {
      method: "POST",
      url: MomoPath.CHECK_PAYMENT_STATUS,
      data: body,
    };
    return await this.fetcher<ICheckPaymentStatusResponse>(config);
  }

  public async IPNHandler(data: IPNDto): Promise<void> {
    this.logger_.log("IPNHandler", JSON.stringify(data));
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${data.amount}&extraData=${data.extraData}&message=${data.message}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${data.partnerCode}&payType=${data.payType}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}&transId=${data.transId}`;
    const signature = crypto
      .createHmac("sha256", process.env.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");
    if (signature !== data.signature) {
      // throw new HttpExc.BusinessException({
      //   message: "Invalid signature",
      // });
      // throw new formatException('Invalid signature');
    }
    // const invoice = await this.invoiceRepository.findOneBy({
    //   id: parseInt(
    //     data.orderId.replace(
    //       `INVOICE_${process.env.SR.PRODUCT_NAME}_`,
    //       ""
    //     ),
    //     10
    //   ),
    //   status: EInvoiceStatus.UNPAID,
    // });
    // if (invoice && invoice.payment["requestId"] === data.requestId) {
    //   if (data.resultCode === 0) {
    //     invoice.status = EInvoiceStatus.PAID;
    //     invoice.paymentAt = new Date(data.responseTime);
    //   } else {
    //     invoice.status = EInvoiceStatus.PAILED;
    //     const variant = invoice.invoiceItems.map((item) => ({
    //       ...item.variant,
    //       quantity: item.variant.quantity + item.quantity,
    //     }));
    //     await this.variantRepository.save(variant);
    //   }
    //   const job = await this.queueInvoice.getJob(data.orderId);
    //   if (job) {
    //     await job.remove();
    //   }
    //   await this.invoiceRepository.save(invoice);
    // }
  }

  private async fetcher<T>(config: AxiosRequestConfig): Promise<T> {
    config = {
      ...config,
    };
    try {
      const res = await this.httpClient.request<T>(config);
      const result = res.data;
      return result;
    } catch (error) {
      this.logger_.error(error);
      // throw new MedusaExc.BusinessException({
      //   message: error.message,
      // });
      throw new Error(error.message);
    }
  }
}
