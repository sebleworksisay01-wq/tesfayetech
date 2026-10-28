import crypto from 'crypto';
import { PaymentRecord, PaymentStatus } from '../src/types/payment';

export interface TelebirrConfig {
  env: 'sandbox' | 'production';
  appId: string;
  merchantId: string;
  shortCode: string;
  appKey: string;
  publicKey: string;
  privateKey: string;
  apiBaseUrl: string;
  notifyUrl: string;
  returnUrl: string;
  timeoutMinutes: number;
}

// Generate fallback RSA key pair in-memory for zero-friction sandbox cryptographic validation
function generateFallbackKeyPair() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  return { privateKey, publicKey };
}

const fallbackKeys = generateFallbackKeyPair();

export class TelebirrService {
  private config: TelebirrConfig;

  constructor() {
    const isProd = process.env.TELEBIRR_ENV === 'production';
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    this.config = {
      env: isProd ? 'production' : 'sandbox',
      appId: process.env.TELEBIRR_APP_ID || 'telebirr_app_85b26',
      merchantId: process.env.TELEBIRR_MERCHANT_ID || 'tesfaye_tech_merch',
      shortCode: process.env.TELEBIRR_SHORT_CODE || '100845',
      appKey: process.env.TELEBIRR_APP_KEY || 'app_key_tesfayetech_sec_2026',
      publicKey: process.env.TELEBIRR_PUBLIC_KEY || fallbackKeys.publicKey,
      privateKey: process.env.TELEBIRR_PRIVATE_KEY || fallbackKeys.privateKey,
      apiBaseUrl:
        process.env.TELEBIRR_API_BASE_URL ||
        (isProd
          ? 'https://app.ethiomobilemoney.et:2121/ammapi/payment/service-openup/toTradeWebPay'
          : 'https://app.ethiomobilemoney.et:2121/ammapi/payment/service-openup/toTradeWebPay'),
      notifyUrl: process.env.TELEBIRR_NOTIFY_URL || `${baseUrl}/api/payments/telebirr/callback`,
      returnUrl: process.env.TELEBIRR_RETURN_URL || `${baseUrl}/#/payment-result`,
      timeoutMinutes: parseInt(process.env.TELEBIRR_TIMEOUT_MINUTES || '30', 10),
    };
  }

  public getConfigSummary() {
    return {
      environment: this.config.env,
      merchantId: this.config.merchantId,
      appId: this.config.appId,
      shortCode: this.config.shortCode,
      notifyUrl: this.config.notifyUrl,
      returnUrl: this.config.returnUrl,
      isConfigured: !!(process.env.TELEBIRR_PRIVATE_KEY && process.env.TELEBIRR_APP_ID),
    };
  }

  /**
   * Generates a canonical query string sorted by key alphabetically.
   * Telebirr specification requires alphabetical parameter sorting excluding empty values and 'sign'.
   */
  public buildSignString(params: Record<string, string | number | undefined | null>): string {
    const keys = Object.keys(params)
      .filter((k) => k !== 'sign' && params[k] !== undefined && params[k] !== null && params[k] !== '')
      .sort();

    return keys.map((k) => `${k}=${params[k]}`).join('&');
  }

