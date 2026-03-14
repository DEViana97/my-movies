import { compare, hash } from "bcryptjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Usuario deve ter no minimo 3 caracteres")
    .max(24, "Usuario deve ter no maximo 24 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Usuario aceita apenas letras, numeros, ponto, traco e underline"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

function fileExtensionFromType(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/webp") return "webp";
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      username: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const formData = await req.formData();
  const parsed = profileSchema.safeParse({
    username: String(formData.get("username") ?? ""),
    currentPassword: (formData.get("currentPassword") as string | null) ?? undefined,
    newPassword: (formData.get("newPassword") as string | null) ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos" }, { status: 400 });
  }

  const username = parsed.data.username.toLowerCase();
  const newPassword = parsed.data.newPassword?.trim();
  const currentPassword = parsed.data.currentPassword?.trim();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 });
  }

  const usernameInUse = await prisma.user.findFirst({
    where: {
      username,
      id: { not: user.id },
    },
    select: { id: true },
  });

  if (usernameInUse) {
    return NextResponse.json({ error: "Usuario ja esta em uso" }, { status: 409 });
  }

  let passwordHash = user.passwordHash;
  if (newPassword) {
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Nova senha deve ter no minimo 6 caracteres" }, { status: 400 });
    }

    if (user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Informe a senha atual para alterar a senha" }, { status: 400 });
      }

      const passwordValid = await compare(currentPassword, user.passwordHash);
      if (!passwordValid) {
        return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
      }
    }

    passwordHash = await hash(newPassword, 12);
  }

  let nextImage = user.image;
  const photo = formData.get("photo");

  if (photo instanceof File && photo.size > 0) {
    if (photo.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "A imagem deve ter no maximo 2MB" }, { status: 400 });
    }

    const ext = fileExtensionFromType(photo.type);
    if (!ext) {
      return NextResponse.json({ error: "Formato invalido. Use PNG, JPG ou WEBP" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${user.id}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    const fileBytes = Buffer.from(await photo.arrayBuffer());
    await writeFile(filePath, fileBytes);

    nextImage = `/uploads/profiles/${fileName}`;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      username,
      passwordHash,
      image: nextImage,
    },
    select: {
      name: true,
      username: true,
      email: true,
      image: true,
    },
  });

  return NextResponse.json(updated);
}