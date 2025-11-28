import { PrismaClient, MissionCategory, MissionStatus, SectorType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo teacher, class, sector, and missions...');

  // 1. Create a teacher user
  const teacher = await prisma.user.create({
    data: {
      username: 'teacher_demo',
      password: 'password123', // remember: hash in real app!
      role: UserRole.TEACHER,
    },
  });

  // 2. Create a class that belongs to that teacher
  const demoClass = await prisma.class.create({
    data: {
      name: 'Demo Class',
      school: 'Demo School',
      classCode: 'DEMO100',
      teacherId: teacher.id,
    },
  });

  // 3. Create a sector with a few missions
  await prisma.sector.create({
    data: {
      name: 'Main Yard',
      type: SectorType.GARDEN,
      classId: demoClass.id,
      missions: {
        create: [
          {
            title: 'Water the Big Oak',
            description: 'The big oak tree near the playground looks thirsty.',
            xpReward: 15,
            coinReward: 10,
            category: MissionCategory.THIRST,
            status: MissionStatus.AVAILABLE,
            coordinates_x: 25.5,
            coordinates_y: 60.2,
          },
          {
            title: 'Feed the School Chickens',
            description: 'Go to the coop and give the chickens their grain.',
            xpReward: 20,
            coinReward: 15,
            category: MissionCategory.HUNGER,
            status: MissionStatus.AVAILABLE,
            coordinates_x: 78.0,
            coordinates_y: 35.5,
          },
          {
            title: 'Tidy the Flower Bed',
            description: 'Pick up any litter around the entrance flower bed.',
            xpReward: 10,
            coinReward: 5,
            category: MissionCategory.HAPPINESS,
            status: MissionStatus.AVAILABLE,
            coordinates_x: 45.0,
            coordinates_y: 85.0,
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
