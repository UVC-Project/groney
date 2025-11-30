import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import { shopItems, getMascotByClassId } from './shopData';

config();

const app = express();

// Use PORT or SHOP_SERVICE_PORT, fallback 3005
const PORT = Number(process.env.PORT ?? process.env.SHOP_SERVICE_PORT ?? 3005);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Root endpoint (kept from your previous file)
app.get('/', (_req, res) => {
  res.json({
    service: 'shop-service',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'shop-service' });
});

// ==============================
//      SHOP API ENDPOINTS
// ==============================

// GET /api/shop/items  -> in-memory catalog
app.get('/api/shop/items', (_req, res) => {
  res.json(shopItems);
});

// GET /api/mascot/:classId -> in-memory mascot coins
app.get('/api/mascot/:classId', (req, res) => {
  const { classId } = req.params;
  const mascot = getMascotByClassId(classId);

  if (!mascot) {
    return res.status(404).json({ message: 'Mascot not found' });
  }

  res.json(mascot);
});

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(PORT, () => {
  console.log(`Shop service running on port ${PORT}`);
});
