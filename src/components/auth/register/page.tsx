"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/src/lib/inkstone-api";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try { await register(form.name, form.email, form.password); router.push("/"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Registration failed"); }
    finally { setLoading(false); }
  }
  return <main className="min-h-screen flex items-center justify-center bg-[#f0f0f0] p-4"><form onSubmit={submit} className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-4"><h1 className="text-4xl text-gray-900">Create account</h1>{error && <p className="text-sm text-red-600">{error}</p>}<input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full border rounded-xl p-3" /><input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full border rounded-xl p-3" /><input required minLength={8} type="password" placeholder="Password (8+ characters)" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full border rounded-xl p-3" /><button disabled={loading} className="w-full bg-black text-white rounded-xl py-3">{loading ? "Creating..." : "Create account"}</button></form></main>;
}
