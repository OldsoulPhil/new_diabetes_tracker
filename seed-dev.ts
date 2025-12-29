import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function autoSeedTestUsers() {
  const testUsers = [
    {
      email: "testuser1@example.com",
      password: "password123",
      // ...other fields as needed
    },
    {
      email: "testuser2@example.com",
      password: "password456",
      // ...other fields as needed
    },
  ];

  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log("Test users seeded!");
}

// To run the seeding:
autoSeedTestUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
