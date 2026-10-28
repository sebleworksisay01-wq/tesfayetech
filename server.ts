import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { telebirrService } from './server/telebirrService';
import { paymentStore } from './server/paymentStore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Basic JSON and URL-encoded body parser with size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// API Routes prefix
const apiRouter = express.Router();

// 1. Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'TesfayeTech Core & Telebirr Payment API',
    environment: process.env.NODE_ENV || 'development',
    telebirrMode: telebirrService.getConfigSummary().environment,
    timestamp: new Date().toISOString(),
  });
});

// 2. Telebirr Public Config Summary
apiRouter.get('/telebirr/config', (req: Request, res: Response) => {
  res.json(telebirrService.getConfigSummary());
});

// 3. Initiate Telebirr Payment Checkout
apiRouter.post('/payments/initiate', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      amount,
      customerName,
      customerPhone,
      customerEmail,
      itemType = 'service',
      itemId,
      userId,
      idempotencyKey,
    } = req.body;

    // Strict validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Order title is required.' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive amount in ETB is required.' });
    }

    if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim().length < 9) {
      return res.status(400).json({ error: 'Valid Ethiopian mobile phone number is required (e.g. 0911234567).' });
    }

    if (!customerName || typeof customerName !== 'string') {
      return res.status(400).json({ error: 'Customer name is required.' });
    }

    // Create or retrieve idempotent pending payment record
    const payment = paymentStore.createPayment({
      title,
      description,
      amount: numericAmount,
      customerName,
      customerPhone,
      customerEmail,
      itemType,
      itemId,
      userId,
      idempotencyKey,
    });

    // Create Telebirr checkout payload and URL
    const webPay = await telebirrService.createWebPayment(payment);

    // Save payment checkout URL
    payment.paymentUrl = webPay.paymentUrl;

    return res.json({
      success: true,
      payment,
      paymentUrl: webPay.paymentUrl,
      mode: telebirrService.getConfigSummary().environment,
    });
  } catch (err) {
    console.error('Error initiating Telebirr payment:', err);
    return res.status(500).json({
      error: 'Failed to initiate payment.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 4. Telebirr Asynchronous Callback (Webhook)
// Called by Ethio Telecom Telebirr server or our sandbox simulation gateway upon payment completion
apiRouter.post('/payments/telebirr/callback', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('[Telebirr Webhook] Received callback notification:', payload);

    if (!payload || !payload.outTradeNo) {
      return res.status(400).json({ code: 1, message: 'Missing outTradeNo in payload' });
    }

    const { outTradeNo, totalAmount, tradeNo, tradeStatus, sign } = payload;
    const payment = paymentStore.getByOutTradeNo(outTradeNo);

    if (!payment) {
      console.warn(`[Telebirr Webhook] Order ${outTradeNo} not found in database.`);
      return res.status(404).json({ code: 1, message: 'Order reference not found' });
    }

    // Cryptographic Signature Verification
    if (sign) {
      const signString = telebirrService.buildSignString(payload);
      const isValid = telebirrService.verifySignature(signString, sign);
      if (!isValid) {
        console.error(`[Telebirr Webhook] Cryptographic signature verification failed for ${outTradeNo}!`);
        return res.status(400).json({ code: 1, message: 'Invalid cryptographic signature' });
      }
    }

    // Anti-tampering check: ensure paid amount matches original invoice amount exactly
    if (totalAmount) {
      const receivedAmount = parseFloat(totalAmount);
      const expectedAmount = payment.amount;
      if (Math.abs(receivedAmount - expectedAmount) > 0.01) {
        console.error(
          `[Telebirr Security Alert] Amount tampering detected! Received ${receivedAmount} ETB but expected ${expectedAmount} ETB.`
        );
        paymentStore.updateStatus(outTradeNo, 'FAILED', tradeNo, payload, 'Amount tampering detected');
        return res.status(400).json({ code: 1, message: 'Amount mismatch detected' });
      }
    }

    // Determine final status
    const isCompleted =
      tradeStatus === 'Completed' ||
      tradeStatus === 'Success' ||
      tradeStatus === 'SUCCESS' ||
      tradeStatus === '2' ||
      tradeStatus === 2;

    if (isCompleted) {
      paymentStore.updateStatus(outTradeNo, 'SUCCESS', tradeNo, payload);
      console.log(`[Telebirr Webhook] Payment ${outTradeNo} marked SUCCESS with Telebirr Trade No ${tradeNo}`);
    } else {
      paymentStore.updateStatus(outTradeNo, 'FAILED', tradeNo, payload, `Trade status: ${tradeStatus}`);
    }

    // Return official Telebirr acknowledge payload
    return res.json({ code: 0, message: 'success' });
  } catch (err) {
    console.error('[Telebirr Webhook] Exception processing callback:', err);
    return res.status(500).json({ code: 1, message: 'Internal server error processing callback' });
  }
});

// 5. Query order status
apiRouter.get('/payments/status/:outTradeNo', (req: Request, res: Response) => {
  const { outTradeNo } = req.params;
  const payment = paymentStore.getByOutTradeNo(outTradeNo);

  if (!payment) {
    return res.status(404).json({ error: 'Payment record not found' });
  }

  return res.json({
    success: true,
    payment,
    isVerified: payment.status === 'SUCCESS',
  });
});

// 6. Active verify / reconcile order status (server-to-server query)
apiRouter.post('/payments/verify/:outTradeNo', async (req: Request, res: Response) => {
  const { outTradeNo } = req.params;
  const payment = paymentStore.getByOutTradeNo(outTradeNo);

  if (!payment) {
    return res.status(404).json({ error: 'Payment record not found' });
  }

  // If already SUCCESS, return verified state
  if (payment.status === 'SUCCESS') {
    return res.json({
      success: true,
      status: 'SUCCESS',
      payment,
      message: 'Payment is confirmed and verified.',
    });
  }

  // Query Telebirr gateway
  const queryResult = await telebirrService.queryOrder(outTradeNo);
  if (queryResult.found && queryResult.status === 'SUCCESS') {
    paymentStore.updateStatus(outTradeNo, 'SUCCESS', queryResult.telebirrTradeNo, queryResult.raw);
  }

  const updated = paymentStore.getByOutTradeNo(outTradeNo);
  return res.json({
    success: true,
    status: updated?.status || 'PENDING',
    payment: updated,
    message: updated?.status === 'SUCCESS' ? 'Payment confirmed by Telebirr.' : 'Payment pending customer authorization.',
  });
});

// 7. Sandbox Simulator Action Endpoint
// Used when testing through the realistic Telebirr simulator
apiRouter.post('/payments/simulate-action', async (req: Request, res: Response) => {
  try {
    const { outTradeNo, token, action } = req.body;
    const payment = paymentStore.getByOutTradeNo(outTradeNo);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify session token
    if (token) {
      const isValid = telebirrService.verifySessionToken(outTradeNo, payment.amount, token);
      if (!isValid) {
        return res.status(403).json({ error: 'Invalid checkout session token' });
      }
    }

    if (action === 'approve') {
      const { payload, sign } = telebirrService.generateSandboxCallback(payment, true);
      // Trigger official callback flow
      const callbackResult = paymentStore.updateStatus(
        outTradeNo,
        'SUCCESS',
        payload.tradeNo,
        payload
      );
      return res.json({ success: true, status: 'SUCCESS', payment: callbackResult, payload, sign });
    } else if (action === 'cancel') {
      paymentStore.updateStatus(outTradeNo, 'CANCELLED', undefined, undefined, 'Customer cancelled at Telebirr gateway');
      return res.json({ success: true, status: 'CANCELLED' });
    } else if (action === 'fail') {
      paymentStore.updateStatus(outTradeNo, 'FAILED', undefined, undefined, 'Simulated Telebirr PIN / balance failure');
      return res.json({ success: true, status: 'FAILED' });
    } else if (action === 'expire') {
      paymentStore.updateStatus(outTradeNo, 'EXPIRED', undefined, undefined, 'Session timeout exceeded');
      return res.json({ success: true, status: 'EXPIRED' });
    }

    return res.status(400).json({ error: 'Unknown simulator action' });
  } catch (err) {
    console.error('Error in simulate-action:', err);
    return res.status(500).json({ error: 'Simulation failed' });
  }
});

// 8. Customer payment history
apiRouter.get('/payments/my-payments', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || '';
  const email = (req.query.email as string) || '';

  if (!userId && !email) {
    return res.status(400).json({ error: 'User ID or Email is required to retrieve payment history' });
  }

  const list = paymentStore.getCustomerPayments(userId, email);
  return res.json({ success: true, payments: list });
});

