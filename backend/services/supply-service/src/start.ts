import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import { PrismaClient, SupplyRequestStatus } from '@prisma/client';

config();

const prisma = new PrismaClient();

const app = express();
const PORT = Number(process.env.PORT ?? process.env.SUPPLY_SERVICE_PORT ?? 3007);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    service: 'supply-service',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'supply-service' });
});

/**
 * Student: list available supplies
 * GET /api/supplies
 */
app.get('/api/supplies', async (_req, res) => {
  try {
    const supplies = await prisma.supply.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json(supplies);
  } catch (error) {
    console.error('Failed to fetch supplies:', error);
    res.status(500).json({ message: 'Failed to fetch supplies' });
  }
});

/**
 * Student: request a supply (creates DB row)
 * POST /api/supply-requests
 * body: { userId, classId, supplyId }
 */
app.post('/api/supply-requests', async (req, res) => {
  const { userId, classId, supplyId } = req.body as {
    userId?: string;
    classId?: string;
    supplyId?: string;
  };

  if (!userId || !classId || !supplyId) {
    return res.status(400).json({ message: 'Missing userId, classId or supplyId' });
  }

  try {
    // Validate foreign keys exist (more helpful errors)
    const [user, klass, supply] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      prisma.class.findUnique({ where: { id: classId }, select: { id: true } }),
      prisma.supply.findUnique({ where: { id: supplyId }, select: { id: true } })
    ]);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!klass) return res.status(404).json({ message: 'Class not found' });
    if (!supply) return res.status(404).json({ message: 'Supply not found' });

    // Prevent duplicate pending requests for same user+class+supply
    const existing = await prisma.supplyRequest.findFirst({
      where: {
        userId,
        classId,
        supplyId,
        status: SupplyRequestStatus.PENDING
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'You already requested this supply' });
    }

    const created = await prisma.supplyRequest.create({
      data: {
        userId,
        classId,
        supplyId,
        status: SupplyRequestStatus.PENDING
      }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Failed to create supply request:', error);
    res.status(500).json({ message: 'Failed to create supply request' });
  }
});

/**
 * Teacher: list supply requests for a class (default PENDING)
 * GET /api/teacher/supply-requests?classId=...&status=PENDING
 */
app.get('/api/teacher/supply-requests', async (req, res) => {
  const classId = req.query.classId as string | undefined;
  const statusQuery = req.query.status as string | undefined;

  if (!classId) return res.status(400).json({ message: 'Missing classId' });

  const status =
    statusQuery && statusQuery in SupplyRequestStatus
      ? (statusQuery as SupplyRequestStatus)
      : SupplyRequestStatus.PENDING;

  try {
    const rows = await prisma.supplyRequest.findMany({
      where: { classId, status },
      include: {
        supply: true,
        user: {
          select: { id: true, username: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch supply requests:', error);
    res.status(500).json({ message: 'Failed to fetch supply requests' });
  }
});

/**
 * Teacher: approve/reject request
 * POST /api/teacher/supply-requests/:id/status
 * body: { status: 'APPROVED' | 'REJECTED' }
 */
app.post('/api/teacher/supply-requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: SupplyRequestStatus };

  if (status !== SupplyRequestStatus.APPROVED && status !== SupplyRequestStatus.REJECTED) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const updated = await prisma.supplyRequest.update({
      where: { id },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    console.error('Failed to update supply request status:', error);
    res.status(500).json({ message: 'Failed to update supply request status' });
  }
});

app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(PORT, () => {
  console.log(`Supply service running on port ${PORT}`);
});
