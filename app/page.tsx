import Link from "next/link";
export default function Home() {
  return (
    <div className="card">
      <h1>Secure Full-Stack App</h1>
      <p>Prisma + Better Auth + RBAC proxy + Resend/React Email.</p>
      <Link href="/login">Sign in / Register</Link>
    </div>
  );
}
