import { Router } from 'express';
import { PrismaClient, MissionStatus, SubmissionStatus } from '@prisma/client';

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
  const { userId, classId } = req.body as { userId?: string; classId?: string };

  if (!userId || !classId) {
    return res.status(400).json({ message: 'userId and classId are required' });
  }

  try {
    // Mark mission as IN_PROGRESS
    await prisma.mission.update({
      where: { id: missionId },
      data: { status: MissionStatus.IN_PROGRESS },
    });

    const submission = await prisma.submission.create({
      data: {
        missionId,
        userId,
        classId,
        status: SubmissionStatus.PENDING,
      },
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error('Error accepting mission', err);
    res.status(500).json({ message: 'Failed to accept mission' });
  }
});

export default router;
