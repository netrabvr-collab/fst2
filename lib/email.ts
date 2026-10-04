import { Resend } from "resend";
import type { ReactElement } from "react";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

/** Sends a React Email template via Resend and records it in EmailLog. Never throws. */
export async function sendEmail(opts: {
  to: string; subject: string; type: "WELCOME" | "ALERT"; userId?: string; react: ReactElement;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM, to: opts.to, subject: opts.subject, react: opts.react,
    });
    await prisma.emailLog.create({
      data: {
        to: opts.to, subject: opts.subject, type: opts.type, userId: opts.userId,
        resendId: data?.id, status: error ? "FAILED" : "SENT", error: error?.message,
      },
    });
  } catch (e) {
    console.error("[email] failed:", e);
    await prisma.emailLog.create({
      data: { to: opts.to, subject: opts.subject, type: opts.type, userId: opts.userId, status: "FAILED", error: String(e) },
    }).catch(() => {});
  }
}
