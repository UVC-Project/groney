import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import {
  processMascotState,
  calculateHealth,
  getGroenyState,
  checkLevelUp,
  XP_THRESHOLDS,
  MAX_LEVEL,
  DEBUG_MODE,
  DEBUG_DECAY_MULTIPLIER,
  type MascotData,
} from './gameloop';

config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Log debug mode status on startup
console.log(`🎮 DEBUG_MODE: ${DEBUG_MODE}, MULTIPLIER: ${DEBUG_DECAY_MULTIPLIER}`);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'mascot-engine',
    version: '1.0.0',
    status: 'running',
    debugMode: DEBUG_MODE,
    debugMultiplier: DEBUG_DECAY_MULTIPLIER,
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mascot-engine' });
});

/**
 * GET /api/mascot/:classId
 * Fetches mascot with decay applied and full game state
 */
app.get('/api/mascot/:classId', async (req, res) => {
  const { classId } = req.params;

  try {
    const mascot = await prisma.mascot.findUnique({
      where: { classId },
    });

    if (!mascot) {
      return res.status(404).json({ error: 'Mascot not found' });
    }

    const now = new Date();
    const processed = processMascotState(mascot as MascotData, now);

    // Update DB if decay occurred
    if (processed.shouldUpdate) {
      await prisma.mascot.update({
        where: { id: mascot.id },
        data: {
          thirst: processed.stats.thirst,
          hunger: processed.stats.hunger,
          happiness: processed.stats.happiness,
          cleanliness: processed.stats.cleanliness,
          level: processed.level,
          lastDecayAt: now,
        },
      });
    }

    // Return enriched mascot data
    res.json({
      id: mascot.id,
      classId: mascot.classId,
      ...processed.stats,
      level: processed.level,
      xp: mascot.xp,
      coins: mascot.coins,
      equippedHat: mascot.equippedHat,
      equippedAccessory: mascot.equippedAccessory,
      health: processed.health,
      state: processed.state,
      levelProgress: processed.levelProgress,
      decayRates: {
        thirst: mascot.thirstDecayRate,
        hunger: mascot.hungerDecayRate,
        happiness: mascot.happinessDecayRate,
        cleanliness: mascot.cleanlinessDecayRate,
      },
    });
  } catch (error) {
    console.error('Error fetching mascot:', error);
    res.status(500).json({ error: 'Failed to fetch mascot' });
  }
});

/**
 * GET /api/mascot/by-user/:userId
 * Fetches mascot by user ID with decay applied
 */
app.get('/api/mascot/by-user/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log(`\n🔍 GET /api/mascot/by-user/${userId}`);

  try {
    const classUser = await prisma.classUser.findFirst({
      where: { userId },
      select: { classId: true },
    });

    if (!classUser) {
      console.log(`   ❌ User not in a class`);
      return res.status(404).json({ error: 'User is not in a class' });
    }

    console.log(`   Found classId: ${classUser.classId}`);

    const mascot = await prisma.mascot.findUnique({
      where: { classId: classUser.classId },
    });

    if (!mascot) {
      console.log(`   ❌ Mascot not found`);
      return res.status(404).json({ error: 'Mascot not found' });
    }

    const now = new Date();
    const processed = processMascotState(mascot as MascotData, now);

    // Debug logging
    console.log(`   📊 Decay calculation:`);
    console.log(`      lastDecayAt: ${mascot.lastDecayAt}`);
    console.log(`      now: ${now}`);
    console.log(`      schoolHoursElapsed: ${processed.schoolHoursElapsed}`);
    console.log(`      shouldUpdate: ${processed.shouldUpdate}`);
    console.log(`      stats before: T=${mascot.thirst} H=${mascot.hunger} Ha=${mascot.happiness} C=${mascot.cleanliness}`);
    console.log(`      stats after:  T=${processed.stats.thirst} H=${processed.stats.hunger} Ha=${processed.stats.happiness} C=${processed.stats.cleanliness}`);

    // Update DB if decay occurred
    if (processed.shouldUpdate) {
      console.log(`   ✅ Updating DB with decayed stats`);
      await prisma.mascot.update({
        where: { id: mascot.id },
        data: {
          thirst: processed.stats.thirst,
          hunger: processed.stats.hunger,
          happiness: processed.stats.happiness,
          cleanliness: processed.stats.cleanliness,
          level: processed.level,
          lastDecayAt: now,
        },
      });
    }

    res.json({
      id: mascot.id,
      classId: mascot.classId,
      ...processed.stats,
      level: processed.level,
      xp: mascot.xp,
      coins: mascot.coins,
      equippedHat: mascot.equippedHat,
      equippedAccessory: mascot.equippedAccessory,
      health: processed.health,
      state: processed.state,
      levelProgress: processed.levelProgress,
      decayRates: {
        thirst: mascot.thirstDecayRate,
        hunger: mascot.hungerDecayRate,
        happiness: mascot.happinessDecayRate,
        cleanliness: mascot.cleanlinessDecayRate,
      },
    });
  } catch (error) {
    console.error('Error fetching mascot by user:', error);
    res.status(500).json({ error: 'Failed to fetch mascot' });
  }
});


