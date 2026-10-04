import { PrismaClient } from "@prisma/client";
import { fakerEN_IN as faker } from "@faker-js/faker"; // localized (India) data
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();
const PASSWORD = "Password123!";

async function main() {
  faker.seed(42);
  const hash = await hashPassword(PASSWORD);

  // 1 admin + 19 random users with weighted roles
  const people = [
    { name: "Admin User", email: "admin@example.com", role: "ADMIN" },
    ...Array.from({ length: 19 }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      role: faker.helpers.weightedArrayElement([
        { weight: 6, value: "MEMBER" },
        { weight: 3, value: "GUEST" },
        { weight: 1, value: "ADMIN" },
      ]),
    })),
  ];

  for (const p of people) {
    const id = faker.string.alphanumeric(32);
    const user = await prisma.user.create({
      data: {
        id, ...p, emailVerified: true,
        // credential account so seeded users can actually log in
        accounts: { create: { id: faker.string.alphanumeric(32), accountId: id, providerId: "credential", password: hash } },
      },
    });

    await prisma.auditLog.create({
      data: { action: "USER_REGISTERED", entity: "User", entityId: user.id, userId: user.id, metadata: { seeded: true } },
    });

    if (user.role === "GUEST") continue; // guests are read-only
    for (let i = 0; i < faker.number.int({ min: 3, max: 8 }); i++) {
      const amount = faker.number.float({ min: 100, max: 5000, fractionDigits: 2 });
      const t = await prisma.transaction.create({
        data: {
          amount, userId: user.id,
          status: faker.helpers.arrayElement(["COMPLETED", "COMPLETED", "PENDING", "FAILED"]),
          description: faker.commerce.productName(),
          createdAt: faker.date.recent({ days: 60 }),
        },
      });
      await prisma.auditLog.create({
        data: { action: "TRANSACTION_CREATED", entity: "Transaction", entityId: t.id, userId: user.id, metadata: { amount } },
      });
    }

    await prisma.emailLog.create({
      data: {
        to: user.email, subject: "Welcome aboard!", type: "WELCOME", userId: user.id,
        resendId: `seed_${faker.string.uuid()}`,
        status: faker.helpers.arrayElement(["DELIVERED", "DELIVERED", "DELIVERED", "BOUNCED"]),
      },
    });
  }

  console.log(`Seeded ${await prisma.user.count()} users, ${await prisma.transaction.count()} transactions, ${await prisma.auditLog.count()} audit logs, ${await prisma.emailLog.count()} email logs`);
  console.log(`Login with admin@example.com / ${PASSWORD}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
