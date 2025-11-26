// prisma/seed.ts

// Import PrismaClient and the enums we defined in the schema
import { PrismaClient, MissionCategory, MissionStatus, SectorType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. We need a Class and a Sector first to link missions to.
  // Let's create a dummy class and sector if they don't exist.
  const teacher = await prisma.user.upsert({
    where: { username: 'teacher_demo' },
    update: {},
    create: {
      username: 'teacher_demo',
      password: 'password123', // In real app, hash this!
      role: 'TEACHER',
    }
  });

  const demoClass = await prisma.class.upsert({
    where: { classCode: 'DEMO101' },
    update: {},
    create: {
      name: 'Demo Class',
      school: 'Demo School',
      classCode: 'DEMO101',
      teacherId: teacher.id,
    }
  });

  // Create a general sector for the yard
  const yardSector = await prisma.sector.create({
    data: {
        name: 'Main Yard',
        type: SectorType.GARDEN,
        classId: demoClass.id
    }
  })


  console.log('...Deleting old missions to avoid duplicates...');
  await prisma.mission.deleteMany({});


  console.log('...Creating new map missions...');
  // Array of missions to insert with coordinates
  const missions = [
    {
      title: 'Water the Big Oak',
      description: 'The big oak tree near the playground looks thirsty.',
      xpReward: 15,
      coinReward: 10,
      coordinates_x: 25.5, // ~25% from left
      coordinates_y: 60.2, // ~60% from top
      category: MissionCategory.THIRST,
      status: MissionStatus.AVAILABLE,
      sectorId: yardSector.id, // Link to the sector we just created
    },
    {
      title: 'Feed the School Chickens',
      description: 'Go to the coop and give the chickens their grain.',
      xpReward: 20,
      coinReward: 15,
      coordinates_x: 78.0,
      coordinates_y: 35.5,
      category: MissionCategory.HUNGER,
      status: MissionStatus.AVAILABLE,
      sectorId: yardSector.id,
    },
    {
      title: 'Tidy the Flower Bed',
      description: 'Pick up any litter around the entrance flower bed.',
      xpReward: 10,
      coinReward: 5,
      coordinates_x: 45.0,
      coordinates_y: 85.0,
      category: MissionCategory.HAPPINESS,
      status: MissionStatus.AVAILABLE,
      sectorId: yardSector.id,
    },
  ];

  // Loop through and create each mission in the database
  for (const missionData of missions) {
    const mission = await prisma.mission.create({
      data: missionData,
    });
    console.log(`Created mission: ${mission.title}`);
  }

  console.log('✅ Seeding finished.');
}

// Execute the script
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });