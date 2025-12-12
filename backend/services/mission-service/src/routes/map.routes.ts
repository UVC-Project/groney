import { Router } from 'express';
import { PrismaClient, MissionStatus} from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /map/missions
router.get('/missions', async (_req, res) => {
  try {
    const missions = await prisma.mission.findMany({
      include: {
        sector: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(missions);
  } catch (err) {
    console.error('Error fetching map missions:', err);
    res.status(500).json({ message: 'Failed to fetch map missions' });
  }
});

// POST /map/missions/:id/accept
router.post('/missions/:id/accept', async (req, res) => {
  const missionId = req.params.id as string;
  try {
    // Mark mission as IN_PROGRESS
    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: { status: MissionStatus.IN_PROGRESS },
    });

    res.status(201).json(updatedMission);
  } catch (err) {
    console.error('Error accepting mission', err);
    res.status(500).json({ message: 'Failed to accept mission' });
  }
});

export default router;
