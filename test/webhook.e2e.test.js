import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';

import { createWebhookRouter } from '../src/routes/webhook.js';

process.env.WEBHOOK_VERIFY_TOKEN = 'verify-123';

function buildTestApp(deps) {
  const app = express();
  app.use(express.json());
  app.use('/webhook', createWebhookRouter(deps));
  app.use((err, _req, res, _next) => {
    res.status(500).json({ error: err.message });
  });
  return app;
}

test('GET /webhook validates token and returns challenge', async () => {
  const app = buildTestApp({
    logInboundEvent: async () => {},
    extractTextFromMedia: async () => '',
    cleanOcrText: async () => '',
    routeMessage: async () => ({ classification: { category: 'unknown' }, payment: null })
  });

  const res = await request(app)
    .get('/webhook')
    .query({
      'hub.mode': 'subscribe',
      'hub.verify_token': 'verify-123',
      'hub.challenge': 'abc123'
    });

  assert.equal(res.status, 200);
  assert.equal(res.text, 'abc123');
});

test('POST /webhook runs full pipeline and returns 200', async () => {
  const calls = { logged: false, ocrCalled: false, routeCalled: false };

  const app = buildTestApp({
    logInboundEvent: async () => {
      calls.logged = true;
    },
    extractTextFromMedia: async () => {
      calls.ocrCalled = true;
      return 'raw ocr text';
    },
    cleanOcrText: async (raw) => `cleaned ${raw}`,
    routeMessage: async ({ normalizedText }) => {
      calls.routeCalled = true;
      assert.match(normalizedText, /cleaned raw ocr text/);
      return {
        classification: { category: 'payment', confidence: 0.99 },
        payment: { amount: 100, currency: 'USD' }
      };
    }
  });

  const payload = {
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  from: '15550001111',
                  text: { body: 'Payment attached' },
                  image: { url: 'https://example.com/image.jpg' }
                }
              ]
            }
          }
        ]
      }
    ]
  };

  const res = await request(app).post('/webhook').send(payload);

  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(calls.logged, true);
  assert.equal(calls.ocrCalled, true);
  assert.equal(calls.routeCalled, true);
});
