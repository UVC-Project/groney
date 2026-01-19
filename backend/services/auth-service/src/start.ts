import express from 'express';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'auth-service',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
