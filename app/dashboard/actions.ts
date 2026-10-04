"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/session";
import { createTransaction } from "@/lib/transactions";

// Server Action – session + role checked on the server, never trusted from the client
export async function addTransaction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "GUEST") return;
  const amount = Number(formData.get("amount"));
  if (!(amount > 0)) return;
  await createTransaction(user, { amount, description: String(formData.get("description") ?? "") });
  revalidatePath("/dashboard");
}
