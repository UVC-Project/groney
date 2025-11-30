import express from 'express';
import { config } from 'dotenv';
import { prisma } from './prisma';
import { MissionStatus } from '@prisma/client';

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

app.get('/map/missions', async (_req, res) => {
  try {
    const missions = await prisma.mission.findMany();
    res.json(missions);
  } catch (err) {
    console.error('Error fetching missions', err);
    res.status(500).json({ message: 'Failed to fetch missions' });
  }
});

app.post('/missions/:id/accept', async (req, res) => {
  const missionId = req.params.id as string;
  const { userId, classId } = req.body as { userId?: string; classId?: string };

  if (!userId || !classId) {
    return res.status(400).json({ message: 'userId and classId are required' });
  }

  try {
    // Optional: mark mission as IN_PROGRESS
    await prisma.mission.update({
      where: { id: missionId },
      data: { status: MissionStatus.IN_PROGRESS }
    });

    const submission = await prisma.submission.create({
      data: {
        missionId,
        userId,
        classId,
        status: 'PENDING'
      }
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error('Error accepting mission', err);
    res.status(500).json({ message: 'Failed to accept mission' });
  }
});

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

app.listen(PORT, () => {
  console.log(`Mission Service running on port ${PORT}`);
});
