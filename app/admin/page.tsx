import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Protected by proxy.ts (ADMIN only)
export default async function Admin() {
  const [users, audits, emails] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 25, include: { _count: { select: { transactions: true } } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
    prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
  ]);
  return (
    <>
      <nav><Link href="/dashboard">← Dashboard</Link></nav>
      <div className="card"><h3>Users</h3><table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Txns</th></tr></thead>
        <tbody>{users.map((u) => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u._count.transactions}</td></tr>)}</tbody>
      </table></div>
      <div className="card"><h3>Email delivery log</h3><table>
        <thead><tr><th>To</th><th>Type</th><th>Status</th><th>Updated</th></tr></thead>
        <tbody>{emails.map((e) => <tr key={e.id}><td>{e.to}</td><td>{e.type}</td><td>{e.status}</td><td>{e.updatedAt.toLocaleString()}</td></tr>)}</tbody>
      </table></div>
      <div className="card"><h3>Audit log</h3><table>
        <thead><tr><th>When</th><th>Action</th><th>Entity</th></tr></thead>
        <tbody>{audits.map((a) => <tr key={a.id}><td>{a.createdAt.toLocaleString()}</td><td>{a.action}</td><td>{a.entity}</td></tr>)}</tbody>
      </table></div>
    </>
  );
}
