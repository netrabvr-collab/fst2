import { headers } from "next/headers";
import { auth } from "./auth";

export type SessionUser = { id: string; name: string; email: string; role: string };

/** Server-side session lookup for Route Handlers, Server Components & Server Actions. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user as unknown as SessionUser;
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}
