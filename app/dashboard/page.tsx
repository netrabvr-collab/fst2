import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { addTransaction } from "./actions";
import SignOut from "./sign-out";

export default async function Dashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const txs = await prisma.transaction.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" }, take: 20,
  });

  return (
    <>
      <nav>
        <b>{user.name}</b> <span className="tag">{user.role}</span>
        {user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
        <SignOut />
      </nav>

      {user.role !== "GUEST" ? (
        <form className="card" action={addTransaction}>
          <h3>New transaction (≥ ₹1000 triggers an alert email)</h3>
          <input name="amount" type="number" step="0.01" placeholder="Amount" required />
          <input name="description" placeholder="Description" />
          <button>Add</button>
        </form>
      ) : <p className="card">Guest accounts are read-only.</p>}

      <div className="card">
        <h3>Transactions</h3>
        <table>
          <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id}>
                <td>{t.createdAt.toLocaleDateString()}</td><td>{t.description}</td>
                <td>₹{Number(t.amount).toFixed(2)}</td><td>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
