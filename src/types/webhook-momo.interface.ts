export interface ICheckPaymentStatusResponse {
  partnerCode: string;
  requestId: string;
  orderId: string;
  extraData: string;
  amount: number;
  transId: number;
  payType: EPayType;
  resultCode: number;
  refundTrans: IRefundTrans[];
  message: string;
  responseTime: number;
  lastUpdated: number;
}

export interface IWebhookMomoRequest {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: EPayType;
  responseTime: number;
  extraData: string;
  signature: string;
}

export enum EPayType {
  WEB_APP = "webApp",
  APP = "app",
  QR = "qr",
  MINI_APP = "miniapp",
  NAPAS = "napas",
  CREDIT = "credit",
}

export interface IRefundTrans {
  orderId: string;
  amount: number;
  resultCode: number;
  transId: number;
  createdTime: number;
}

