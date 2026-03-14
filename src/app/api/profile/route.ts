import { compare, hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";

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

function imageTypeFromSignature(bytes: Uint8Array) {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError(401, "UNAUTHORIZED", "Nao autenticado");
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
    return apiError(404, "NOT_FOUND", "Usuario nao encontrado");
  }

  return apiOk(user);
}

export async function PATCH(req: Request) {
  const limiter = checkRateLimit(`profile-patch:${getRequestIp(req)}`, {
    windowMs: 10 * 60 * 1000,
    limit: 20,
  });

  if (!limiter.allowed) {
    return apiError(429, "RATE_LIMITED", "Muitas tentativas. Tente novamente em instantes.", {
      retryAfterSeconds: limiter.retryAfterSeconds,
    });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError(401, "UNAUTHORIZED", "Nao autenticado");
  }

  const formData = await req.formData();
  const parsed = profileSchema.safeParse({
    username: String(formData.get("username") ?? ""),
    currentPassword: (formData.get("currentPassword") as string | null) ?? undefined,
    newPassword: (formData.get("newPassword") as string | null) ?? undefined,
  });

  if (!parsed.success) {
    return apiError(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Dados invalidos", parsed.error.flatten());
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
    return apiError(404, "NOT_FOUND", "Usuario nao encontrado");
  }

  const usernameInUse = await prisma.user.findFirst({
    where: {
      username,
      id: { not: user.id },
    },
    select: { id: true },
  });

  if (usernameInUse) {
    return apiError(409, "CONFLICT", "Usuario ja esta em uso");
  }

  let passwordHash = user.passwordHash;
  if (newPassword) {
    if (newPassword.length < 6) {
      return apiError(400, "VALIDATION_ERROR", "Nova senha deve ter no minimo 6 caracteres");
    }

    if (user.passwordHash) {
      if (!currentPassword) {
        return apiError(400, "VALIDATION_ERROR", "Informe a senha atual para alterar a senha");
      }

      const passwordValid = await compare(currentPassword, user.passwordHash);
      if (!passwordValid) {
        return apiError(400, "VALIDATION_ERROR", "Senha atual incorreta");
      }
    }

    passwordHash = await hash(newPassword, 12);
  }

  let nextImage = user.image;
  const photo = formData.get("photo");

  if (photo instanceof File && photo.size > 0) {
    if (photo.size > 2 * 1024 * 1024) {
      return apiError(400, "VALIDATION_ERROR", "A imagem deve ter no maximo 2MB");
    }

    const fileBytes = Buffer.from(await photo.arrayBuffer());
    const detectedType = imageTypeFromSignature(fileBytes);
    if (!detectedType) {
      return apiError(400, "VALIDATION_ERROR", "Arquivo invalido. Envie uma imagem PNG, JPG ou WEBP.");
    }

    const ext = fileExtensionFromType(detectedType);
    if (!ext) {
      return apiError(400, "VALIDATION_ERROR", "Formato invalido. Use PNG, JPG ou WEBP");
    }

    if (photo.type && photo.type !== detectedType) {
      return apiError(400, "VALIDATION_ERROR", "Tipo do arquivo nao corresponde ao conteudo da imagem.");
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${user.id}-${randomUUID()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
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

  return apiOk(updated);
}