import { hash } from "bcryptjs";
import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";

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
  const limiter = checkRateLimit(`register:${getRequestIp(req)}`, {
    windowMs: 10 * 60 * 1000,
    limit: 8,
  });

  if (!limiter.allowed) {
    return apiError(429, "RATE_LIMITED", "Muitas tentativas. Tente novamente em instantes.", {
      retryAfterSeconds: limiter.retryAfterSeconds,
    });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Dados invalidos", parsed.error.flatten());
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
    return apiError(409, "CONFLICT", "Usuario ja esta em uso");
  }

  if (existingUser?.email === email) {
    return apiError(409, "CONFLICT", "Email ja esta em uso");
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

  return apiOk({}, 201);
}