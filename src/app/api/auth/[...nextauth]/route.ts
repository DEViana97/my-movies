import NextAuth from "next-auth";
import { apiError } from "@/lib/api-response";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";

const handler = NextAuth(authOptions);

type AuthRouteContext = {
  params: Promise<{
    nextauth?: string[];
  }>;
};

async function withRateLimit(req: Request, context: AuthRouteContext) {
  if (req.method === "GET") {
    return handler(req, context);
  }

  const limiter = checkRateLimit(`auth:${getRequestIp(req)}`, {
    windowMs: 10 * 60 * 1000,
    limit: 80,
  });

  if (!limiter.allowed) {
    return apiError(429, "RATE_LIMITED", "Muitas tentativas de autenticacao. Aguarde e tente novamente.", {
      retryAfterSeconds: limiter.retryAfterSeconds,
    });
  }

  return handler(req, context);
}

export const GET = withRateLimit;
export const POST = withRateLimit;
