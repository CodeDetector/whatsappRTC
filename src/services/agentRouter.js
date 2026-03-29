import { classifyInboundPayload } from './classifier.js';
import { extractPaymentData } from './aiService.js';

/**
 * Routes processed messages to the right domain-specific AI flow.
 */
export async function routeMessage(context, deps = {}) {
  const classify = deps.classifyInboundPayload ?? classifyInboundPayload;
  const extractPayment = deps.extractPaymentData ?? extractPaymentData;

  const classification = await classify(context.message);

  let payment = null;

  if (classification.category === 'payment') {
    payment = await extractPayment(context.normalizedText);
  }

  return {
    classification,
    payment
  };
}
