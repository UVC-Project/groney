import express from 'express';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

config();

const app = express();
const PORT = process.env.PORT || 3006;
const prisma = new PrismaClient();

app.use(express.json());

// CO2 factors (kg CO2 per completed mission) - configurable via env
const CO2_FACTORS = {
  WATERING: parseFloat(process.env.CO2_FACTOR_WATERING || '0.5'),
  WEEDING: parseFloat(process.env.CO2_FACTOR_WEEDING || '0.3'),
  PLANTING: parseFloat(process.env.CO2_FACTOR_PLANTING || '1.0'),
  CLEANING: parseFloat(process.env.CO2_FACTOR_CLEANING || '0.2'),
  FEEDING: parseFloat(process.env.CO2_FACTOR_FEEDING || '0.1'),
} as const;

type TaskType = keyof typeof CO2_FACTORS;

// Map sector types to task types for CO2 calculation
const SECTOR_TO_TASK: Record<string, TaskType> = {
  TREES: 'WATERING',
  FLOWERS: 'WATERING',
  POND: 'WATERING',
  GARDEN: 'PLANTING',
  COMPOST: 'CLEANING',
  PLAYGROUND: 'CLEANING',
  OTHER: 'CLEANING',
  ANIMALS: 'FEEDING',
  CHICKENS: 'FEEDING',
};

// Validation schemas
const calculateCO2Schema = z.object({
  missions: z.array(z.object({
    sectorType: z.string(),
    quantity: z.number().int().positive().default(1),
  })),
});

// Helper: Calculate CO2 for a single mission based on sector type
function calculateMissionCO2(sectorType: string, quantity: number = 1): number {
  const taskType = SECTOR_TO_TASK[sectorType] || 'CLEANING';
  return CO2_FACTORS[taskType] * quantity;
}

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'calculation-service',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'calculation-service' });
});


/**
 * POST /api/calculate/co2
 * Calculate CO2 reduction for an array of missions
 * 
 * Request body:
 * {
 *   "missions": [
 *     { "sectorType": "TREES", "quantity": 2 },
 *     { "sectorType": "GARDEN", "quantity": 1 }
 *   ]
 * }
 */
app.post('/api/calculate/co2', (req, res) => {
  try {
    const parsed = calculateCO2Schema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: parsed.error.issues,
      });
    }

    const { missions } = parsed.data;
    
    const breakdown = missions.map((mission) => {
      const taskType = SECTOR_TO_TASK[mission.sectorType] || 'CLEANING';
      const co2Reduction = calculateMissionCO2(mission.sectorType, mission.quantity);
      
      return {
        sectorType: mission.sectorType,
        taskType,
        quantity: mission.quantity,
        co2Factor: CO2_FACTORS[taskType],
        co2Reduction,
      };
    });

    const totalCO2 = breakdown.reduce((sum, item) => sum + item.co2Reduction, 0);

    return res.json({
      totalCO2Reduction: Math.round(totalCO2 * 100) / 100,
      unit: 'kg',
      breakdown,
    });
  } catch (error) {
    console.error('CO2 calculation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to calculate CO2 reduction',
    });
  }
});

/**
 * GET /api/calculate/co2/class/:classId
 * Get aggregated CO2 reduction for a class
 * 
 * Query params:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 */
app.get('/api/calculate/co2/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    // Fetch completed submissions for the class with sector info
    const submissions = await prisma.submission.findMany({
      where: {
        classId,
        status: 'COMPLETED',
        ...dateFilter,
      },
      include: {
        mission: {
          include: {
            sector: true,
          },
        },
      },
    });

    if (submissions.length === 0) {
      return res.json({
        classId,
        totalCO2Reduction: 0,
        unit: 'kg',
        missionCount: 0,
        breakdown: [],
        message: 'No completed missions found for this class',
      });
    }

    // Aggregate CO2 by task type
    const aggregation: Record<TaskType, { count: number; co2: number }> = {
      WATERING: { count: 0, co2: 0 },
      WEEDING: { count: 0, co2: 0 },
      PLANTING: { count: 0, co2: 0 },
      CLEANING: { count: 0, co2: 0 },
      FEEDING: { count: 0, co2: 0 },
    };

    for (const submission of submissions) {
      const sectorType = submission.mission.sector.type;
      const taskType = SECTOR_TO_TASK[sectorType] || 'CLEANING';
      const co2 = CO2_FACTORS[taskType];
      
      aggregation[taskType].count += 1;
      aggregation[taskType].co2 += co2;
    }

    const breakdown = Object.entries(aggregation)
      .filter(([_, data]) => data.count > 0)
      .map(([taskType, data]) => ({
        taskType,
        missionCount: data.count,
        co2Factor: CO2_FACTORS[taskType as TaskType],
        co2Reduction: Math.round(data.co2 * 100) / 100,
      }));

    const totalCO2 = breakdown.reduce((sum, item) => sum + item.co2Reduction, 0);

    return res.json({
      classId,
      totalCO2Reduction: Math.round(totalCO2 * 100) / 100,
      unit: 'kg',
      missionCount: submissions.length,
      breakdown,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  } catch (error) {
    console.error('CO2 aggregation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to aggregate CO2 data',
    });
  }
});

/**
 * GET /api/calculate/co2/factors
 * Get current CO2 factors configuration
 */
app.get('/api/calculate/co2/factors', (_req, res) => {
  res.json({
    factors: CO2_FACTORS,
    sectorMapping: SECTOR_TO_TASK,
    unit: 'kg CO2 per mission',
  });
});

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

app.listen(PORT, () => {
  console.log(`Calculation Service running on port ${PORT}`);
});
