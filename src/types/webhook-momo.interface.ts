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