  /**
   * Signs a data string using SHA256withRSA with the Merchant RSA Private Key.
   */
  public signWithRsaSha256(data: string): string {
    try {
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(data, 'utf8');
      sign.end();
      return sign.sign(this.config.privateKey, 'base64');
    } catch (err) {
      console.error('Error signing Telebirr request payload:', err);
      throw new Error(`Failed to sign request with RSA private key: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Verifies an RSA signature using Telebirr's RSA Public Key.
   */
  public verifySignature(data: string, signature: string): boolean {
    try {
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(data, 'utf8');
      verify.end();
      return verify.verify(this.config.publicKey, signature, 'base64');
    } catch (err) {
      console.error('Signature verification error:', err);
      return false;
    }
  }

  /**
   * Generates a cryptographic verification token for the checkout session.
   */
  public generateSessionToken(outTradeNo: string, amount: number): string {
    return crypto
      .createHmac('sha256', this.config.appKey)
      .update(`${outTradeNo}:${amount.toFixed(2)}:${this.config.appId}`)
      .digest('hex');
  }

  /**
   * Validates the session token.
   */
  public verifySessionToken(outTradeNo: string, amount: number, token: string): boolean {
    const expected = this.generateSessionToken(outTradeNo, amount);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  }

  /**
   * Initiates a Telebirr Web/H5 payment checkout.
   */
  public async createWebPayment(payment: PaymentRecord): Promise<{ paymentUrl: string; rawPayload: any }> {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const totalAmount = payment.amount.toFixed(2);

    const payloadParams: Record<string, string> = {
      appId: this.config.appId,
      nonce: nonce,
      notifyUrl: this.config.notifyUrl,
      outTradeNo: payment.outTradeNo,
      receiveName: 'TesfayeTech Enterprise Services',
      returnUrl: `${this.config.returnUrl}?outTradeNo=${encodeURIComponent(payment.outTradeNo)}`,
      shortCode: this.config.shortCode,
      subject: payment.title,
      timeoutExpress: `${this.config.timeoutMinutes}m`,
      timestamp: timestamp,
      totalAmount: totalAmount,
    };

    // Build canonical string and generate RSA-SHA256 digital signature
    const stringToSign = this.buildSignString(payloadParams);
    const sign = this.signWithRsaSha256(stringToSign);

    const requestBody = {
      ...payloadParams,
      sign,
    };

    // If sandbox mode is active or live credentials are not yet verified with Ethio Telecom
    if (this.config.env === 'sandbox' || !process.env.TELEBIRR_PRIVATE_KEY) {
      const sessionToken = this.generateSessionToken(payment.outTradeNo, payment.amount);
      const simulationCheckoutUrl = `/#/telebirr-gateway?outTradeNo=${encodeURIComponent(
        payment.outTradeNo
      )}&token=${sessionToken}&amount=${payment.amount}&title=${encodeURIComponent(payment.title)}`;

      return {
        paymentUrl: simulationCheckoutUrl,
        rawPayload: requestBody,
      };
    }

    // In production with live Telebirr Gateway:
    try {
      const response = await fetch(this.config.apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telebirr-Signature': sign,
        },
        body: JSON.stringify(requestBody),
      });

      const json = await response.json();
      if (json.code === 0 && json.data && json.data.toPayUrl) {
        return {
          paymentUrl: json.data.toPayUrl,
          rawPayload: json,
        };
      }

      console.warn('Telebirr live API returned unexpected payload:', json);
      // Fallback to secure return URL or error
      return {
        paymentUrl: json.data?.toPayUrl || `/#/payment-result?outTradeNo=${payment.outTradeNo}`,
        rawPayload: json,
      };
    } catch (err) {
      console.error('Telebirr Live API request failed:', err);
      throw new Error(`Unable to reach Telebirr payment server: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Helper to craft a cryptographically valid callback payload for sandbox simulation
   */
  public generateSandboxCallback(payment: PaymentRecord, isSuccess = true): { payload: any; sign: string } {
    const tradeNo = `TB${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
    const tradeDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const data: Record<string, string> = {
      appId: this.config.appId,
      msisdn: payment.customerPhone || '251911234567',
      outTradeNo: payment.outTradeNo,
      totalAmount: payment.amount.toFixed(2),
      tradeDate: tradeDate,
      tradeNo: tradeNo,
      tradeStatus: isSuccess ? 'Completed' : 'Failed',
    };

    const signString = this.buildSignString(data);
    const sign = this.signWithRsaSha256(signString);

    return {
      payload: {
        ...data,
        sign,
      },
      sign,
    };
  }

  /**
   * Recheck order status from Telebirr server or sandbox query API.
   */
  public async queryOrder(outTradeNo: string): Promise<{
    found: boolean;
    status: PaymentStatus;
    telebirrTradeNo?: string;
    raw?: any;
  }> {
    // In production, query the Telebirr queryOrder endpoint
    if (this.config.env === 'production' && process.env.TELEBIRR_PRIVATE_KEY) {
      try {
        const queryUrl = this.config.apiBaseUrl.replace('toTradeWebPay', 'queryOrder');
        const timestamp = Date.now().toString();
        const nonce = crypto.randomBytes(16).toString('hex');
        const params = {
          appId: this.config.appId,
          nonce,
          outTradeNo,
          timestamp,
        };
        const signString = this.buildSignString(params);
        const sign = this.signWithRsaSha256(signString);

        const res = await fetch(queryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...params, sign }),
        });
        const resData = await res.json();
        if (resData.code === 0 && resData.data) {
          const isPaid = resData.data.tradeStatus === 'Completed' || resData.data.tradeStatus === 'Success';
          return {
            found: true,
            status: isPaid ? 'SUCCESS' : 'PENDING',
            telebirrTradeNo: resData.data.tradeNo,
            raw: resData,
          };
        }
      } catch (err) {
        console.error('Error querying Telebirr order:', err);
      }
    }

    return {
      found: false,
      status: 'PENDING',
    };
  }
}

export const telebirrService = new TelebirrService();