// 9. Admin: Get all payments and revenue analytics
apiRouter.get('/admin/payments', (req: Request, res: Response) => {
  const payments = paymentStore.getAllPayments();
  const analytics = paymentStore.getAnalytics();
  return res.json({
    success: true,
    analytics,
    payments,
  });
});

// 10. Admin: Recheck or manual reconcile
apiRouter.post('/admin/payments/:outTradeNo/recheck', async (req: Request, res: Response) => {
  const { outTradeNo } = req.params;
  const payment = paymentStore.getByOutTradeNo(outTradeNo);
  if (!payment) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const query = await telebirrService.queryOrder(outTradeNo);
  if (query.found && query.status === 'SUCCESS') {
    paymentStore.updateStatus(outTradeNo, 'SUCCESS', query.telebirrTradeNo, query.raw);
  }

  return res.json({
    success: true,
    payment: paymentStore.getByOutTradeNo(outTradeNo),
  });
});

apiRouter.post('/admin/payments/:outTradeNo/mark-manual', (req: Request, res: Response) => {
  const { outTradeNo } = req.params;
  const { adminEmail, reason } = req.body;
  const payment = paymentStore.getByOutTradeNo(outTradeNo);

  if (!payment) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const updated = paymentStore.updateStatus(
    outTradeNo,
    'SUCCESS',
    `MANUAL-${Date.now()}`,
    { manualAudit: true, approvedBy: adminEmail, reason }
  );

  return res.json({ success: true, payment: updated });
});

// Mount the API Router
app.use('/api', apiRouter);

// Start server and handle frontend Vite / Static distribution
async function startServer() {
  if (!isProduction) {
    // Dynamic import of Vite in dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TesfayeTech Core Server running at http://0.0.0.0:${PORT}`);
    console.log(`Telebirr Module Mode: ${telebirrService.getConfigSummary().environment}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
