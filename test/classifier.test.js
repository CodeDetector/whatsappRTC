import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyInboundPayload } from '../src/services/classifier.js';

test('classifyInboundPayload returns unknown for missing text', async () => {
  const result = await classifyInboundPayload({});

  assert.equal(result.category, 'unknown');
  assert.equal(result.confidence, 0);
});
