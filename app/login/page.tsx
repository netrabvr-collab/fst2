"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [f, setF] = useState({ name: "", email: "admin@example.com", password: "Password123!" });
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const { error } = mode === "in"
      ? await authClient.signIn.email({ email: f.email, password: f.password })
      : await authClient.signUp.email({ name: f.name, email: f.email, password: f.password });
    if (error) return setErr(error.message ?? "Failed");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>{mode === "in" ? "Sign in" : "Register"}</h2>
      {mode === "up" && <input placeholder="Name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}
      <input type="email" placeholder="Email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input type="password" placeholder="Password (min 8)" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <button>{mode === "in" ? "Sign in" : "Create account"}</button>
      <p style={{ color: "crimson" }}>{err}</p>
      <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === "in" ? "up" : "in"); }}>
        {mode === "in" ? "No account? Register" : "Have an account? Sign in"}
      </a>
    </form>
  );
}
