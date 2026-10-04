import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { createTransaction } from "@/lib/transactions";

export async function GET() {
  const user = await getSessionUser(); // defense in depth (proxy already checked)
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const data = await prisma.transaction.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" }, take: 50,
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (user.role === "GUEST") return NextResponse.json({ error: "Guests are read-only" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount);
  if (!(amount > 0)) return NextResponse.json({ error: "amount must be > 0" }, { status: 400 });

  const tx = await createTransaction(user, { amount, description: body.description });
  return NextResponse.json(tx, { status: 201 });
}
