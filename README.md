# whatsapp-erp

Production-ready Node.js service to process WhatsApp webhook messages with:

- Express HTTP server
- Webhook receiver endpoint (`/webhook`)
- PostgreSQL persistence for inbound events
- OpenAI-powered text classification and payment extraction
- OCR placeholder service for media messages
- Modular service architecture

## Project structure

```text
src/
  server.js
  routes/webhook.js
  services/
    ocrService.js
    aiService.js
    classifier.js
    agentRouter.js
  db/index.js

prompts/
  ocr_clean.txt
  payment_extract.txt
  classifier.txt

.env
package.json
README.md
```

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env`.
3. Run in development:
   ```bash
   npm run dev
   ```
4. Run in production mode:
   ```bash
   npm start
   ```

## Webhook behavior

### `GET /webhook`
Meta-style webhook verification with query parameters:
- `hub.mode`
- `hub.verify_token`
- `hub.challenge`

### `POST /webhook`
Pipeline steps:
1. Receives inbound WhatsApp payload.
2. Logs raw payload in PostgreSQL table `webhook_events`.
3. Extracts OCR text from media (placeholder implementation).
4. Cleans OCR text with OpenAI.
5. Classifies message with OpenAI.
6. If classified as `payment`, extracts payment details with OpenAI.
7. Logs structured output to the console.

## Environment variables

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whatsapp_erp
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
WEBHOOK_VERIFY_TOKEN=change_me
```

## Notes

- `src/services/ocrService.js` is intentionally a placeholder. Replace it with your OCR provider implementation.
- The OpenAI calls expect JSON responses and rely on prompts under `prompts/`.
- Add auth/signature verification middleware before exposing publicly.