/**
 * POST /api/mascot/:classId/pet
 * Pet the mascot - adds a small happiness boost (used for interactive clicks)
 * Limited to prevent spam (cooldown tracked per user)
 */
const petCooldowns = new Map<string, number>(); // userId -> lastPetTime
const PET_COOLDOWN_MS = 60000; // 1 minute cooldown between pets
const PET_HAPPINESS_BOOST = 1;

app.post('/api/mascot/:classId/pet', async (req, res) => {
  const { classId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Check cooldown
  const lastPet = petCooldowns.get(userId) || 0;
  const now = Date.now();
  if (now - lastPet < PET_COOLDOWN_MS) {
    return res.status(429).json({ 
      error: 'Too many pets!', 
      cooldownRemaining: PET_COOLDOWN_MS - (now - lastPet) 
    });
  }

  try {
    const mascot = await prisma.mascot.findUnique({
      where: { classId },
    });

    if (!mascot) {
      return res.status(404).json({ error: 'Mascot not found' });
    }

    // Update cooldown
    petCooldowns.set(userId, now);

    // Add happiness (capped at 100)
    const newHappiness = Math.min(100, mascot.happiness + PET_HAPPINESS_BOOST);

    const updated = await prisma.mascot.update({
      where: { id: mascot.id },
      data: {
        happiness: newHappiness,
      },
    });

    const health = calculateHealth({
      thirst: updated.thirst,
      hunger: updated.hunger,
      happiness: newHappiness,
      cleanliness: updated.cleanliness,
    });

    console.log(`🐾 User ${userId} petted mascot in class ${classId}. Happiness: ${mascot.happiness} -> ${newHappiness}`);

    res.json({
      success: true,
      happiness: newHappiness,
      health,
      state: getGroenyState(health),
      message: 'Groeny loved that! 💚',
    });
  } catch (error) {
    console.error('Error petting mascot:', error);
    res.status(500).json({ error: 'Failed to pet mascot' });
  }
});


/**
 * PATCH /api/mascot/:classId/decay-rates
 * Update decay rates (teacher customization)
 */
app.patch('/api/mascot/:classId/decay-rates', async (req, res) => {
  const { classId } = req.params;
  const { thirstDecayRate, hungerDecayRate, happinessDecayRate, cleanlinessDecayRate } = req.body;

  try {
    const mascot = await prisma.mascot.findUnique({
      where: { classId },
    });

    if (!mascot) {
      return res.status(404).json({ error: 'Mascot not found' });
    }

    // Validate rates (must be between 0 and 10)
    const validateRate = (rate: any): number | undefined => {
      if (rate === undefined) return undefined;
      const num = Number(rate);
      if (isNaN(num) || num < 0 || num > 10) return undefined;
      return num;
    };

    const updates: Record<string, number> = {};
    
    const validThirst = validateRate(thirstDecayRate);
    const validHunger = validateRate(hungerDecayRate);
    const validHappiness = validateRate(happinessDecayRate);
    const validCleanliness = validateRate(cleanlinessDecayRate);

    if (validThirst !== undefined) updates.thirstDecayRate = validThirst;
    if (validHunger !== undefined) updates.hungerDecayRate = validHunger;
    if (validHappiness !== undefined) updates.happinessDecayRate = validHappiness;
    if (validCleanliness !== undefined) updates.cleanlinessDecayRate = validCleanliness;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid decay rates provided' });
    }

    const updated = await prisma.mascot.update({
      where: { id: mascot.id },
      data: updates,
    });

    res.json({
      message: 'Decay rates updated',
      decayRates: {
        thirst: updated.thirstDecayRate,
        hunger: updated.hungerDecayRate,
        happiness: updated.happinessDecayRate,
        cleanliness: updated.cleanlinessDecayRate,
      },
    });
  } catch (error) {
    console.error('Error updating decay rates:', error);
    res.status(500).json({ error: 'Failed to update decay rates' });
  }
});

/**
 * POST /api/mascot/:classId/boost
 * Boost mascot stats (used when mission is completed)
 */
