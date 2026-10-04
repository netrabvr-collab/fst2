import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import WelcomeEmail from "@/emails/welcome";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      // role cannot be set by the client at sign-up (input: false)
      role: { type: "string", defaultValue: "MEMBER", input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Runs after the Prisma INSERT succeeded -> audit + welcome email
        after: async (user) => {
          await prisma.auditLog.create({
            data: { action: "USER_REGISTERED", entity: "User", entityId: user.id, userId: user.id },
          });
          await sendEmail({
            to: user.email, userId: user.id, type: "WELCOME",
            subject: "Welcome aboard!",
            react: WelcomeEmail({ name: user.name }),
          });
        },
      },
    },
  },
  plugins: [nextCookies()], // must be last
});
