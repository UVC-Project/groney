import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';

import supplyProxy from './routes/supplyRoutes';

config();

const app = express();
const PORT = Number(process.env.API_GATEWAY_PORT ?? 3000);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Mount all supply routes under /api
app.use('/api', supplyProxy);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
