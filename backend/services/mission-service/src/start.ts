import express from 'express';
import { config } from 'dotenv';
import { prisma } from '../../shared/prisma';
import { MissionCategory, SectorType } from '@prisma/client';
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

// Trigger database seeding
app.post('/seed', async (_req, res) => {
  try {
    seedData();
    res.json({ status: 'ok', message: 'Database seeded successfully' });
  } catch (err) {
    console.error('❌ Seed error:', err);
    res.status(500).json({ status: 'error', message: 'Seed failed', error: err });
  }
});

app.listen(PORT, () => {
  console.log(`Mission Service running on port ${PORT}`);
});

async function seedData() {
  console.log('🌱 Seeding database...');

  // 1) Create / reuse class
  const classroom = await prisma.class.upsert({
    where: { classCode: 'GARDEN-101' },
    update: {},
    create: {
      id: 'class-garden-101',
      name: 'Groep 6A',
      school: 'Basisschool De Regenboog',
      classCode: 'GARDEN-101',
    },
  });

  // 2) Create sectors
  const treesSector = await prisma.sector.upsert({
    where: { id: 'sector-trees' },
    update: {},
    create: {
      id: 'sector-trees',
      classId: classroom.id,
      name: 'Boomgaard',
      type: SectorType.TREES,
    },
  });

  const pondSector = await prisma.sector.upsert({
    where: { id: 'sector-pond' },
    update: {},
    create: {
      id: 'sector-pond',
      classId: classroom.id,
      name: 'Vijver',
      type: SectorType.POND,
    },
  });

  const gardenSector = await prisma.sector.upsert({
    where: { id: 'sector-garden' },
    update: {},
    create: {
      id: 'sector-garden',
      classId: classroom.id,
      name: 'Moestuin',
      type: SectorType.GARDEN,
    },
  });

  // 3) Create missions
  const missions = [
    {
      id: 'mission-water-trees',
      sectorId: treesSector.id,
      title: 'Geef de bomen water',
      description: 'Gebruik de gieters en geef minstens drie bomen water.',
      xpReward: 50,
      coinReward: 10,
      thirstBoost: 25,
      happinessBoost: 5,
      coordinates_x: 30,
      coordinates_y: 40,
      category: MissionCategory.THIRST,
    },
    {
      id: 'mission-collect-leaves',
      sectorId: treesSector.id,
      title: 'Bladeren opruimen',
      description: 'Vul één grote emmer bladeren en maak de plek netjes.',
      xpReward: 60,
      coinReward: 15,
      cleanlinessBoost: 30,
      happinessBoost: 5,
      coordinates_x: 45,
      coordinates_y: 55,
      category: MissionCategory.CLEANLINESS,
    },
    {
      id: 'mission-feed-ducks',
      sectorId: pondSector.id,
      title: 'Voer de eenden (verantwoord!)',
      description:
        'Lees wat eenden mogen eten en geef ze daarna verantwoord voer.',
      xpReward: 70,
      coinReward: 20,
      hungerBoost: 25,
      happinessBoost: 15,
      coordinates_x: 65,
      coordinates_y: 35,
      category: MissionCategory.HUNGER,
    },
    {
      id: 'mission-plant-seeds',
      sectorId: gardenSector.id,
      title: 'Plant nieuwe zaden',
      description: 'Plant vijf zaden in de moestuin en geef ze water.',
      xpReward: 80,
      coinReward: 25,
      happinessBoost: 20,
      thirstBoost: 10,
      coordinates_x: 55,
      coordinates_y: 70,
      category: MissionCategory.HAPPINESS,
    },
    {
      id: 'mission-weed-garden',
      sectorId: gardenSector.id,
      title: 'Onkruid wieden',
      description: 'Verwijder onkruid uit een hoek van de moestuin.',
      xpReward: 90,
      coinReward: 30,
      cleanlinessBoost: 35,
      coordinates_x: 60,
      coordinates_y: 60,
      category: MissionCategory.CLEANLINESS,
    },
  ];

  for (const mission of missions) {
    await prisma.mission.upsert({
      where: { id: mission.id },
      update: {},
      create: mission,
    });
  }

  console.log('✅ Seeding completed');
}