app.post('/api/mascot/:classId/boost', async (req, res) => {
  const { classId } = req.params;
  const { thirst, hunger, happiness, cleanliness, xp, coins } = req.body;

  try {
    const mascot = await prisma.mascot.findUnique({
      where: { classId },
    });

    if (!mascot) {
      return res.status(404).json({ error: 'Mascot not found' });
    }

    // Calculate new values (capped at 100 for stats)
    const newThirst = Math.min(100, mascot.thirst + (thirst || 0));
    const newHunger = Math.min(100, mascot.hunger + (hunger || 0));
    const newHappiness = Math.min(100, mascot.happiness + (happiness || 0));
    const newCleanliness = Math.min(100, mascot.cleanliness + (cleanliness || 0));
    const newXp = mascot.xp + (xp || 0);
    const newCoins = mascot.coins + (coins || 0);

    // Check for level up
    const levelCheck = checkLevelUp(mascot.xp, newXp);

    const updated = await prisma.mascot.update({
      where: { id: mascot.id },
      data: {
        thirst: newThirst,
        hunger: newHunger,
        happiness: newHappiness,
        cleanliness: newCleanliness,
        xp: newXp,
        coins: newCoins,
        level: levelCheck.newLevel,
      },
    });

    const health = calculateHealth({
      thirst: newThirst,
      hunger: newHunger,
      happiness: newHappiness,
      cleanliness: newCleanliness,
    });

    res.json({
      ...updated,
      health,
      state: getGroenyState(health),
      leveledUp: levelCheck.leveledUp,
      oldLevel: levelCheck.oldLevel,
      newLevel: levelCheck.newLevel,
    });
  } catch (error) {
    console.error('Error boosting mascot:', error);
    res.status(500).json({ error: 'Failed to boost mascot' });
  }
});

/**
 * GET /api/level-info
 * Returns level progression info
 */
app.get('/api/level-info', (_req, res) => {
  res.json({
    maxLevel: MAX_LEVEL,
    thresholds: XP_THRESHOLDS,
  });
});

/**
 * POST /api/debug/reset/:classId
 * DEBUG ONLY: Reset all mascot stats to 100% and reset lastDecayAt
 * Only works when DEBUG_MODE is enabled
 */
app.post('/api/debug/reset/:classId', async (req, res) => {
  if (!DEBUG_MODE) {
    return res.status(403).json({ error: 'Debug mode is disabled' });
  }

  const { classId } = req.params;

  try {
    const mascot = await prisma.mascot.findUnique({
      where: { classId },
    });

    if (!mascot) {
      return res.status(404).json({ error: 'Mascot not found' });
    }

    const updated = await prisma.mascot.update({
      where: { id: mascot.id },
      data: {
        thirst: 100,
        hunger: 100,
        happiness: 100,
        cleanliness: 100,
        lastDecayAt: new Date(),
      },
    });

    console.log(`🔄 DEBUG RESET: Mascot ${classId} stats reset to 100%`);

    res.json({
      message: 'Mascot stats reset to 100%',
      mascot: {
        ...updated,
        health: 100,
        state: 'normal',
      },
    });
  } catch (error) {
    console.error('Error resetting mascot:', error);
    res.status(500).json({ error: 'Failed to reset mascot' });
  }
});

/**
 * POST /api/debug/reset-all
 * DEBUG ONLY: Reset ALL mascots to 100%
 * Only works when DEBUG_MODE is enabled
 */
