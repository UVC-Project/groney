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
    const missionTemplates = [
      { title: 'Water the trees', description: 'Help keep our trees healthy by watering them', xp: 15, coins: 10, thirst: 5, coordinates_x: 25.0, coordinates_y: 30.0, category: MissionCategory.THIRST},
      { title: 'Plant new flowers', description: 'Add beautiful flowers to our garden', xp: 20, coins: 15, happiness: 10, coordinates_x: 40.0, coordinates_y: 50.0, category: MissionCategory.HAPPINESS},
      { title: 'Feed the ducks', description: 'Give the ducks their daily food', xp: 10, coins: 5, hunger: 5, coordinates_x: 60.0, coordinates_y: 20.0, category: MissionCategory.HUNGER},
      { title: 'Collect eggs', description: 'Gather fresh eggs from the chicken coop', xp: 15, coins: 20, hunger: 10, coordinates_x: 15.0, coordinates_y: 70.0, category: MissionCategory.HUNGER},
      { title: 'Weed the garden', description: 'Remove weeds from the vegetable garden', xp: 25, coins: 15, cleanliness: 15, coordinates_x: 80.0, coordinates_y: 40.0, category: MissionCategory.CLEANLINESS},
    ];

    const missions = [];
    for (let i = 0; i < sectors.length; i++) {
      const template = missionTemplates[i];
      const mission = await prisma.mission.create({
        data: {
          sectorId: sectors[i].id,
          title: template.title,
          description: template.description,
          xpReward: template.xp,
          coinReward: template.coins,
          thirstBoost: template.thirst || 0,
          hungerBoost: template.hunger || 0,
          happinessBoost: template.happiness || 0,
          cleanlinessBoost: template.cleanliness || 0,
          requiresPhoto: true,
          coordinates_x: template.coordinates_x || 0,
          coordinates_y: template.coordinates_y || 0,
          category: template.category,
        },
      });
      missions.push(mission);
      console.log(`   ✅ Mission: ${mission.title}`);
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
