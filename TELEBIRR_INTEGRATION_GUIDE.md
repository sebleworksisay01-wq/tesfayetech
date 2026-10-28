# Telebirr Payment Module Integration Guide — TesfayeTech

## 1. Overview
TesfayeTech now includes a production-ready, cryptographically secure payment integration with **Telebirr**, Ethiopia's leading mobile payment platform powered by Ethio Telecom.

This module allows customers to pay for:
- **Consulting Engagements & Advisory Retainers** (e.g., Architecture Review Sprint, DevOps & SRE retainers)
- **Technical Resource & Commercial Blueprints** (e.g., Enterprise Disaster Recovery Kit, Kubernetes Hardening packages)
- **Custom Invoices** (Direct invoice lookup and settlement in Ethiopian Birr - ETB)

---

## 2. Architecture & Security Flow

```
[Customer Browser] 
       │ 1. Checkout (Select Telebirr, input mobile)
       ▼
[TesfayeTech Express Backend] (server.ts)
       │ 2. Validates amount & contact info
       │ 3. Generates unique outTradeNo (TT-YYYYMMDD-XXXXX)
       │ 4. Signs payload with Merchant RSA Private Key (SHA256withRSA)
       │ 5. Returns authorized payment URL
       ▼
[Telebirr Payment Gateway] (Live H5 / Sandbox Simulator)
       │ 6. Customer enters PIN & authorizes payment
       │ 7. Telebirr dispatches signed HTTP POST callback to notifyUrl
       ▼
[TesfayeTech Server Webhook] (/api/payments/telebirr/callback)
       │ 8. Verifies RSA-SHA256 signature using Telebirr RSA Public Key
       │ 9. Validates received amount against original invoice amount (anti-tamper)
       │ 10. Idempotently marks status as SUCCESS and stores telebirrTradeNo
       ▼
[Customer Confirmation & Receipt] (/#/payment-result)
       │ 11. Displays confirmation, Telebirr Trade Ref, and printable official receipt
```

---

## 3. Environment Variables Configuration

Set these variables in your server environment or hosting secrets manager:

| Variable | Required in Live | Description |
|---|---|---|
| `TELEBIRR_ENV` | Yes | `sandbox` or `production` |
| `TELEBIRR_APP_ID` | Yes | Official Application ID issued by Ethio Telecom |
| `TELEBIRR_MERCHANT_ID` | Yes | Merchant Identifier / Account Number |
| `TELEBIRR_SHORT_CODE` | Yes | Short Code (e.g. `100845`) |
| `TELEBIRR_APP_KEY` | Yes | Telebirr Application Key for HMAC session hashing |
| `TELEBIRR_PRIVATE_KEY` | Yes | Merchant RSA Private Key (PEM format, PKCS#8) |
| `TELEBIRR_PUBLIC_KEY` | Yes | Telebirr Official RSA Public Key (PEM format, SPKI) |
| `TELEBIRR_API_BASE_URL` | Yes | Telebirr API Gateway Endpoint (`toTradeWebPay`) |
| `TELEBIRR_NOTIFY_URL` | Yes | Public webhook URL: `https://<domain>/api/payments/telebirr/callback` |
| `TELEBIRR_RETURN_URL` | Yes | Redirect destination: `https://<domain>/#/payment-result` |
| `TELEBIRR_TIMEOUT_MINUTES` | No | Session expiry window in minutes (Default: `30`) |

---

## 4. Onboarding Checklist for Live Production with Ethio Telecom

1. **Merchant Application**: Register a merchant enterprise account with Ethio Telecom Telebirr business department.
2. **Key Pair Generation**:
   Generate an RSA 2048-bit key pair:
   ```bash
   openssl genpkey -algorithm RSA -out merchant_private.pem -pkeyopt rsa_keygen_bits:2048
   openssl rsa -pubout -in merchant_private.pem -out merchant_public.pem
   ```
3. **Key Exchange**: Upload `merchant_public.pem` to the Telebirr Merchant Portal. Download the official Telebirr Public Key into `TELEBIRR_PUBLIC_KEY`.
4. **Set Webhook**: Provide your HTTPS webhook endpoint: `https://<your-domain>/api/payments/telebirr/callback`.
5. **Switch Environment**: Change `TELEBIRR_ENV="production"` in your environment configuration.

---

## 5. Security Measures & Protections

- **Zero Client-Side Secrets**: All private keys, merchant credentials, and signing routines reside exclusively on the server (`server/telebirrService.ts`).
- **Cryptographic Signature Verification**: Incoming callbacks are verified with RSA-SHA256 against Telebirr's official public key.
- **Price Tampering Protection**: The server cross-references the incoming callback `totalAmount` against the database record; any mismatch fails the payment and logs a security incident.
- **Strict Idempotency**: Repeated webhooks or page refreshes cannot duplicate transactions or alter a verified `SUCCESS` order.
- **Firestore Security Rules**: The `/payments/{paymentId}` rules prevent clients from modifying status fields directly.
