import { classifyMessage } from './aiService.js';

export async function classifyInboundPayload(payload) {
  const text = payload?.text?.body ?? payload?.message?.text ?? '';

  if (!text) {
    return {
      category: 'unknown',
      confidence: 0,
      reason: 'No text content provided.'
    };
  }

  return classifyMessage(text);
}
