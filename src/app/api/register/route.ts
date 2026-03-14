import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().trim().max(80).optional(),
  username: z
    .string()
    .trim()
    .min(3, "Usuario deve ter ao menos 3 caracteres")
    .max(24, "Usuario deve ter no maximo 24 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Usuario aceita apenas letras, numeros, ponto, traco e underline"),
  email: z.string().trim().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres").max(72),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos" }, { status: 400 });
  }

  const username = parsed.data.username.toLowerCase();
  const email = parsed.data.email.toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
    select: { username: true, email: true },
  });

  if (existingUser?.username === username) {
    return NextResponse.json({ error: "Usuario ja esta em uso" }, { status: 409 });
  }

  if (existingUser?.email === email) {
    return NextResponse.json({ error: "Email ja esta em uso" }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name?.trim() || null,
      username,
      email,
      passwordHash,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}