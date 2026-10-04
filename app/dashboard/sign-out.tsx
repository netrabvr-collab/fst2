"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
export default function SignOut() {
  const router = useRouter();
  return <button onClick={async () => { await authClient.signOut(); router.push("/login"); router.refresh(); }}>Sign out</button>;
}
