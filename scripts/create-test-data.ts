import { MissionCategory, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🌱 Creating test data for teacher dashboard...\n');

  try {
    // 1. Create test teacher
    console.log('👩‍🏫 Creating test teacher...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const teacher = await prisma.user.upsert({
      where: { username: 'teacher1' },
      update: {},
      create: {
        firstName: 'Test',
        lastName: 'Teacher',
        username: 'teacher1',
        password: hashedPassword,
        role: 'TEACHER',
      },
    });
    console.log(`   ✅ Teacher created: ${teacher.username} (ID: ${teacher.id})`);

    // 2. Create test class
    console.log('\n🏫 Creating test class...');
    const testClass = await prisma.class.upsert({
      where: { classCode: 'TEST01' },
      update: {},
      create: {
        name: 'Test Class 4A',
        school: 'Green Valley School',
        classCode: 'TEST01',
      },
    });
    console.log(`   ✅ Class created: ${testClass.name} (Code: ${testClass.classCode})`);

    // Add teacher as a member of the class
    await prisma.classUser.upsert({
      where: {
        classId_userId: {
          classId: testClass.id,
          userId: teacher.id,
        },
      },
      update: {},
      create: {
        classId: testClass.id,
        userId: teacher.id,
      },
    });

    // 3. Create mascot for the class
    console.log('\n🐸 Creating class mascot...');
    const mascot = await prisma.mascot.upsert({
      where: { classId: testClass.id },
      update: {},
      create: {
        classId: testClass.id,
        thirst: 75,
        hunger: 80,
        happiness: 90,
        cleanliness: 85,
        level: 3,
        xp: 250,
        coins: 150,
      },
    });
    console.log(`   ✅ Mascot created (Level ${mascot.level}, ${mascot.coins} coins)`);

    // 4. Create sectors
    console.log('\n🌳 Creating sectors...');
    const sectorTypes = [
      { name: 'Forest Area', type: 'TREES' },
      { name: 'Flower Garden', type: 'FLOWERS' },
      { name: 'Duck Pond', type: 'POND' },
      { name: 'Chicken Coop', type: 'CHICKENS' },
      { name: 'Vegetable Garden', type: 'GARDEN' },
    ] as const;

    const sectors = [];
    for (const sectorData of sectorTypes) {
      const sector = await prisma.sector.upsert({
        where: {
          id: `${testClass.id}-${sectorData.type}`,
        },
        update: {},
        create: {
          id: `${testClass.id}-${sectorData.type}`,
          classId: testClass.id,
          name: sectorData.name,
          type: sectorData.type,
        },
      });
      sectors.push(sector);
      console.log(`   ✅ Sector: ${sector.name}`);
    }


    // 5. Create missions for each sector
    console.log('\n🎯 Creating missions...');

    const sectorMissionsData = {
      "Forest Area": [
        { title: 'Path Clearer', description: 'Move fallen branches off the walking path.', xp: 15, coins: 5, category: MissionCategory.CLEANLINESS, cleanliness: 15 },
        { title: 'Big Tree Drink', description: 'Pour a bucket of water on the roots of the biggest tree.', xp: 20, coins: 15, category: MissionCategory.THIRST, thirst: 20 },
        { title: 'Acorn Hunter', description: 'Find 3 acorns or pinecones (food for squirrels!).', xp: 20, coins: 15, category: MissionCategory.HUNGER, hunger: 15 },
        { title: 'Mud Check', description: 'Check if the ground is too muddy to walk on.', xp: 10, coins: 5, category: MissionCategory.HAPPINESS, happiness: 5 },
        { title: 'Sign Cleaner', description: 'Wipe dirt off the area sign so it is easy to read.', xp: 10, coins: 5, category: MissionCategory.CLEANLINESS, cleanliness: 10 },
      ],
      "Flower Garden": [
        { title: 'Petal Pickup', description: 'Pick up fallen petals from the soil to keep it tidy.', xp: 10, coins: 5, category: MissionCategory.CLEANLINESS, cleanliness: 10 },
        { title: 'Soil Moisture', description: 'Touch the soil. If it is dry and dusty, water it.', xp: 15, coins: 10, category: MissionCategory.THIRST, thirst: 15 },
        { title: 'Plant Food', description: 'Sprinkle a little compost around the base (a snack for the plant).', xp: 20, coins: 15, category: MissionCategory.HUNGER, hunger: 10 },
        { title: 'Bug Check', description: 'Check leaves for holes (signs of bugs eating them).', xp: 15, coins: 10, category: MissionCategory.HAPPINESS, happiness: 15 },
        { title: 'Deadhead', description: 'Pinch off brown, dry flower heads.', xp: 25, coins: 20, category: MissionCategory.CLEANLINESS, cleanliness: 20 },
      ],
      "Vegetable Garden": [
        { title: 'Vegetable Harvest', description: 'Find a vegetable that is ready and pick it.', xp: 25, coins: 20, category: MissionCategory.HUNGER, hunger: 20 },
        { title: 'Water Can Fill', description: 'Fill the watering can and water the rows.', xp: 15, coins: 10, category: MissionCategory.THIRST, thirst: 15 },
        { title: 'Rock Remover', description: 'Remove stones from the vegetable beds.', xp: 10, coins: 5, category: MissionCategory.CLEANLINESS, cleanliness: 10 },
        { title: 'Leaf Scout', description: 'Find the biggest, healthiest green leaf you can.', xp: 10, coins: 5, category: MissionCategory.HAPPINESS, happiness: 10 },
        { title: 'Compost Check', description: 'Take old plant scraps to the compost bin.', xp: 20, coins: 15, category: MissionCategory.CLEANLINESS, cleanliness: 20 },
      ],
      "Duck Pond": [
        { title: 'Surface Skim', description: 'Use the net to remove leaves floating on top.', xp: 20, coins: 15, category: MissionCategory.CLEANLINESS, cleanliness: 20 },
        { title: 'Water Level', description: 'Check if the water level is high enough.', xp: 10, coins: 5, category: MissionCategory.THIRST, thirst: 5 },
        { title: 'Duck Food', description: 'Toss food pellets into the water.', xp: 15, coins: 10, category: MissionCategory.HUNGER, hunger: 15 },
        { title: 'Ripple Maker', description: 'Throw a small pebble in the middle and watch the ripples.', xp: 10, coins: 5, category: MissionCategory.HAPPINESS, happiness: 10 },
        { title: 'Edge Cleanup', description: 'Remove trash from the grassy edge of the pond.', xp: 15, coins: 10, category: MissionCategory.CLEANLINESS, cleanliness: 15 },
      ],
      "Chicken Coop": [
        { title: 'Water Refill', description: 'Fill the chicken waterer with fresh water.', xp: 20, coins: 15, category: MissionCategory.THIRST, thirst: 20 },
        { title: 'Feed Scoop', description: 'Add a scoop of grain to the feeder.', xp: 15, coins: 10, category: MissionCategory.HUNGER, hunger: 20 },
        { title: 'Door Check', description: 'Make sure the coop door latch works properly.', xp: 10, coins: 5, category: MissionCategory.HAPPINESS, happiness: 15 },
        { title: 'Straw Check', description: 'Check if the straw bedding is dry.', xp: 10, coins: 5, category: MissionCategory.CLEANLINESS, cleanliness: 10 },
        { title: 'Egg Search', description: 'Look in the nesting boxes for eggs.', xp: 25, coins: 20, category: MissionCategory.HUNGER, hunger: 15 },
      ],
    };

    const missions = [];
    for (const [sectorName, missionList] of Object.entries(sectorMissionsData)) {

      const sector = await prisma.sector.findFirst({
        where: { name: sectorName }
      });

      if (!sector) {
        console.log(`⚠️  Sector "${sectorName}" not found in DB. Skipping.`);
        continue;
      }

      console.log(`📍 Seeding missions for: ${sectorName}...`);

      for (const template of missionList) {
        const mission = await prisma.mission.create({
          data: {
            sectorId: sector.id,
            title: template.title,
            description: template.description,
            xpReward: template.xp,
            coinReward: template.coins,
            thirstBoost: template.thirst || 0,
            hungerBoost: template.hunger || 0,
            happinessBoost: template.happiness || 0,
            cleanlinessBoost: template.cleanliness || 0,
            requiresPhoto: true,
            category: template.category,
            status: 'AVAILABLE',
          },
        });
        missions.push(mission);
        console.log(`   ✅ Mission: ${mission.title}`);
      }
    }

    // 6. Create test students
    console.log('\n👨‍🎓 Creating test students...');
    const studentNames = [
      { username: 'student1', firstName: 'Alice', lastName: 'Smith' },
      { username: 'student2', firstName: 'Bob', lastName: 'Johnson' },
      { username: 'student3', firstName: 'Charlie', lastName: 'Brown' },
    ];
    const students = [];

    for (const data of studentNames) {
      const student = await prisma.user.upsert({
        where: { username: data.username },
        update: {},
        create: {
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          password: hashedPassword,
          role: 'STUDENT',
        },
      });

      // Add student as a member of the class
      await prisma.classUser.upsert({
        where: {
          classId_userId: {
            classId: testClass.id,
            userId: student.id,
          },
        },
        update: {},
        create: {
          classId: testClass.id,
          userId: student.id,
        },
      });

      students.push(student);
      console.log(`   ✅ Student: ${student.username}`);
    }

    // 7. Create test submissions (pending review)
    console.log('\n📝 Creating test submissions...');
    for (let i = 0; i < 3; i++) {
      const submission = await prisma.submission.create({
        data: {
          missionId: missions[i].id,
          userId: students[i].id,
          classId: testClass.id,
          photoUrl: `https://picsum.photos/seed/${i}/400/300`,
          status: 'PENDING',
        },
      });
      console.log(`   ✅ Submission from ${students[i].username} for "${missions[i].title}"`);
    }

    console.log('\n🛒 Seeding shop items...');
    try {
      const result = await prisma.shopItem.createMany({
        data: [
          {
            id: 'hat-red-cap',
            name: 'Red Cap',
            description: 'A stylish red cap for Groeny.',
            type: 'HAT',
            price: 50,
            imageUrl: '/assets/shop/red-cap.png'
          },
          {
            id: 'hat-blue-cap',
            name: 'Blue Cap',
            description: 'A cool blue cap for Groeny.',
            type: 'HAT',
            price: 50,
            imageUrl: '/assets/shop/blue-cap.png'
          },
          {
            id: 'acc-bow-tie',
            name: 'Bow Tie',
            description: 'A fancy bow tie accessory.',
            type: 'ACCESSORY',
            price: 75,
            imageUrl: '/assets/shop/bow-tie.png'
          },
          {
            id: 'acc-sunglasses',
            name: 'Sunglasses',
            description: 'Looks cool in the sun.',
            type: 'ACCESSORY',
            price: 90,
            imageUrl: '/assets/shop/sunglasses.png'
          }
        ],
        skipDuplicates: true
      });

      console.log(`   ✅ Shop items seeded. Inserted: ${result.count}`);
    } catch (e) {
      console.error('   ❌ Shop seeding failed:', e);
    }



    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✨ Test data created successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('   Teacher: teacher1 / password123');
    console.log('   Students: student1, student2, student3 / password123');
    console.log(`\n   Teacher ID: ${teacher.id}`);
    console.log(`   Class Code: ${testClass.classCode}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
