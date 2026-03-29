import { classifyInboundPayload } from './classifier.js';
import { extractPaymentData } from './aiService.js';

/**
 * Routes processed messages to the right domain-specific AI flow.
 */
export async function routeMessage(context) {
  const classification = await classifyInboundPayload(context.message);

  let payment = null;

  if (classification.category === 'payment') {
    payment = await extractPaymentData(context.normalizedText);
  }

  return {
    classification,
    payment
  };
}
