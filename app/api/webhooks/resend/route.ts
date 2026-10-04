import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

// Public endpoint (not in proxy matcher) – authenticity is proven by the Svix signature.
const STATUS: Record<string, string> = {
  "email.sent": "SENT",
  "email.delivered": "DELIVERED",
  "email.bounced": "BOUNCED",
  "email.complained": "COMPLAINED",
  "email.delivery_delayed": "DELAYED",
};

export async function POST(req: Request) {
  const payload = await req.text(); // raw body is required for signature verification
  let event: { type: string; data: { email_id: string; bounce?: { message?: string } } };
  try {
    event = new Webhook(process.env.RESEND_WEBHOOK_SECRET!).verify(payload, {
      "svix-id": req.headers.get("svix-id")!,
      "svix-timestamp": req.headers.get("svix-timestamp")!,
      "svix-signature": req.headers.get("svix-signature")!,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const status = STATUS[event.type];
  if (status) {
    const res = await prisma.emailLog.updateMany({
      where: { resendId: event.data.email_id },
      data: { status, error: event.data.bounce?.message ?? null },
    });
    await prisma.auditLog.create({
      data: { action: event.type.toUpperCase().replace(".", "_"), entity: "EmailLog", entityId: event.data.email_id, metadata: { matched: res.count } },
    });
  }
  return NextResponse.json({ ok: true });
}
