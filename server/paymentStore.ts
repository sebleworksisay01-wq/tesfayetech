import { PaymentRecord, PaymentStatus, PaymentItemType } from '../src/types/payment';
import fs from 'fs';
import path from 'path';

// Local persistent file store path for resilience across restarts
const STORE_FILE = path.resolve(process.cwd(), '.payment_store.json');

class PaymentStore {
  private payments: Map<string, PaymentRecord> = new Map();
  private idempotencyMap: Map<string, string> = new Map();

  constructor() {
    this.loadFromDisk();
    this.seedDefaultDemoPaymentsIfEmpty();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const data: PaymentRecord[] = JSON.parse(raw);
        data.forEach((p) => {
          this.payments.set(p.outTradeNo, p);
          if (p.idempotencyKey) {
            this.idempotencyMap.set(p.idempotencyKey, p.outTradeNo);
          }
        });
      }
    } catch (e) {
      console.warn('Could not load persistent payment store, starting fresh:', e);
    }
  }

  private saveToDisk() {
    try {
      const array = Array.from(this.payments.values());
      fs.writeFileSync(STORE_FILE, JSON.stringify(array, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not save payments to disk:', e);
    }
  }

  private seedDefaultDemoPaymentsIfEmpty() {
    if (this.payments.size === 0) {
      const demoRecords: PaymentRecord[] = [
        {
          id: 'TT-20261020-00192',
          outTradeNo: 'TT-20261020-00192',
          telebirrTradeNo: 'TB20261020948192',
          userId: 'demo-user-1',
          customerName: 'Abebe Bikila',
          customerEmail: 'abebe.b@example.com',
          customerPhone: '0911223344',
          title: 'Kubernetes Production Hardening Policy Bundle',
          description: 'Full commercial license and deployment blueprints',
          itemType: 'resource',
          itemId: 'res-k8s-prod',
          amount: 850,
          currency: 'ETB',
          provider: 'telebirr',
          status: 'SUCCESS',
          paidAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          verifiedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 49).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        },
        {
          id: 'TT-20261022-00431',
          outTradeNo: 'TT-20261022-00431',
          telebirrTradeNo: 'TB20261022119284',
          userId: 'demo-user-2',
          customerName: 'Seble Sisay',
          customerEmail: 'sebleworksisay01@gmail.com',
          customerPhone: '0922446688',
          title: 'Architecture Review Sprint — Zero-Trust Migration',
          description: '2-week dedicated technical review with principal architect',
          itemType: 'consulting',
          itemId: 'service-arch-sprint',
          amount: 25000,
          currency: 'ETB',
          provider: 'telebirr',
          status: 'SUCCESS',
          paidAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          verifiedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 13).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
      ];

      demoRecords.forEach((r) => this.payments.set(r.outTradeNo, r));
      this.saveToDisk();
    }
  }

  public generateOutTradeNo(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(10000 + Math.random() * 90000).toString();
    return `TT-${dateStr}-${randomHex}`;
  }

  public createPayment(data: {
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
  }): PaymentRecord {
    // Check idempotency
    if (data.idempotencyKey && this.idempotencyMap.has(data.idempotencyKey)) {
      const existingRef = this.idempotencyMap.get(data.idempotencyKey)!;
      const existing = this.payments.get(existingRef);
      if (existing) {
        return existing;
      }
    }

    const outTradeNo = this.generateOutTradeNo();
    const now = new Date().toISOString();

    const payment: PaymentRecord = {
      id: outTradeNo,
      outTradeNo,
      userId: data.userId || '',
      customerName: data.customerName.trim(),
      customerEmail: (data.customerEmail || '').trim(),
      customerPhone: data.customerPhone.trim(),
      title: data.title.trim(),
      description: data.description?.trim(),
      itemType: data.itemType,
      itemId: data.itemId,
      amount: Math.round(data.amount * 100) / 100, // round to 2 decimals
      currency: 'ETB',
      provider: 'telebirr',
      status: 'PENDING',
      idempotencyKey: data.idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };

    this.payments.set(outTradeNo, payment);
    if (data.idempotencyKey) {
      this.idempotencyMap.set(data.idempotencyKey, outTradeNo);
    }
    this.saveToDisk();

    return payment;
  }

  public getByOutTradeNo(outTradeNo: string): PaymentRecord | undefined {
    return this.payments.get(outTradeNo);
  }

  public updateStatus(
    outTradeNo: string,
    status: PaymentStatus,
    telebirrTradeNo?: string,
    rawCallback?: Record<string, unknown>,
    failureReason?: string
  ): PaymentRecord | undefined {
    const payment = this.payments.get(outTradeNo);
    if (!payment) return undefined;

    // Idempotency: Do not revert or overwrite a SUCCESS payment
    if (payment.status === 'SUCCESS' && status !== 'SUCCESS') {
      console.warn(`Attempt to change status of already SUCCESS payment ${outTradeNo} rejected.`);
      return payment;
    }

    const now = new Date().toISOString();
    payment.status = status;
    payment.updatedAt = now;

    if (status === 'SUCCESS') {
      payment.paidAt = now;
      payment.verifiedAt = now;
    }

    if (telebirrTradeNo) {
      payment.telebirrTradeNo = telebirrTradeNo;
    }

    if (rawCallback) {
      payment.rawCallback = rawCallback;
    }

    if (failureReason) {
      payment.failureReason = failureReason;
    }

    this.payments.set(outTradeNo, payment);
    this.saveToDisk();
    return payment;
  }

  public getCustomerPayments(userId: string, email?: string): PaymentRecord[] {
    const all = Array.from(this.payments.values());
    return all
      .filter((p) => {
        if (userId && p.userId === userId) return true;
        if (email && p.customerEmail && p.customerEmail.toLowerCase() === email.toLowerCase()) return true;
        return false;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAllPayments(): PaymentRecord[] {
    return Array.from(this.payments.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getAnalytics() {
    const all = Array.from(this.payments.values());
    const totalSuccessful = all.filter((p) => p.status === 'SUCCESS');
    const totalRevenueETB = totalSuccessful.reduce((sum, p) => sum + p.amount, 0);
    const pendingCount = all.filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING').length;
    const failedCount = all.filter((p) => p.status === 'FAILED' || p.status === 'CANCELLED' || p.status === 'EXPIRED').length;

    return {
      totalRevenueETB,
      totalCount: all.length,
      successCount: totalSuccessful.length,
      pendingCount,
      failedCount,
      currency: 'ETB',
    };
  }
}

export const paymentStore = new PaymentStore();
