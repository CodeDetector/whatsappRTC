import 'dotenv/config';
import express from 'express';

import webhookRouter from './routes/webhook.js';
import { testDbConnection } from './db/index.js';

const app = express();
const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (_req, res) => {
  const dbStatus = await testDbConnection();
  res.status(200).json({
    status: 'ok',
    database: dbStatus ? 'connected' : 'unavailable',
    timestamp: new Date().toISOString()
  });
});

app.use('/webhook', webhookRouter);

app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`whatsapp-erp server listening on port ${PORT}`);
});
