import { Router } from 'express';

import { logInboundEvent } from '../db/index.js';
import { extractTextFromMedia } from '../services/ocrService.js';
import { cleanOcrText } from '../services/aiService.js';
import { routeMessage } from '../services/agentRouter.js';

const router = Router();

router.get('/', (req, res) => {
  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token && token === verifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;
    await logInboundEvent(payload);

    const firstMessage =
      payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0] ?? payload?.message ?? payload;

    const messageText = firstMessage?.text?.body ?? '';
    const media = firstMessage?.image ?? firstMessage?.document ?? null;

    const ocrRawText = await extractTextFromMedia(media);
    const ocrText = await cleanOcrText(ocrRawText);

    const normalizedText = [messageText, ocrText].filter(Boolean).join('\n').trim();

    const routed = await routeMessage({
      message: firstMessage,
      normalizedText
    });

    const structuredOutput = {
      receivedAt: new Date().toISOString(),
      sender: firstMessage?.from ?? 'unknown',
      text: messageText,
      mediaAttached: Boolean(media),
      ocr: {
        raw: ocrRawText,
        cleaned: ocrText
      },
      classification: routed.classification,
      payment: routed.payment
    };

    console.log('[WHATSAPP_PIPELINE_OUTPUT]');
    console.dir(structuredOutput, { depth: null });

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    return next(error);
  }
});

export default router;
