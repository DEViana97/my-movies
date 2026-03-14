"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RegisterPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export function RegisterContent() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterPayload>({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const registerRes = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const registerData = await registerRes.json().catch(() => null);

    if (!registerRes.ok) {
      setIsSubmitting(false);
      setError(registerData?.error ?? "Nao foi possivel criar a conta.");
      return;
    }

    const signInRes = await signIn("credentials", {
      identifier: form.email,
      password: form.password,
      redirect: false,
      callbackUrl: "/",
    });

    setIsSubmitting(false);

    if (!signInRes || signInRes.error) {
      router.replace("/login");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-black/45 p-8 text-white shadow-2xl backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Criar conta</p>
        <h1 className="mt-3 text-4xl font-black leading-none">CineVault</h1>
        <p className="mt-3 text-sm text-white/70">Cadastre-se para salvar favoritos, assistir depois e historico.</p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Nome (opcional)"
            autoComplete="name"
          />
          <Input
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="Usuario"
            autoComplete="username"
            required
          />
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
            autoComplete="email"
            required
          />
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Senha (min. 6 caracteres)"
            autoComplete="new-password"
            required
            minLength={6}
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-white/70">
          Ja tem conta?{" "}
          <Link href="/login" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
            Entrar
          </Link>
        </p>
      </section>
    </main>
  );
}