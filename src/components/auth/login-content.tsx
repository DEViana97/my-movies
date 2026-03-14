"use client";

import { Chrome } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMovieUIStore } from "@/store/use-movie-ui-store";

export function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const showToast = useMovieUIStore((state) => state.showToast);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);

  async function onCredentialsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    setIsSubmitting(false);

    if (!res || res.error) {
      setError("Email/usuario ou senha invalidos.");
      showToast("Email/usuario ou senha invalidos.", "error");
      return;
    }

    showToast("Login realizado com sucesso", "success");
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-black/45 p-8 text-white shadow-2xl backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Bem-vindo</p>
        <h1 className="mt-3 text-4xl font-black leading-none">CineDEViana</h1>
        <p className="mt-3 text-sm text-white/70">Entre com email/usuario e senha, ou use sua conta Google.</p>

        <form className="mt-6 space-y-3" onSubmit={onCredentialsSubmit}>
          <Input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email ou usuario"
            autoComplete="username"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            autoComplete="current-password"
            required
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || status === "loading"}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="my-5 h-px w-full bg-white/10" />

        <Button
          type="button"
          size="lg"
          className="w-full gap-2"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          disabled={status === "loading"}
        >
          <Chrome size={18} />
          Entrar com Google
        </Button>

        <p className="mt-5 text-sm text-white/70">
          Nao tem conta?{" "}
          <Link href="/register" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
            Criar conta
          </Link>
        </p>
      </section>
    </main>
  );
}