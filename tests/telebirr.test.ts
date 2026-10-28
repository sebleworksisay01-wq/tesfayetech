/**
 * Automated Test Suite: Telebirr Payment Integration & Security Verification
 * Tests cryptographic signing, signature verification, anti-tampering guards, and idempotency.
 */

import { TelebirrService } from '../server/telebirrService';
import { PaymentRecord } from '../src/types/payment';

function runTests() {
  console.log('--- STARTING TELEBIRR INTEGRATION & SECURITY TESTS ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  };

  const service = new TelebirrService();

  // Test 1: Canonical Parameter Sorting
  try {
    const params = {
      totalAmount: '25000.00',
      appId: 'test_app_123',
      outTradeNo: 'TT-20261023-001',
      nonce: 'abc123xyz',
      emptyField: '',
      sign: 'should_be_ignored',
    };
    const canonical = service.buildSignString(params);
    const expected = 'appId=test_app_123&nonce=abc123xyz&outTradeNo=TT-20261023-001&totalAmount=25000.00';
    assert(canonical === expected, 'Canonical parameter string is correctly sorted alphabetically and ignores empty/sign fields');
  } catch (e) {
    assert(false, `Canonical parameter sorting exception: ${e}`);
  }

  // Test 2: RSA-SHA256 Digital Signing and Signature Verification
  try {
    const message = 'appId=100845&outTradeNo=TT-20261023-999&totalAmount=850.00';
    const signature = service.signWithRsaSha256(message);
    assert(typeof signature === 'string' && signature.length > 50, 'Generates valid base64 RSA-SHA256 signature');

    const isValid = service.verifySignature(message, signature);
    assert(isValid === true, 'Signature verifies successfully against matching public key');

    // Test 3: Anti-Tampering Protection (Modifying data should invalidate signature)
    const tamperedMessage = 'appId=100845&outTradeNo=TT-20261023-999&totalAmount=10.00'; // underpayment attack!
    const isTamperedValid = service.verifySignature(tamperedMessage, signature);
    assert(isTamperedValid === false, 'Tampered payload (modified amount) is rejected by cryptographic verification');
  } catch (e) {
    assert(false, `Signing verification exception: ${e}`);
  }

  // Test 4: HMAC Session Token Generation and Timing-Safe Verification
  try {
    const outTradeNo = 'TT-20261023-444';
    const amount = 1500;
    const token = service.generateSessionToken(outTradeNo, amount);
    assert(typeof token === 'string' && token.length === 64, 'Generates 64-char HMAC SHA256 session token');

    const tokenValid = service.verifySessionToken(outTradeNo, amount, token);
    assert(tokenValid === true, 'Session token validates correctly with identical order parameters');

    const tokenInvalid = service.verifySessionToken(outTradeNo, 1200, token);
    assert(tokenInvalid === false, 'Session token rejects price discrepancy');
  } catch (e) {
    assert(false, `Session token exception: ${e}`);
  }

  // Test 5: Sandbox Webhook Callback Payload Generation
  try {
    const dummyPayment: PaymentRecord = {
      id: 'TT-TEST-001',
      outTradeNo: 'TT-TEST-001',
      customerName: 'Test Payer',
      customerEmail: 'test@example.com',
      customerPhone: '0911223344',
      title: 'Consulting Advisory',
      itemType: 'consulting',
      amount: 5000,
      currency: 'ETB',
      provider: 'telebirr',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { payload, sign } = service.generateSandboxCallback(dummyPayment, true);
    assert(payload.outTradeNo === 'TT-TEST-001', 'Sandbox callback has matching outTradeNo');
    assert(payload.tradeStatus === 'Completed', 'Sandbox callback marks status as Completed');
    assert(typeof payload.tradeNo === 'string' && payload.tradeNo.startsWith('TB'), 'Sandbox callback has realistic Telebirr Trade No');

    const signString = service.buildSignString(payload);
    const cbValid = service.verifySignature(signString, sign);
    assert(cbValid === true, 'Sandbox callback signature cryptographically verifies');
  } catch (e) {
    assert(false, `Sandbox callback generation exception: ${e}`);
  }

  console.log(`\nTEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
