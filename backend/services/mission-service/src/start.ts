import express from 'express';
import { config } from 'dotenv';
import {prisma} from './prisma';

config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'mission-service',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mission-service' });
});

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

app.get('/map/missions', async (_req, res) => {
  try {
    const missions = await prisma.mission.findMany();
    res.json(missions);
  } catch (err) {
    console.error('Error fetching missions', err);
    res.status(500).json({ message: 'Failed to fetch missions' });
  }
});

app.listen(PORT, () => {
  console.log(`Mission Service running on port ${PORT}`);
});