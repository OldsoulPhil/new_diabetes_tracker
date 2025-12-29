import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const userAmount = 10;
const categories = [
  "Fruits",
  "Grains",
  "Dairy",
  "Vegetables",
  "Protein",
  "Sugars",
  "None",
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Only delete seeded users with @seed.test emails
  console.log("🗑️  Removing existing seeded test users...");
  const seededUsers = await prisma.user.findMany({
    where: {
      email: {
        endsWith: "@seed.test",
      },
    },
    select: { id: true },
  });

  if (seededUsers.length > 0) {
    // Delete related data first
    await prisma.foodEntry.deleteMany({
      where: {
        userId: {
          in: seededUsers.map((u) => u.id),
        },
      },
    });
    await prisma.glucoseEntry.deleteMany({
      where: {
        userId: {
          in: seededUsers.map((u) => u.id),
        },
      },
    });
    // Then delete the seeded users
    await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: "@seed.test",
        },
      },
    });
    console.log(`   ✓ Removed ${seededUsers.length} seeded users`);
  } else {
    console.log("   ℹ No seeded users found to remove");
  }

  console.log("📝 Generating fake users with Faker.js...");

  // Create users with fake data using @seed.test emails
  for (let i = 0; i < userAmount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `testuser${i + 1}@seed.test`; // Use predictable emails
    const password = faker.internet.password();
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
        glucoseEntries: {
          create: Array.from({ length: 5 }, () => ({
            glucose: faker.number.int({ min: 70, max: 200 }),
            timestamp: faker.date.past(),
          })),
        },
        foodEntries: {
          create: Array.from({ length: 5 }, () => ({
            food: faker.food.dish(),
            carb: faker.number.int({ min: 10, max: 50 }),
            timestamp: faker.date.past(),
            favorite: faker.datatype.boolean(),
            category: faker.helpers.arrayElement(categories),
          })),
        },
      },
    });

    console.log(`   ✓ Created user ${i + 1}/${userAmount}: ${email}`);
  }

  console.log("\n✅ Database seeded successfully with random data!");
  console.log(
    `📊 Created ${userAmount} users with 5 glucose entries and 5 food entries each`
  );
  console.log(
    "\n💡 Tip: All passwords are hashed. Register a new account or modify the seed to add a known user."
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
