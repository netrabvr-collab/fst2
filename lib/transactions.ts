import { prisma } from "./prisma";
import { sendEmail } from "./email";
import AlertEmail from "@/emails/alert";
import type { SessionUser } from "./session";

export const ALERT_THRESHOLD = 1000;

/** Shared by the Route Handler and the Server Action. */
export async function createTransaction(user: SessionUser, input: { amount: number; description?: string }) {
  if (user.role === "GUEST") throw new Error("FORBIDDEN");

  // Atomic: transaction + audit log either both persist or neither
  const tx = await prisma.$transaction(async (db) => {
    const t = await db.transaction.create({
      data: { amount: input.amount, description: input.description || null, userId: user.id },
    });
    await db.auditLog.create({
      data: { action: "TRANSACTION_CREATED", entity: "Transaction", entityId: t.id, userId: user.id, metadata: { amount: input.amount } },
    });
    return t;
  });

  // Critical activity alert AFTER the successful DB mutation
  if (input.amount >= ALERT_THRESHOLD) {
    await sendEmail({
      to: user.email, userId: user.id, type: "ALERT",
      subject: `Alert: transaction of ₹${input.amount}`,
      react: AlertEmail({ name: user.name, amount: input.amount, id: tx.id }),
    });
  }
  return tx;
}
