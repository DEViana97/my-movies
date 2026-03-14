"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProfileFormProps = {
  initial: {
    username: string;
    email: string;
    image?: string | null;
  };
};

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();

  const [username, setUsername] = useState(initial.username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const previewUrl = useMemo(() => {
    if (!photoFile) return initial.image ?? null;
    return URL.createObjectURL(photoFile);
  }, [photoFile, initial.image]);

  const initialLabel = (username.trim()[0] ?? "U").toUpperCase();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFeedback(null);
    setIsSaving(true);

    const formData = new FormData();
    formData.set("username", username);
    if (currentPassword.trim()) formData.set("currentPassword", currentPassword);
    if (newPassword.trim()) formData.set("newPassword", newPassword);
    if (photoFile) formData.set("photo", photoFile);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      body: formData,
    });

    const data = (await res.json().catch(() => null)) as
      | { username?: string; image?: string | null; name?: string | null; error?: string }
      | null;

    setIsSaving(false);

    if (!res.ok) {
      setError(data?.error ?? "Nao foi possivel atualizar seu perfil");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setFeedback("Perfil atualizado com sucesso");
    await update({ username: data?.username, image: data?.image, name: data?.name });
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-black/[0.08] bg-white shadow-sm dark:border-white/10 dark:bg-black/35 dark:shadow-none p-5 md:p-7">
      <h1 className="text-4xl font-black">Meu Perfil</h1>
      <p className="mt-2 text-sm text-foreground/60">Edite seu usuario, troque a senha e escolha sua foto de perfil.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          <p className="text-sm font-semibold">Foto de perfil</p>
          <div className="h-28 w-28 overflow-hidden rounded-full border border-black/[0.12] bg-foreground/[0.06] dark:border-white/20 dark:bg-white/10">
            {previewUrl ? (
              <Image src={previewUrl} alt="Foto de perfil" width={112} height={112} className="h-full w-full object-cover" unoptimized />
            ) : (
              <div className="grid h-full w-full place-items-center text-3xl font-black text-foreground/80">{initialLabel}</div>
            )}
          </div>
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="h-auto py-2"
          />
          <p className="text-xs text-foreground/55">PNG, JPG ou WEBP ate 2MB.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="profile-email">
              Email
            </label>
            <Input id="profile-email" value={initial.email} disabled />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="profile-username">
              Usuario
            </label>
            <Input
              id="profile-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={24}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="profile-current-password">
                Senha atual
              </label>
              <Input
                id="profile-current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Obrigatoria para trocar senha"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="profile-new-password">
                Nova senha
              </label>
              <Input
                id="profile-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                placeholder="Minimo de 6 caracteres"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {feedback ? <p className="text-sm text-emerald-300">{feedback}</p> : null}

          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar alteracoes"}
          </Button>
        </div>
      </form>
    </section>
  );
}