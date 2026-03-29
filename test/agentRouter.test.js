import test from 'node:test';
import assert from 'node:assert/strict';

import { routeMessage } from '../src/services/agentRouter.js';

test('routeMessage triggers payment extraction for payment classification', async () => {
  let extractionCalled = false;

  const result = await routeMessage(
    { message: { text: { body: 'Paid 50 USD' } }, normalizedText: 'Paid 50 USD' },
    {
      classifyInboundPayload: async () => ({ category: 'payment', confidence: 0.95 }),
      extractPaymentData: async () => {
        extractionCalled = true;
        return { amount: 50, currency: 'USD' };
      }
    }
  );

  assert.equal(extractionCalled, true);
  assert.deepEqual(result.payment, { amount: 50, currency: 'USD' });
});

test('routeMessage skips payment extraction for non-payment categories', async () => {
  let extractionCalled = false;

  const result = await routeMessage(
    { message: { text: { body: 'Help me with order' } }, normalizedText: 'Help me with order' },
    {
      classifyInboundPayload: async () => ({ category: 'support', confidence: 0.88 }),
      extractPaymentData: async () => {
        extractionCalled = true;
        return { amount: 0 };
      }
    }
  );

  assert.equal(extractionCalled, false);
  assert.equal(result.payment, null);
});
