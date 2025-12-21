import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

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
 */
app.get('/api/supplies', async (_req, res) => {
  try {
    const supplies = await prisma.supply.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json(supplies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch supplies' });
  }
});

/**
 * Student: request a supply (creates DB row)
 */
app.post('/api/supplies/request', async (req, res) => {
  const { userId, classId, supplyId } = req.body as {
    userId?: string;
    classId?: string;
    supplyId?: string;
  };

  if (!userId || !classId || !supplyId) {
    return res.status(400).json({ message: 'Missing userId, classId or supplyId' });
  }

  try {
    const supply = await prisma.supply.findUnique({ where: { id: supplyId } });
    if (!supply) return res.status(404).json({ message: 'Supply not found' });

    // Prevent duplicate pending requests for same user+class+supply
    const existing = await prisma.supplyRequest.findFirst({
      where: { userId, classId, supplyId, status: 'PENDING' }
    });

    if (existing) {
      return res.status(400).json({ message: 'You already requested this supply' });
    }

    const created = await prisma.supplyRequest.create({
      data: {
        userId,
        classId,
        supplyId,
        status: 'PENDING'
      }
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create supply request' });
  }
});

/**
 * Teacher: list supply requests for a class (default PENDING)
 * GET /api/teacher/supply-requests?classId=...&status=PENDING
 */
app.get('/api/teacher/supply-requests', async (req, res) => {
  const classId = req.query.classId as string | undefined;
  const status = (req.query.status as string | undefined) ?? 'PENDING';

  if (!classId) return res.status(400).json({ message: 'Missing classId' });

  try {
    const rows = await prisma.supplyRequest.findMany({
      where: { classId, status: status as any },
      include: {
        supply: true,
        user: { select: { id: true, username: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch supply requests' });
  }
});

/**
 * Teacher: approve/reject request
 */
app.post('/api/teacher/supply-requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: 'APPROVED' | 'REJECTED' };

  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const updated = await prisma.supplyRequest.update({
      where: { id },
      data: { status }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
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
