import {
  PaymentRecord,
  TelebirrInitiateRequest,
  TelebirrInitiateResponse,
  TelebirrVerifyResponse,
  TelebirrConfigSummary,
} from '../types/payment';

export async function initiateTelebirrPayment(
  data: TelebirrInitiateRequest
): Promise<TelebirrInitiateResponse> {
  const response = await fetch('/api/payments/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || json.message || 'Failed to initiate Telebirr payment');
  }

  return json;
}

export async function getPaymentStatus(outTradeNo: string): Promise<PaymentRecord> {
  const response = await fetch(`/api/payments/status/${encodeURIComponent(outTradeNo)}`);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Failed to fetch payment status');
  }
  return json.payment;
}

export async function verifyPaymentWithGateway(outTradeNo: string): Promise<TelebirrVerifyResponse> {
  const response = await fetch(`/api/payments/verify/${encodeURIComponent(outTradeNo)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Failed to verify payment with gateway');
  }
  return json;
}

export async function getMyPayments(userId?: string, email?: string): Promise<PaymentRecord[]> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (email) params.append('email', email);

  const response = await fetch(`/api/payments/my-payments?${params.toString()}`);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Failed to fetch user payments');
  }
  return json.payments || [];
}

export async function getAdminPayments(): Promise<{
  analytics: {
    totalRevenueETB: number;
    totalCount: number;
    successCount: number;
    pendingCount: number;
    failedCount: number;
    currency: string;
  };
  payments: PaymentRecord[];
}> {
  const response = await fetch('/api/admin/payments');
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Failed to fetch admin payments');
  }
  return json;
}

export async function recheckAdminPayment(outTradeNo: string): Promise<PaymentRecord> {
  const response = await fetch(`/api/admin/payments/${encodeURIComponent(outTradeNo)}/recheck`, {
    method: 'POST',
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Failed to recheck order');
  }
  return json.payment;
}

export async function markManualPaymentVerified(
  outTradeNo: string,
  adminEmail: string,
  reason: string
): Promise<PaymentRecord> {
  const response = await fetch(`/api/admin/payments/${encodeURIComponent(outTradeNo)}/mark-manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminEmail, reason }),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Failed to manual verify payment');
  }
  return json.payment;
}

export async function simulateGatewayAction(
  outTradeNo: string,
  token: string | null,
  action: 'approve' | 'cancel' | 'fail' | 'expire'
): Promise<{ success: boolean; status: string; payment?: PaymentRecord }> {
  const response = await fetch('/api/payments/simulate-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outTradeNo, token, action }),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Simulation action failed');
  }
  return json;
}

export async function getTelebirrConfig(): Promise<TelebirrConfigSummary> {
  const response = await fetch('/api/telebirr/config');
  return response.json();
}
