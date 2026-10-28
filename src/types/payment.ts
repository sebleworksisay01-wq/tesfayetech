export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentItemType =
  | 'consulting'
  | 'service'
  | 'resource'
  | 'subscription'
  | 'custom_invoice';

export interface PaymentRecord {
  id: string; // paymentId / outTradeNo
  outTradeNo: string;
  telebirrTradeNo?: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  title: string;
  description?: string;
  itemType: PaymentItemType;
  itemId?: string;
  amount: number; // in Ethiopian Birr (ETB)
  currency: 'ETB';
  provider: 'telebirr';
  status: PaymentStatus;
  idempotencyKey?: string;
  paymentUrl?: string;
  paidAt?: string;
  verifiedAt?: string;
  failureReason?: string;
  rawCallback?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TelebirrInitiateRequest {
  title: string;
  description?: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  itemType: PaymentItemType;
  itemId?: string;
  userId?: string;
  idempotencyKey?: string;
}

export interface TelebirrInitiateResponse {
  success: boolean;
  payment: PaymentRecord;
  paymentUrl: string;
  mode: 'sandbox' | 'live';
  message?: string;
}

export interface TelebirrVerifyResponse {
  success: boolean;
  outTradeNo: string;
  status: PaymentStatus;
  telebirrTradeNo?: string;
  amount: number;
  currency: string;
  paidAt?: string;
  verifiedAt?: string;
  isVerified: boolean;
  payment?: PaymentRecord;
  message?: string;
}

export interface TelebirrConfigSummary {
  environment: 'sandbox' | 'production';
  merchantId: string;
  appId: string;
  shortCode: string;
  notifyUrl: string;
  returnUrl: string;
  isConfigured: boolean;
}