app.post('/api/debug/reset-all', async (_req, res) => {
  if (!DEBUG_MODE) {
    return res.status(403).json({ error: 'Debug mode is disabled' });
  }

  try {
    const result = await prisma.mascot.updateMany({
      data: {
        thirst: 100,
        hunger: 100,
        happiness: 100,
        cleanliness: 100,
        lastDecayAt: new Date(),
      },
    });

    console.log(`🔄 DEBUG RESET: ${result.count} mascots reset to 100%`);

    res.json({
      message: `${result.count} mascots reset to 100%`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error resetting all mascots:', error);
    res.status(500).json({ error: 'Failed to reset mascots' });
  }
});

/**
 * POST /api/debug/coins/:classId
 * DEBUG ONLY: Add coins to mascot
 * Body: { amount: number }
 */
app.post('/api/debug/coins/:classId', async (req, res) => {
  if (!DEBUG_MODE) {
    return res.status(403).json({ error: 'Debug mode is disabled' });
  }

  const { classId } = req.params;
  const { amount } = req.body;

  if (typeof amount !== 'number') {
    return res.status(400).json({ error: 'Amount must be a number' });
  }

  try {
    const mascot = await prisma.mascot.findUnique({
      where: { classId },
    });

    if (!mascot) {
      return res.status(404).json({ error: 'Mascot not found' });
    }

    const newCoins = Math.max(0, mascot.coins + amount);

    const updated = await prisma.mascot.update({
      where: { id: mascot.id },
      data: { coins: newCoins },
    });

    console.log(`💰 DEBUG COINS: Mascot ${classId} coins ${amount >= 0 ? '+' : ''}${amount} → ${newCoins}`);

    res.json({
      message: `Coins ${amount >= 0 ? 'added' : 'removed'}`,
      previousCoins: mascot.coins,
      addedAmount: amount,
      newCoins: updated.coins,
    });
  } catch (error) {
    console.error('Error modifying coins:', error);
    res.status(500).json({ error: 'Failed to modify coins' });
  }
});

/**
 * POST /api/debug/coins/:classId/reset
 * DEBUG ONLY: Reset coins to 0
 */
app.post('/api/debug/coins/:classId/reset', async (req, res) => {
  if (!DEBUG_MODE) {
    return res.status(403).json({ error: 'Debug mode is disabled' });
  }

  const { classId } = req.params;

  try {
    const mascot = await prisma.mascot.findUnique({
      where: { classId },
    });

    if (!mascot) {
      return res.status(404).json({ error: 'Mascot not found' });
    }

    const previousCoins = mascot.coins;

    await prisma.mascot.update({
      where: { id: mascot.id },
      data: { coins: 0 },
    });

    console.log(`💰 DEBUG COINS RESET: Mascot ${classId} coins ${previousCoins} → 0`);

    res.json({
      message: 'Coins reset to 0',
      previousCoins,
      newCoins: 0,
    });
  } catch (error) {
    console.error('Error resetting coins:', error);
    res.status(500).json({ error: 'Failed to reset coins' });
  }
});

/**
 * POST /api/debug/xp/:classId
 * DEBUG ONLY: Add XP to mascot (can trigger level up)
 * Body: { amount: number }
 */
app.post('/api/debug/xp/:classId', async (req, res) => {
  if (!DEBUG_MODE) {
    return res.status(403).json({ error: 'Debug mode is disabled' });
  }

  const { classId } = req.params;
  const { amount } = req.body;

  if (typeof amount !== 'number') {
    return res.status(400).json({ error: 'Amount must be a number' });
  }

  try {
    const mascot = await prisma.mascot.findUnique({
      where: { classId },
    });

    if (!mascot) {
      return res.status(404).json({ error: 'Mascot not found' });
    }

    const newXp = Math.max(0, mascot.xp + amount);
    const levelCheck = checkLevelUp(mascot.xp, newXp);

    const updated = await prisma.mascot.update({
      where: { id: mascot.id },
      data: { 
        xp: newXp,
        level: levelCheck.newLevel,
      },
    });

    console.log(`⭐ DEBUG XP: Mascot ${classId} XP ${amount >= 0 ? '+' : ''}${amount} → ${newXp} (Level ${levelCheck.newLevel})`);

    res.json({
      message: `XP ${amount >= 0 ? 'added' : 'removed'}`,
      previousXp: mascot.xp,
      addedAmount: amount,
      newXp: updated.xp,
      previousLevel: mascot.level,
      newLevel: updated.level,
      leveledUp: levelCheck.leveledUp,
    });
  } catch (error) {
    console.error('Error modifying XP:', error);
    res.status(500).json({ error: 'Failed to modify XP' });
  }
});

/**
 * POST /api/debug/xp/:classId/reset
 * DEBUG ONLY: Reset XP to 0 and level to 1
 */
app.post('/api/debug/xp/:classId/reset', async (req, res) => {
  if (!DEBUG_MODE) {
    return res.status(403).json({ error: 'Debug mode is disabled' });
  }

  const { classId } = req.params;

  try {
    const mascot = await prisma.mascot.findUnique({
      where: { classId },
    });

    if (!mascot) {
      return res.status(404).json({ error: 'Mascot not found' });
    }

    const previousXp = mascot.xp;
    const previousLevel = mascot.level;

    await prisma.mascot.update({
      where: { id: mascot.id },
      data: { 
        xp: 0,
        level: 1,
      },
    });

    console.log(`⭐ DEBUG XP RESET: Mascot ${classId} XP ${previousXp} → 0, Level ${previousLevel} → 1`);

    res.json({
      message: 'XP and level reset',
      previousXp,
      previousLevel,
      newXp: 0,
      newLevel: 1,
    });
  } catch (error) {
    console.error('Error resetting XP:', error);
    res.status(500).json({ error: 'Failed to reset XP' });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

app.listen(PORT, () => {
  console.log(`Mascot Engine running on port ${PORT}`);
});
