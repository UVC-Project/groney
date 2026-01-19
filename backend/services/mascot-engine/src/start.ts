import express from 'express';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'mascot-engine',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mascot-engine' });
});

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

app.listen(PORT, () => {
  console.log(`Mascot Engine running on port ${PORT}`);
});
