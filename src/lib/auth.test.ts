import { beforeEach, describe, expect, it, vi } from "vitest";

type MockedAsyncCompare = {
  mockResolvedValueOnce: (value: boolean) => unknown;
};

vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}));

vi.mock("next-auth/providers/google", () => ({
  default: vi.fn(() => ({ id: "google", name: "Google", type: "oauth" })),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: (options: Record<string, unknown>) => ({ ...options, id: "credentials", type: "credentials" }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  compare: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("authOptions credentials provider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns null when credentials are missing", async () => {
    const { authOptions } = await import("@/lib/auth");
    const provider = authOptions.providers[0] as { authorize?: (credentials?: Record<string, string>) => Promise<unknown> };

    const result = await provider.authorize?.({ identifier: "", password: "" });

    expect(result).toBeNull();
  });

  it("returns null when password does not match", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { compare } = await import("bcryptjs");
    const compareMock = compare as unknown as MockedAsyncCompare;

    const mockedPrisma = prisma as unknown as {
      user: {
        findFirst: ReturnType<typeof vi.fn>;
      };
    };

    mockedPrisma.user.findFirst.mockResolvedValueOnce({
      id: "u1",
      name: "Mateus",
      username: "mateus",
      email: "mateus@email.com",
      image: null,
      passwordHash: "hashed",
    });

    compareMock.mockResolvedValueOnce(false);

    const { authOptions } = await import("@/lib/auth");
    const provider = authOptions.providers[0] as { authorize?: (credentials?: Record<string, string>) => Promise<unknown> };

    const result = await provider.authorize?.({ identifier: "mateus@email.com", password: "123456" });

    expect(result).toBeNull();
  });

});
